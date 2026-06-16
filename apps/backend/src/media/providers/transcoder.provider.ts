import { TranscodeStatus, TranscodeSubmission } from '../interfaces/media.types';

/**
 * Video → HLS/ABR transcode abstraction. Env-selected (`MEDIA_TRANSCODER`):
 * AWS MediaConvert in cloud, a local stub for dev (simulates a finished job so the
 * lifecycle completes without AWS). The ABR ladder lives in the provider/job template.
 */
export abstract class TranscoderProvider {
  /** Provider id stored on the row (`media_metadata.processing_provider`). */
  abstract readonly name: string;

  /**
   * Submit an HLS transcode for `inputKey`, writing outputs under `outputPrefix`.
   * `simulated=true` (local) means the caller should finalize the asset immediately.
   */
  abstract submitHlsJob(input: { mediaId: string; inputKey: string; outputPrefix: string }): Promise<TranscodeSubmission>;

  /** Poll a submitted job's status (drives the worker's status-by-status updates). */
  abstract getJobStatus(jobId: string): Promise<TranscodeStatus>;
}

