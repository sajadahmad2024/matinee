import { Injectable } from '@nestjs/common';
import { TranscoderProvider } from './transcoder.provider';
import { TranscodeStatus, TranscodeSubmission } from '../interfaces/media.types';

/**
 * Dev stub — doesn't transcode; reports a simulated finished job so the worker
 * finalizes the asset immediately (status → ready). In cloud, swap
 * `MEDIA_TRANSCODER=mediaconvert`.
 */
@Injectable()
export class LocalTranscoder extends TranscoderProvider {
  readonly name = 'local';

  async submitHlsJob(input: { mediaId: string; inputKey: string; outputPrefix: string }): Promise<TranscodeSubmission> {
    return {
      jobId: `local-${input.mediaId}`,
      simulated: true,
      masterKey: `${input.outputPrefix}master.m3u8`,
      outputPrefix: input.outputPrefix,
    };
  }

  async getJobStatus(_jobId: string): Promise<TranscodeStatus> {
    return { state: 'complete', progress: 100 };
  }
}
