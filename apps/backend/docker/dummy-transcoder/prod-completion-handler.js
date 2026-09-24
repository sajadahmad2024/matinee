// PROD COMPLETION HANDLER TEMPLATE — EventBridge `MediaConvert Job State Change` → finalize the
// media row. Paired with prod-handler.js (which submits the job). Not wired in yet.
//
// Terraform: a second aws_lambda_function (same image, CMD ["prod-completion-handler.handler"])
// + aws_cloudwatch_event_rule matching
//   { "source": ["aws.mediaconvert"], "detail-type": ["MediaConvert Job State Change"],
//     "detail": { "status": ["COMPLETE", "ERROR", "CANCELED"] } }
// + aws_cloudwatch_event_target → this Lambda.
//
// Writes are guarded on `processing_job_id = <this job>` + `deleted_at IS NULL`: a stale or
// duplicate event, a job for a deleted asset, or a job superseded by a re-upload can never
// flip the row. DB errors are rethrown so EventBridge's async-invoke retries apply.

const { consoleLogger, insertEvent, openDatabase, withTx } = require('./lib');

/** "s3://bucket/media/…/hls/master.m3u8" → "media/…/hls/master.m3u8" */
function keyFromS3Uri(uri) {
  return String(uri).replace(/^s3:\/\/[^/]+\//, '');
}

function createHandler({ openDb, log = consoleLogger() }) {
  return async function handler(event) {
    const detail = event?.detail ?? {};
    const { status, jobId, errorMessage } = detail;
    const mediaId = detail.userMetadata?.mediaId;
    if (!mediaId || !jobId) {
      log.warn(`ignoring event without mediaId/jobId (job=${jobId}, status=${status})`);
      return { ok: false, reason: 'uncorrelated event' };
    }

    const db = await openDb();
    try {
      if (status === 'COMPLETE') {
        const groups = detail.outputGroupDetails ?? [];
        const hls = groups.find((g) => g.type === 'HLS_GROUP');
        const masterUri = hls?.playlistFilePaths?.[0];
        if (!masterUri) {
          throw new Error(`COMPLETE event for job ${jobId} has no HLS playlist path`);
        }
        const masterKey = keyFromS3Uri(masterUri);
        const deliveryPrefix = masterKey.replace(/[^/]*$/, '');
        const first = hls.outputDetails?.[0];

        const done = await withTx(db, async () => {
          const r = await db.query(
            `/* finalize */ UPDATE media_metadata
             SET status='ready', is_hls=true, hls_master_key=$3, delivery_prefix=$4,
                 width=$5, height=$6, duration_seconds=$7,
                 processing_progress=100, processed_at=NOW(), updated_at=NOW()
             WHERE id=$1 AND status='processing' AND processing_job_id=$2 AND deleted_at IS NULL
             RETURNING id`,
            [
              mediaId,
              jobId,
              masterKey,
              deliveryPrefix,
              first?.videoDetails?.widthInPx ?? null,
              first?.videoDetails?.heightInPx ?? null,
              first?.durationInMs ? String(Math.round(first.durationInMs / 1000)) : null,
            ],
          );
          if (r.rows.length) {
            await insertEvent(db, mediaId, 'ready', `MediaConvert job ${jobId} complete`, 100);
          }
          return r.rows.length > 0;
        });
        log.info(done ? `[${mediaId}] → ready (${masterKey})` : `[${mediaId}] job ${jobId} no longer owns row — ignored`);
        return { ok: done };
      }

      const reason = errorMessage || `MediaConvert job ${jobId} ${status}`;
      const failed = await withTx(db, async () => {
        const r = await db.query(
          `/* fail-owned */ UPDATE media_metadata
           SET status='failed', processing_error=$3, updated_at=NOW()
           WHERE id=$1 AND status='processing' AND processing_job_id=$2 AND deleted_at IS NULL
           RETURNING id`,
          [mediaId, jobId, String(reason).slice(0, 2000)],
        );
        if (r.rows.length) {
          await insertEvent(db, mediaId, 'failed', reason);
        }
        return r.rows.length > 0;
      });
      log.info(failed ? `[${mediaId}] → failed: ${reason}` : `[${mediaId}] job ${jobId} no longer owns row — ignored`);
      return { ok: failed };
    } finally {
      await db.end().catch(() => {});
    }
  };
}

let defaultHandler;
exports.handler = async function handler(event) {
  defaultHandler = defaultHandler || createHandler({ openDb: openDatabase });
  return defaultHandler(event);
};
exports.createHandler = createHandler;
