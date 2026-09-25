// Dummy transcoder Lambda (local / pre-prod). Triggered by the SQS event source mapping on
// `media-source-events` (S3 ObjectCreated → SQS → here; see infra/floci/lambda.tf).
//
// Per uploaded object (shared rules in lib.js — claim, size check, non-video, retries):
//   video     → claim row (processing) → write PLACEHOLDER HLS + poster → ready
//               (duration/width/height: keeps client-probed values, fills gaps from `probe`)
//   non-video → ready (no transcode)
//
// The placeholder is valid HLS syntax but not playable video. Going to prod = swap this file
// for prod-handler.js (MediaConvert); every rule in lib.js stays the same.
//
// Env (set by infra/floci/lambda.tf):
//   MEDIA_OUTPUT_BUCKET                  HLS destination bucket (required)
//   DATABASE_URL | DATABASE_URL_SECRET_ID  Postgres connection (see lib.resolveDatabaseUrl)
//   AWS_ENDPOINT_URL                     Floci only — unset in real AWS
//   MAX_RECEIVE_COUNT                    must equal the queue's redrive maxReceiveCount (default 5)

const { DeleteObjectCommand, PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { admitUpload, consoleLogger, createSqsBatchHandler, failIfOwned, insertEvent, openDatabase, withTx } = require('./lib');

const PROVIDER = 'dummy-lambda';

// 1×1 JPEG (smallest valid image) — stands in for a real poster frame.
const PIXEL_JPEG = Buffer.from([
  0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00,
  0x00, 0x01, 0x00, 0x01, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06,
  0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d,
  0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12, 0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d,
  0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x20, 0x22, 0x2c, 0x23, 0x1c, 0x1c, 0x28,
  0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
  0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x0b, 0x08, 0x00, 0x01, 0x00, 0x01,
  0x01, 0x01, 0x11, 0x00, 0xff, 0xc4, 0x00, 0x1f, 0x00, 0x00, 0x01, 0x05, 0x01, 0x01,
  0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01, 0x02,
  0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0xff, 0xc4, 0x00, 0xb5, 0x10,
  0x00, 0x02, 0x01, 0x03, 0x03, 0x02, 0x04, 0x03, 0x05, 0x05, 0x04, 0x04, 0x00, 0x00,
  0x01, 0x7d, 0x01, 0x02, 0x03, 0x00, 0x04, 0x11, 0x05, 0x12, 0x21, 0x31, 0x41, 0x06,
  0x13, 0x51, 0x61, 0x07, 0x22, 0x71, 0x14, 0x32, 0x81, 0x91, 0xa1, 0x08, 0x23, 0x42,
  0xb1, 0xc1, 0x15, 0x52, 0xd1, 0xf0, 0x24, 0x33, 0x62, 0x72, 0x82, 0xff, 0xda, 0x00,
  0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00, 0xfb, 0xd0, 0xff, 0xd9,
  ]);

/** Positive finite number or null. */
function positive(v) {
  const n = Number(v);
  return v !== null && v !== undefined && Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Placeholder HLS layout — same shape MediaConvert produces, so playback code is exercised.
 * When the duration is known (client probe / probe hook) the single segment claims it, so the
 * player shows the right length.
 */
function placeholderOutputs(prefix, durationSeconds = null) {
  const seg = positive(durationSeconds) ?? 6;
  const master = ['#EXTM3U', '#EXT-X-VERSION:3', '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360', '360p/index.m3u8'];
  const variant = [
    '#EXTM3U', '#EXT-X-VERSION:3', `#EXT-X-TARGETDURATION:${Math.ceil(seg)}`, '#EXT-X-PLAYLIST-TYPE:VOD',
    `#EXTINF:${seg.toFixed(3)},`, 'seg_000.ts', '#EXT-X-ENDLIST',
  ];
  return [
    { key: `${prefix}master.m3u8`, body: master.join('\n') + '\n', contentType: 'application/vnd.apple.mpegurl' },
    { key: `${prefix}360p/index.m3u8`, body: variant.join('\n') + '\n', contentType: 'application/vnd.apple.mpegurl' },
    { key: `${prefix}360p/seg_000.ts`, body: Buffer.from([0x47, 0x40, 0x00, 0x10]), contentType: 'video/mp2t' },
    { key: `${prefix}poster.jpg`, body: PIXEL_JPEG, contentType: 'image/jpeg' },
  ];
}

/**
 * Build a handler around injected deps (tests pass fakes; prod uses buildDefaultDeps).
 * `probe(upload)` may resolve `{ durationSeconds, width, height }` for the source object (no
 * FFmpeg in this image, so the default knows nothing); values only fill columns that are empty.
 */
function createHandler({ s3, openDb, outputBucket, maxReceiveCount = 5, log = consoleLogger(), probe = async () => null }) {
  async function processUpload(upload, { db, messageId, finalAttempt }) {
    const admitted = await admitUpload({ db, s3, DeleteObjectCommand, upload, messageId, provider: PROVIDER, log });
    if (admitted.kind !== 'transcode') {
      return;
    }
    const { row, outputPrefix } = admitted;
    let outputs = [];
    try {
      const probed = (await probe(upload).catch(() => null)) || {};
      const known = await db.query(
        `/* select-probe */ SELECT duration_seconds, width, height FROM media_metadata WHERE id = $1`,
        [row.id],
      );
      const current = (known && known.rows && known.rows[0]) || {};
      const durationSeconds = positive(current.duration_seconds) ?? positive(probed.durationSeconds);
      const width = positive(current.width) ?? positive(probed.width);
      const height = positive(current.height) ?? positive(probed.height);
      outputs = placeholderOutputs(outputPrefix, durationSeconds);
      await Promise.all(
        outputs.map((o) =>
          s3.send(new PutObjectCommand({ Bucket: outputBucket, Key: o.key, Body: o.body, ContentType: o.contentType })),
        ),
      );

      const finalized = await withTx(db, async () => {
        const r = await db.query(
          `/* finalize */ UPDATE media_metadata
           SET status='ready', is_hls=true, hls_master_key=$3, delivery_prefix=$4,
               duration_seconds=COALESCE(duration_seconds, $5::numeric),
               width=COALESCE(width, $6::int), height=COALESCE(height, $7::int),
               processing_progress=100, processed_at=NOW(), updated_at=NOW()
           WHERE id=$1 AND status='processing' AND processing_job_id=$2 AND deleted_at IS NULL
           RETURNING id`,
          [
            row.id, messageId, outputs[0].key, outputPrefix,
            durationSeconds === null ? null : String(durationSeconds),
            width === null ? null : Math.round(width),
            height === null ? null : Math.round(height),
          ],
        );
        if (r.rows.length) {
          await insertEvent(db, row.id, 'ready', 'dummy transcode complete', 100);
        }
        return r.rows.length > 0;
      });

      if (!finalized) {
        // Deleted (or reconciled) while we worked — don't leave output nobody will clean up.
        log.warn(`[${row.id}] row no longer ours — removing ${outputs.length} output object(s)`);
        await Promise.all(
          outputs.map((o) => s3.send(new DeleteObjectCommand({ Bucket: outputBucket, Key: o.key })).catch(() => {})),
        );
        return;
      }
      log.info(`[${row.id}] → ready (master: ${outputs[0].key})`);
    } catch (err) {
      // Only the LAST delivery gives up; earlier ones rethrow so SQS retries (and the retry
      // re-claims this row — same messageId). Marking FAILED earlier would make every retry
      // skip the row, turning any transient S3/DB blip into a permanent failure.
      if (finalAttempt) {
        await failIfOwned(db, { id: row.id, jobId: messageId, reason: `transcode failed: ${err.message || err}` });
      }
      throw err;
    }
  }

  return createSqsBatchHandler({ openDb, maxReceiveCount, processMessage: processUpload, log });
}

function buildDefaultDeps() {
  const outputBucket = process.env.MEDIA_OUTPUT_BUCKET;
  if (!outputBucket) {
    throw new Error('MEDIA_OUTPUT_BUCKET env is required');
  }
  const s3 = new S3Client({
    region: process.env.AWS_REGION || 'us-east-1',
    ...(process.env.AWS_ENDPOINT_URL ? { endpoint: process.env.AWS_ENDPOINT_URL, forcePathStyle: true } : {}),
  });
  return { s3, openDb: openDatabase, outputBucket, maxReceiveCount: Number(process.env.MAX_RECEIVE_COUNT || 5) };
}

let defaultHandler;
exports.handler = async function handler(event) {
  defaultHandler = defaultHandler || createHandler(buildDefaultDeps());
  return defaultHandler(event);
};
exports.createHandler = createHandler;
exports.placeholderOutputs = placeholderOutputs;
