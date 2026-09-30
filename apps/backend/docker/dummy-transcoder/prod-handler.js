// PROD HANDLER TEMPLATE — MediaConvert job SUBMISSION Lambda. Not wired in yet.
//
// Activation (see apps/documentation/docs/backend/media/dummy-lambda-transcoder.md):
//   1. package.json: add "@aws-sdk/client-mediaconvert"
//   2. Dockerfile: CMD ["prod-handler.handler"]
//   3. Lambda env: MEDIACONVERT_ENDPOINT, MEDIACONVERT_ROLE_ARN, (optional) MEDIACONVERT_QUEUE_ARN
//   4. A SECOND Lambda (same image, CMD ["prod-completion-handler.handler"]) on an EventBridge
//      rule for `aws.mediaconvert` / `MediaConvert Job State Change` (COMPLETE|ERROR|CANCELED)
//
// Two Lambdas because CreateJob is async — the encode takes minutes; waiting here would bill
// idle Lambda time. Flow:
//   S3 → SQS → THIS Lambda: claim row (lib) → CreateJob → processing_job_id = MediaConvert Job.Id
//   EventBridge → completion Lambda: processing → ready | failed
//
// All claim / size / non-video / retry rules come from lib.js — identical to the dummy.

const { CancelJobCommand, CreateJobCommand, MediaConvertClient } = require('@aws-sdk/client-mediaconvert');
const { DeleteObjectCommand, S3Client } = require('@aws-sdk/client-s3');
const { admitUpload, consoleLogger, createSqsBatchHandler, failIfOwned, openDatabase, withTx } = require('./lib');

const PROVIDER = 'mediaconvert';

// ABR ladder — same rungs as the NestJS MediaConvertTranscoder for output parity.
const HLS_LADDER = [
  { mod: '_1080p', height: 1080, bitrate: 5_000_000 },
  { mod: '_720p', height: 720, bitrate: 3_000_000 },
  { mod: '_480p', height: 480, bitrate: 1_500_000 },
  { mod: '_240p', height: 240, bitrate: 600_000 },
];

function jobSettings({ input, destination, roleArn, queueArn, mediaId, clientRequestToken }) {
  return {
    Role: roleArn,
    ...(queueArn ? { Queue: queueArn } : {}),
    // Idempotency: an SQS redelivery re-sends the same token, so MediaConvert returns the
    // ORIGINAL job instead of starting (and billing) a second encode.
    ClientRequestToken: clientRequestToken,
    // Correlates the EventBridge completion event back to our row.
    UserMetadata: { mediaId },
    StatusUpdateInterval: 'SECONDS_10',
    Settings: {
      Inputs: [
        {
          FileInput: input,
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
            // A Destination ending in a base name ("…/hls/master") makes MediaConvert write
            // master.m3u8 (+ master_1080p.m3u8 …). A bare prefix would name the master
            // playlist after the INPUT file (e.g. clip.m3u8) and break hls_master_key.
            HlsGroupSettings: { Destination: `${destination}master`, SegmentLength: 6, MinSegmentLength: 0 },
          },
          Outputs: HLS_LADDER.map((r) => ({
            NameModifier: r.mod,
            VideoDescription: {
              Height: r.height,
              CodecSettings: {
                Codec: 'H_264',
                H264Settings: { RateControlMode: 'QVBR', MaxBitrate: r.bitrate, SceneChangeDetect: 'TRANSITION_DETECTION' },
              },
            },
            AudioDescriptions: [
              {
                CodecSettings: {
                  Codec: 'AAC',
                  AacSettings: { Bitrate: 96_000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48_000 },
                },
              },
            ],
            ContainerSettings: { Container: 'M3U8' },
          })),
        },
        {
          Name: 'Poster',
          OutputGroupSettings: {
            Type: 'FILE_GROUP_SETTINGS',
            FileGroupSettings: { Destination: `${destination}poster` },
          },
          Outputs: [
            {
              NameModifier: '_frame',
              VideoDescription: {
                CodecSettings: {
                  Codec: 'FRAME_CAPTURE',
                  FrameCaptureSettings: { FramerateNumerator: 1, FramerateDenominator: 5, MaxCaptures: 1, Quality: 80 },
                },
              },
              ContainerSettings: { Container: 'RAW' },
            },
          ],
        },
      ],
    },
  };
}

function createHandler({ s3, mediaConvert, openDb, outputBucket, roleArn, queueArn, maxReceiveCount = 5, log = consoleLogger() }) {
  async function processUpload(upload, { db, messageId, finalAttempt }) {
    const admitted = await admitUpload({ db, s3, DeleteObjectCommand, upload, messageId, provider: PROVIDER, log });
    if (admitted.kind !== 'transcode') {
      return;
    }
    const { row, outputPrefix } = admitted;
    try {
      const out = await mediaConvert.send(
        new CreateJobCommand(
          jobSettings({
            input: `s3://${upload.bucket}/${upload.key}`,
            destination: `s3://${outputBucket}/${outputPrefix}`,
            roleArn,
            queueArn,
            mediaId: row.id,
            clientRequestToken: messageId,
          }),
        ),
      );
      const jobId = out.Job?.Id;
      if (!jobId) {
        throw new Error('MediaConvert CreateJob returned no job id');
      }

      // Hand ownership from the SQS message to the MediaConvert job — the completion Lambda
      // finalizes WHERE processing_job_id = <job id>.
      const handedOver = await withTx(db, async () => {
        const r = await db.query(
          `/* handover */ UPDATE media_metadata SET processing_job_id=$3, updated_at=NOW()
           WHERE id=$1 AND status='processing' AND processing_job_id=$2 AND deleted_at IS NULL
           RETURNING id`,
          [row.id, messageId, jobId],
        );
        return r.rows.length > 0;
      });
      if (!handedOver) {
        log.warn(`[${row.id}] row deleted while submitting — cancelling job ${jobId}`);
        await mediaConvert.send(new CancelJobCommand({ Id: jobId })).catch(() => {});
        return;
      }
      log.info(`[${row.id}] MediaConvert job ${jobId} submitted`);
    } catch (err) {
      if (finalAttempt) {
        await failIfOwned(db, { id: row.id, jobId: messageId, reason: `MediaConvert submit failed: ${err.message || err}` });
      }
      throw err;
    }
  }

  return createSqsBatchHandler({ openDb, maxReceiveCount, processMessage: processUpload, log });
}

function buildDefaultDeps() {
  const outputBucket = process.env.MEDIA_OUTPUT_BUCKET;
  const roleArn = process.env.MEDIACONVERT_ROLE_ARN;
  if (!outputBucket || !roleArn) {
    throw new Error('MEDIA_OUTPUT_BUCKET and MEDIACONVERT_ROLE_ARN env are required');
  }
  const region = process.env.AWS_REGION || 'us-east-1';
  return {
    s3: new S3Client({ region }),
    mediaConvert: new MediaConvertClient({
      region,
      ...(process.env.MEDIACONVERT_ENDPOINT ? { endpoint: process.env.MEDIACONVERT_ENDPOINT } : {}),
    }),
    openDb: openDatabase,
    outputBucket,
    roleArn,
    queueArn: process.env.MEDIACONVERT_QUEUE_ARN,
    maxReceiveCount: Number(process.env.MAX_RECEIVE_COUNT || 5),
  };
}

let defaultHandler;
exports.handler = async function handler(event) {
  defaultHandler = defaultHandler || createHandler(buildDefaultDeps());
  return defaultHandler(event);
};
exports.createHandler = createHandler;
exports.jobSettings = jobSettings;
