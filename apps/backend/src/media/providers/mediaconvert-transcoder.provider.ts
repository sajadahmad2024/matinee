import { EnvConfig } from '@config/env.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateJobCommand, type CreateJobCommandInput, GetJobCommand, MediaConvertClient } from '@aws-sdk/client-mediaconvert';
import { TranscoderProvider } from './transcoder.provider';
import { TranscodeStatus, TranscodeSubmission } from '../interfaces/media.types';

/** ABR ladder (name modifier → height/bitrate). Mirrored in the master playlist. */
const HLS_LADDER = [
  { mod: '_1080p', height: 1080, bitrate: 5_000_000 },
  { mod: '_720p', height: 720, bitrate: 3_000_000 },
  { mod: '_480p', height: 480, bitrate: 1_500_000 },
  { mod: '_240p', height: 240, bitrate: 600_000 },
];

/**
 * AWS MediaConvert HLS/ABR transcode. Emits the master + variant playlists + segments
 * under `outputPrefix`, plus a frame-capture poster. Completion is delivered out-of-band
 * (EventBridge → completion callback finalizes the row); this only submits the job.
 */
@Injectable()
export class MediaConvertTranscoder extends TranscoderProvider {
  readonly name = 'mediaconvert';
  private readonly logger = new Logger(MediaConvertTranscoder.name);
  private readonly client: MediaConvertClient;
  private readonly roleArn: string;
  private readonly inputBucket: string;
  private readonly outputBucket: string;
  private readonly queueArn: string;

  constructor(config: ConfigService<EnvConfig>) {
    super();
    const region = config.get<string>('MEDIA_S3_REGION') ?? 'us-east-1';
    const endpoint = config.get<string>('MEDIA_MEDIACONVERT_ENDPOINT') ?? '';
    this.roleArn = config.get<string>('MEDIA_MEDIACONVERT_ROLE_ARN') ?? '';
    this.queueArn = config.get<string>('MEDIA_MEDIACONVERT_QUEUE') ?? '';
    this.inputBucket = config.get<string>('MEDIA_S3_BUCKET') ?? '';
    this.outputBucket = config.get<string>('MEDIA_OUTPUT_BUCKET') ?? this.inputBucket;
    this.client = new MediaConvertClient({ region, ...(endpoint ? { endpoint } : {}) });
  }

  async submitHlsJob(input: { mediaId: string; inputKey: string; outputPrefix: string }): Promise<TranscodeSubmission> {
    const destination = `s3://${this.outputBucket}/${input.outputPrefix}`;
    const jobInput: CreateJobCommandInput = {
      Role: this.roleArn,
      ...(this.queueArn ? { Queue: this.queueArn } : {}),
      // Correlate the job back to our media row (also surfaces in events/console).
      UserMetadata: { mediaId: input.mediaId },
      StatusUpdateInterval: 'SECONDS_10',
      Settings: {
        Inputs: [
          {
            FileInput: `s3://${this.inputBucket}/${input.inputKey}`,
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
              HlsGroupSettings: { Destination: destination, SegmentLength: 6, MinSegmentLength: 0 },
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
                { CodecSettings: { Codec: 'AAC', AacSettings: { Bitrate: 96_000, CodingMode: 'CODING_MODE_2_0', SampleRate: 48_000 } } },
              ],
              ContainerSettings: { Container: 'M3U8' },
            })),
          },
          {
            Name: 'Poster',
            OutputGroupSettings: {
              Type: 'FILE_GROUP_SETTINGS',
              FileGroupSettings: { Destination: `${destination}poster/` },
            },
            Outputs: [
              {
                NameModifier: '_poster',
                VideoDescription: {
                  CodecSettings: { Codec: 'FRAME_CAPTURE', FrameCaptureSettings: { FramerateNumerator: 1, FramerateDenominator: 5, MaxCaptures: 1, Quality: 80 } },
                },
                ContainerSettings: { Container: 'RAW' },
              },
            ],
          },
        ],
      },
    };

    const out = await this.client.send(new CreateJobCommand(jobInput));
    const jobId = out.Job?.Id ?? '';
    this.logger.log(`MediaConvert job ${jobId} submitted for media ${input.mediaId}`);
    return { jobId, simulated: false, masterKey: `${input.outputPrefix}master.m3u8`, outputPrefix: input.outputPrefix };
  }

  async getJobStatus(jobId: string): Promise<TranscodeStatus> {
    const out = await this.client.send(new GetJobCommand({ Id: jobId }));
    const status = out.Job?.Status; // SUBMITTED | PROGRESSING | COMPLETE | CANCELED | ERROR
    const progress = out.Job?.JobPercentComplete ?? null;
    switch (status) {
      case 'COMPLETE':
        return { state: 'complete', progress: 100 };
      case 'ERROR':
      case 'CANCELED':
        return { state: 'error', progress, error: out.Job?.ErrorMessage ?? `job ${status}` };
      case 'SUBMITTED':
        return { state: 'submitted', progress };
      default:
        return { state: 'progressing', progress };
    }
  }
}
