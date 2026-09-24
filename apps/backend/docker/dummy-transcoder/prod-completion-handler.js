// PROD COMPLETION HANDLER — subscribes to EventBridge `MediaConvert Job State Change` events
// and marks the media_metadata row `ready` (or `failed`) when MediaConvert finishes.
//
// See prod-handler.js for the paired job-submission Lambda.
//
// Wire in Terraform (a second aws_lambda_function using the same container image with
// CMD ["prod-completion-handler.handler"]) + an aws_cloudwatch_event_rule matching:
//   {
//     "source": ["aws.mediaconvert"],
//     "detail-type": ["MediaConvert Job State Change"],
//     "detail": { "status": ["COMPLETE", "ERROR", "CANCELED"] }
//   }
// + aws_cloudwatch_event_target pointing at this Lambda.
//
// The event correlates back to our media row via UserMetadata.mediaId (set in prod-handler).

const { Client } = require('pg');

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) throw new Error('DATABASE_URL env is required');

exports.handler = async function handler(event) {
  const detail = event.detail || {};
  const status = detail.status;
  const jobId = detail.jobId;
  const mediaId = detail.userMetadata?.mediaId;
  const errorMessage = detail.errorMessage;

  if (!mediaId) {
    console.warn(`no mediaId in event.detail.userMetadata — jobId=${jobId}, status=${status}`);
    return { ok: false, reason: 'no mediaId' };
  }

  const outputGroupDetails = detail.outputGroupDetails || [];
  const hlsGroup = outputGroupDetails.find((g) => g.type === 'HLS_GROUP');
  // The master playlist path from MediaConvert. Falls back to convention if not surfaced.
  const masterKeyFromEvent = hlsGroup?.playlistFilePaths?.[0]; // s3://bucket/prefix/master.m3u8

  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();
  try {
    if (status === 'COMPLETE') {
      const { rows } = await db.query(
        `SELECT storage_key FROM media_metadata WHERE id = $1`,
        [mediaId],
      );
      const row = rows[0];
      if (!row) {
        console.warn(`[${mediaId}] row disappeared before COMPLETE — skipping`);
        return { ok: false };
      }
      const assetRoot = String(row.storage_key || '').replace(/\/original\/[^/]*$/, '/');
      const deliveryPrefix = `${assetRoot}hls/`;
      const masterKey = masterKeyFromEvent
        ? masterKeyFromEvent.replace(/^s3:\/\/[^/]+\//, '')
        : `${deliveryPrefix}master.m3u8`;

      // Video metadata that MediaConvert reports on completion.
      const outputVideo = detail.outputGroupDetails?.[0]?.outputDetails?.[0]?.videoDetails;
      const durationMs = detail.outputGroupDetails?.[0]?.outputDetails?.[0]?.durationInMs;

      await db.query(
        `UPDATE media_metadata
         SET status='ready',
             is_hls=true,
             hls_master_key=$1,
             delivery_prefix=$2,
             processing_progress=100,
             processed_at=NOW(),
             width=$3,
             height=$4,
             duration_seconds=$5,
             updated_at=NOW()
         WHERE id=$6`,
        [
          masterKey,
          deliveryPrefix,
          outputVideo?.widthInPx ?? null,
          outputVideo?.heightInPx ?? null,
          durationMs ? String(Math.round(durationMs / 1000)) : null,
          mediaId,
        ],
      );
      await db.query(
        `INSERT INTO media_status_events (media_id, status, detail, progress)
         VALUES ($1, 'ready', $2, 100)`,
        [mediaId, `MediaConvert job ${jobId} complete`],
      );
      console.log(`[${mediaId}] → ready (master ${masterKey})`);
    } else {
      // ERROR / CANCELED
      const message = errorMessage || `MediaConvert job ${jobId} ${status}`;
      await db.query(
        `UPDATE media_metadata
         SET status='failed', processing_error=$1, updated_at=NOW()
         WHERE id=$2`,
        [message.slice(0, 500), mediaId],
      );
      await db.query(
        `INSERT INTO media_status_events (media_id, status, detail, progress)
         VALUES ($1, 'failed', $2, NULL)`,
        [mediaId, message],
      );
      console.log(`[${mediaId}] → failed: ${message}`);
    }
    return { ok: true };
  } finally {
    await db.end().catch(() => {});
  }
};
