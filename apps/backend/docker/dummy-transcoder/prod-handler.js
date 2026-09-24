// PROD HANDLER TEMPLATE — MediaConvert-based transcoder Lambda.
//
// Not wired in yet. To activate for production:
//   1. In package.json add: "@aws-sdk/client-mediaconvert": "^3.891.0"
//   2. In Dockerfile CMD, swap: ["prod-handler.handler"] instead of ["handler.handler"]
//   3. Set these env vars in infra/floci/lambda.tf (or your prod Terraform):
//        MEDIACONVERT_ENDPOINT   — get from `aws mediaconvert describe-endpoints`
//        MEDIACONVERT_ROLE_ARN   — IAM role MediaConvert assumes for S3 access
//        MEDIACONVERT_QUEUE_ARN  — optional; defaults to the account's default queue
//   4. Wire a SECOND Lambda subscribed to EventBridge rule
//      `aws.mediaconvert` + `MediaConvert Job State Change` (STATUS: COMPLETE / ERROR)
//      to run `mediaconvert-complete-handler.handler` — that's the one that does the
//      final `UPDATE status='ready'`. See § "Two-Lambda flow" below.
//
// Why two Lambdas? MediaConvert.CreateJob is async — it returns immediately with a jobId,
// and the actual encode happens minutes later. If THIS Lambda waited for completion, we'd
// pay for idle Lambda time. EventBridge + a completion-Lambda is the AWS-native pattern.
//
// The ABR ladder + job config below is the exact same shape as the deleted NestJS
// MediaConvertTranscoder — parity for HLS output layout.
//
// ─── Two-Lambda flow ─────────────────────────────────────────────────────────
//   S3 → SQS → THIS Lambda: CreateJob + mark status=processing
//                                          + set processing_job_id = MediaConvert Job.Id
//   MediaConvert async encode…
//   EventBridge → completion Lambda: UPDATE status=ready (or failed on error state)
//                    + populate hls_master_key, delivery_prefix, duration, w, h

const { CreateJobCommand, MediaConvertClient } = require('@aws-sdk/client-mediaconvert');
const { Client } = require('pg');

const MEDIA_INPUT_BUCKET  = process.env.MEDIA_INPUT_BUCKET;
const MEDIA_OUTPUT_BUCKET = process.env.MEDIA_OUTPUT_BUCKET;
const MEDIACONVERT_ENDPOINT = process.env.MEDIACONVERT_ENDPOINT;
const MEDIACONVERT_ROLE_ARN = process.env.MEDIACONVERT_ROLE_ARN;
const MEDIACONVERT_QUEUE_ARN = process.env.MEDIACONVERT_QUEUE_ARN;
const DATABASE_URL = process.env.DATABASE_URL;

if (!MEDIA_OUTPUT_BUCKET) throw new Error('MEDIA_OUTPUT_BUCKET env is required');
if (!MEDIACONVERT_ROLE_ARN) throw new Error('MEDIACONVERT_ROLE_ARN env is required');
if (!DATABASE_URL) throw new Error('DATABASE_URL env is required');

// ABR ladder — mirrored in the master.m3u8 MediaConvert generates. Same rungs as the
// deleted NestJS MediaConvertTranscoder for output parity.
const HLS_LADDER = [
  { mod: '_1080p', height: 1080, bitrate: 5_000_000 },
  { mod: '_720p',  height: 720,  bitrate: 3_000_000 },
  { mod: '_480p',  height: 480,  bitrate: 1_500_000 },
  { mod: '_240p',  height: 240,  bitrate: 600_000 },
];

const mediaConvert = new MediaConvertClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(MEDIACONVERT_ENDPOINT ? { endpoint: MEDIACONVERT_ENDPOINT } : {}),
});

