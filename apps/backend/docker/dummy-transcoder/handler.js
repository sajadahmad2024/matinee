// Dummy transcoder Lambda.
//
// Trigger: SQS event source mapping on the `media-source-events` queue (see
// infra/floci/lambda.tf). Each SQS message body is an S3 ObjectCreated notification. For
// every record, we:
//   1. Parse the S3 key from the notification
//   2. Look up the media_metadata row by storage_key
//   3. Write a placeholder master.m3u8 + poster.jpg to the OUTPUT bucket
//   4. UPDATE the row: status='ready', hls_master_key=..., delivery_prefix=..., is_hls=true
//   5. Append a media_status_events row (processing → ready)
//
// The placeholder outputs are enough to make GET /media/:id/playback return a signed URL
// that resolves (though the URL itself isn't playable video). Swap
// `writePlaceholderOutputs()` for real FFmpeg spawn OR MediaConvert CreateJob when going
// to prod — the surrounding scaffolding (SQS handling, DB update, error handling) stays.
//
// Env expected (set in infra/floci/lambda.tf):
//   AWS_REGION             — Lambda-provided; used by S3 client
//   AWS_ENDPOINT_URL       — set locally so the S3 client hits Floci from inside Lambda
//   MEDIA_OUTPUT_BUCKET    — target bucket for the master.m3u8 write
//   DATABASE_URL           — postgres:// connection string

const { PutObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { Client } = require('pg');

const OUTPUT_BUCKET = process.env.MEDIA_OUTPUT_BUCKET;
const DATABASE_URL = process.env.DATABASE_URL;

if (!OUTPUT_BUCKET) throw new Error('MEDIA_OUTPUT_BUCKET env is required');
if (!DATABASE_URL) throw new Error('DATABASE_URL env is required');

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.AWS_ENDPOINT_URL
    ? { endpoint: process.env.AWS_ENDPOINT_URL, forcePathStyle: true }
    : {}),
});

exports.handler = async function handler(event) {
  const records = event?.Records ?? [];
  // SQS event source mapping delivers up to 10 messages per invocation. Process each; report
  // per-message failures via batchItemFailures so successful messages don't get redelivered.
  const batchItemFailures = [];
  for (const sqsRecord of records) {
    try {
      await handleSqsRecord(sqsRecord);
    } catch (err) {
      console.error(`[msg ${sqsRecord.messageId}] failed:`, err);
      batchItemFailures.push({ itemIdentifier: sqsRecord.messageId });
    }
  }
  return { batchItemFailures };
};

async function handleSqsRecord(sqsRecord) {
  // The body is the S3 event notification (S3 → SQS wiring in infra/floci/s3.tf).
  const body = safeJsonParse(sqsRecord.body);
  const s3Records = body?.Records ?? [];
  for (const s3Record of s3Records) {
    if (s3Record.eventSource !== 'aws:s3') continue;
    if (!String(s3Record.eventName || '').startsWith('ObjectCreated')) continue;
    await handleS3ObjectCreated(s3Record);
  }
}