exports.handler = async function handler(event) {
  const batchItemFailures = [];
  for (const sqsRecord of event?.Records ?? []) {
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
  const body = JSON.parse(sqsRecord.body);
  for (const s3Record of body?.Records ?? []) {
    if (s3Record.eventSource !== 'aws:s3') continue;
    if (!String(s3Record.eventName || '').startsWith('ObjectCreated')) continue;
    await handleS3ObjectCreated(s3Record);
  }
}

async function handleS3ObjectCreated(s3Record) {
  const rawKey = s3Record.s3.object.key;
  const storageKey = decodeURIComponent(rawKey.replace(/\+/g, ' '));
  const inputBucket = s3Record.s3.bucket.name;

  const db = new Client({ connectionString: DATABASE_URL });
  await db.connect();
  try {
    const { rows } = await db.query(
      `SELECT id, status, media_type FROM media_metadata
       WHERE storage_key = $1 AND deleted_at IS NULL LIMIT 1`,
      [storageKey],
    );
    const row = rows[0];
    if (!row) {
      console.warn(`[${storageKey}] no media row — skipping`);
      return;
    }
    // Only transcode videos. Non-video uploads are finalized synchronously by the API's
    // POST /:id/complete endpoint — we never touch them here.
    if (row.media_type !== 'video') {
      console.log(`[${row.id}] media_type=${row.media_type} — skipping (transcoder is video-only)`);
      return;
    }
    if (row.status !== 'pending' && row.status !== 'uploaded') {
      console.log(`[${row.id}] status=${row.status} — skipping (already processed)`);
      return;
    }

    const assetRoot = storageKey.replace(/\/original\/[^/]*$/, '/');
    const outputPrefix = `${assetRoot}hls/`;
    const destination = `s3://${MEDIA_OUTPUT_BUCKET}/${outputPrefix}`;

    // Submit MediaConvert job — returns immediately with jobId; actual encode is async.
    // Completion is handled by the SECOND Lambda subscribed to EventBridge (see file header).
    const jobInput = {
      Role: MEDIACONVERT_ROLE_ARN,
      ...(MEDIACONVERT_QUEUE_ARN ? { Queue: MEDIACONVERT_QUEUE_ARN } : {}),
      // Correlate the job back to our media row — surfaces in the MediaConvert console AND
      // in the EventBridge "Job State Change" event that the completion Lambda receives.
      UserMetadata: { mediaId: row.id },
      StatusUpdateInterval: 'SECONDS_10',
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${inputBucket}/${storageKey}`,
            AudioSelectors: { 'Audio Selector 1': { DefaultSelection: 'DEFAULT' } },
            VideoSelector: {},
            TimecodeSource: 'ZEROBASED',
          },
        ],
        OutputGroups: [
          {
            Name: 'HLS',
            OutputGroupSettings: {
              Type: 'HLS_GROUP_SETTINGS',
              HlsGroupSettings: {
                Destination: destination,
                SegmentLength: 6,
                MinSegmentLength: 0,
              },
            },
            Outputs: HLS_LADDER.map((r) => ({
              NameModifier: r.mod,
              VideoDescription: {
                Height: r.height,
                CodecSettings: {
                  Codec: 'H_264',
                  H264Settings: {
                    RateControlMode: 'QVBR',
                    MaxBitrate: r.bitrate,
                    SceneChangeDetect: 'TRANSITION_DETECTION',
                  },
                },
              },
              AudioDescriptions: [{
                CodecSettings: {
                  Codec: 'AAC',
                  AacSettings: { Bitrate: 96_000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48_000 },
                },
              }],
              ContainerSettings: { Container: 'M3U8' },
            })),
          },
          {
            Name: 'Poster',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: { Destination: `${destination}poster/` },
            },
            Outputs: [{
              NameModifier: '_poster',
              VideoDescription: {
                CodecSettings: {
                  Codec: 'FRAME_CAPTURE',
                  FrameCaptureSettings: {
                    FramerateNumerator: 1,
                    FramerateDenominator: 5,
                    MaxCaptures: 1,
                    Quality: 80,
                  },
                },
              },
              ContainerSettings: { Container: 'RAW' },
            }],
          },
        ],
      },
    };

    const out = await mediaConvert.send(new CreateJobCommand(jobInput));
    const jobId = out.Job?.Id ?? '';
    console.log(`[${row.id}] MediaConvert job ${jobId} submitted`);

    // Row moves to PROCESSING here. The COMPLETION Lambda (EventBridge-triggered) moves it
    // to READY when the encode finishes.
    await db.query(
      `UPDATE media_metadata
       SET status='processing', processing_provider='mediaconvert',
           processing_job_id=$1, processing_progress=0, updated_at=NOW()
       WHERE id=$2`,
      [jobId, row.id],
    );
    await db.query(
      `INSERT INTO media_status_events (media_id, status, detail, progress)
       VALUES ($1, 'processing', $2, 0)`,
      [row.id, `MediaConvert job ${jobId} submitted`],
    );
  } catch (err) {
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