async function handleS3ObjectCreated(s3Record) {
  // S3 URL-encodes '+' as space; decode both.
  const rawKey = s3Record.s3.object.key;
  const storageKey = decodeURIComponent(rawKey.replace(/\+/g, ' '));
  const size = s3Record.s3.object.size;

  console.log(`[${storageKey}] S3 ObjectCreated (${size} bytes) — dummy-transcoding`);

  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();
  try {
    // 1. Find the media row by storage_key
    const { rows } = await db.query(
      `SELECT id, status, storage_key, media_type FROM media_metadata
       WHERE storage_key = $1 AND deleted_at IS NULL LIMIT 1`,
      [storageKey],
    );
    const row = rows[0];
    if (!row) {
      console.warn(`[${storageKey}] no media_metadata row — skipping`);
      return;
    }
    // Only transcode videos. Non-video uploads (images, docs) are marked READY by the API's
    // POST /media/:id/complete endpoint synchronously — no async transcoding needed. If the
    // client never calls /complete for a non-video, the row stays UPLOADED until a cleanup
    // sweep OR they call /complete later; either way, we don't wrongly HLS-mark it here.
    if (row.media_type !== 'video') {
      console.log(`[${row.id}] media_type=${row.media_type} — skipping (transcoder is video-only)`);
      return;
    }
    // Idempotent: don't reprocess a row that's past uploaded. S3 events are at-least-once,
    // and POST /:id/complete + this Lambda both race to mark UPLOADED.
    if (row.status !== 'pending' && row.status !== 'uploaded') {
      console.log(`[${row.id}] status=${row.status} — skipping (already processed)`);
      return;
    }

    // 2. Compute output layout (mirrors what the NestJS service records as delivery_prefix)
    const assetRoot = storageKey.replace(/\/original\/[^/]*$/, '/');
    const outputPrefix = `${assetRoot}hls/`;
    const masterKey = `${outputPrefix}master.m3u8`;

    // 3. Mark PROCESSING (so an event trail is visible in media_status_events)
    await db.query(
      `UPDATE media_metadata
       SET status='processing', processing_provider='dummy-lambda',
           processing_job_id=$1, processing_progress=0, updated_at=NOW()
       WHERE id=$2`,
      [sqsRecord.messageId || `dummy-${row.id}`, row.id],
    );
    await db.query(
      `INSERT INTO media_status_events (media_id, status, detail, progress)
       VALUES ($1, 'processing', 'dummy transcode invoked', 0)`,
      [row.id],
    );

    // 4. Write placeholder outputs
    await writePlaceholderOutputs(outputPrefix);

    // 5. Mark READY
    await db.query(
      `UPDATE media_metadata
       SET status='ready',
           is_hls=true,
           hls_master_key=$1,
           delivery_prefix=$2,
           processing_progress=100,
           processed_at=NOW(),
           updated_at=NOW()
       WHERE id=$3`,
      [masterKey, outputPrefix, row.id],
    );
    await db.query(
      `INSERT INTO media_status_events (media_id, status, detail, progress)
       VALUES ($1, 'ready', 'dummy transcode complete', 100)`,
      [row.id],
    );

    console.log(`[${row.id}] → ready (master: ${masterKey})`);
  } catch (err) {
    // Try to mark the row failed so operators can see it, but don't swallow the original
    // error — return it so SQS retries and eventually DLQs.
    try {
      await db.query(
        `UPDATE media_metadata
         SET status='failed', processing_error=$1, updated_at=NOW()
         WHERE storage_key=$2`,
        [String(err.message || err).slice(0, 500), storageKey],
      );
    } catch (dbErr) {
      console.error('follow-up markFailed() also errored:', dbErr);
    }
    throw err;
  } finally {
    await db.end().catch(() => {});
  }
}

// Placeholder HLS output — enough for GET /:id/playback to return a URL that resolves.
// NOT valid video. Swap for FFmpeg spawn (with local static binary in the image) or a
// MediaConvert CreateJob when going to prod.
async function writePlaceholderOutputs(prefix) {
  const master = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-STREAM-INF:BANDWIDTH=800000,RESOLUTION=640x360',
    '360p/index.m3u8',
  ].join('\n') + '\n';

  const variant = [
    '#EXTM3U',
    '#EXT-X-VERSION:3',
    '#EXT-X-TARGETDURATION:6',
    '#EXT-X-PLAYLIST-TYPE:VOD',
    '#EXTINF:6.0,',
    'seg_000.ts',
    '#EXT-X-ENDLIST',
  ].join('\n') + '\n';

  // 1-pixel JPEG (minimum valid image). Real posters replace this.
  const pixelJpeg = Buffer.from([
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

  await Promise.all([
    put(`${prefix}master.m3u8`, master, 'application/vnd.apple.mpegurl'),
    put(`${prefix}360p/index.m3u8`, variant, 'application/vnd.apple.mpegurl'),
    put(`${prefix}360p/seg_000.ts`, Buffer.from([0x47, 0x40, 0x00, 0x10]), 'video/mp2t'),
    put(`${prefix}poster.jpg`, pixelJpeg, 'image/jpeg'),
  ]);
}

async function put(key, body, contentType) {
  await s3.send(new PutObjectCommand({
    Bucket: OUTPUT_BUCKET,
    Key: key,
    Body: body,
    ContentType: contentType,
  }));
}

function safeJsonParse(str) {
  try { return JSON.parse(str); } catch { return null; }
}
