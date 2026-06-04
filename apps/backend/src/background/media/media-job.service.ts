import { EnvConfig } from '@config/env.config';
import { MediaRepository } from '@db/repositories/media/media.repository';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { STORAGE_PROVIDER, TRANSCODER_PROVIDER } from '@media/constants/media.constant';
import { StorageProvider } from '@media/providers/storage.provider';
import { TranscoderProvider } from '@media/providers/transcoder.provider';
import { MediaCleanupJob, TranscodePollJob, TranscodeVideoJob } from '@media/interfaces/media-jobs.interface';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/** SQS visibility/delay caps at 900s; we poll well under that. */
const MAX_POLL_ATTEMPTS = 240; // ~ up to a few hours at the configured interval

/**
 * Worker-side media work, fully SQS-driven:
 *  - submit the transcode (TRANSCODE_VIDEO), then
 *  - self-poll the provider via DELAYED messages (TRANSCODE_POLL) until done,
 *    recording a status event on every step (status by status), then
 *  - storage cleanup (MEDIA_CLEANUP).
 */
@Injectable()
export class MediaJobService {
  private readonly logger = new Logger(MediaJobService.name);

  constructor(
    private readonly media: MediaRepository,
    private readonly queue: QueueService,
    private readonly config: ConfigService<EnvConfig>,
    @Inject(TRANSCODER_PROVIDER) private readonly transcoder: TranscoderProvider,
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
  ) {}

  /**
   * Adaptive poll delay: poll fast early (catch quick jobs / early failures), then back
   * off so a long job costs few polls. 15s → 30 → 60 → 120 → 120… (capped).
   * Each poll is a NEW delayed SQS message — we never hold a message open during the wait,
   * so a multi-hour job never breaches the visibility timeout or causes duplicate work.
   */
  private pollDelay(attempt: number): number {
    const base = this.config.get<number>('MEDIA_TRANSCODE_POLL_INTERVAL') ?? 15;
    const max = this.config.get<number>('MEDIA_TRANSCODE_POLL_MAX_INTERVAL') ?? 120;
    return Math.min(base * 2 ** Math.min(attempt, 4), max);
  }

  /** Submit the transcode job. MediaConvert runs ASYNCHRONOUSLY; we then poll via SQS. */
  async runTranscode(job: TranscodeVideoJob): Promise<void> {
    const record = await this.media.findById(job.mediaId);
    if (!record || !record.storageKey) {
      this.logger.warn(`transcode: media ${job.mediaId} not found / no storage key — skipping`);
      return;
    }
    const assetRoot = record.storageKey.replace(/\/original\/[^/]*$/, '/');
    const outputPrefix = `${assetRoot}hls/`;
    try {
      const sub = await this.transcoder.submitHlsJob({ mediaId: job.mediaId, inputKey: record.storageKey, outputPrefix });
      await this.media.markProcessing(job.mediaId, { provider: this.transcoder.name, jobId: sub.jobId });

      if (sub.simulated) {
        // Local driver: no real job. Emit a couple of progress events, then finalize —
        // so the status-by-status trail is demonstrable without AWS.
        await this.media.updateProgress(job.mediaId, 50);
        await this.finalize(job.mediaId, sub.masterKey, sub.outputPrefix);
        return;
      }

      // Real MediaConvert: hand off to the delayed self-poll loop.
      await this.enqueuePoll({ mediaId: job.mediaId, jobId: sub.jobId, masterKey: sub.masterKey, outputPrefix: sub.outputPrefix, attempt: 0 });
    } catch (e) {
      await this.media.markFailed(job.mediaId, (e as Error).message);
      throw e; // surface to SQS for retry/DLQ
    }
  }

  /** Poll the provider; update progress, finalize, or fail — re-enqueueing while in-flight. */
  async pollTranscode(job: TranscodePollJob): Promise<void> {
    const record = await this.media.findById(job.mediaId);
    if (!record || record.status !== 'processing') {
      return; // deleted or already finalized — stop polling
    }
    if (job.attempt >= MAX_POLL_ATTEMPTS) {
      await this.media.markFailed(job.mediaId, 'transcode timed out (poll attempts exhausted)');
      return;
    }
    const status = await this.transcoder.getJobStatus(job.jobId);
    switch (status.state) {
      case 'complete':
        await this.finalize(job.mediaId, job.masterKey, job.outputPrefix, status.durationSeconds, status.width, status.height);
        return;
      case 'error':
        await this.media.markFailed(job.mediaId, status.error ?? 'transcode failed');
        return;
      default:
        if (status.progress !== null) {
          await this.media.updateProgress(job.mediaId, status.progress);
        }
        await this.enqueuePoll({ ...job, attempt: job.attempt + 1 });
    }
  }

  /** Cron sweep: soft-delete + purge storage for uploads that never completed. */
  async sweepOrphans(): Promise<void> {
    const ageSeconds = this.config.get<number>('MEDIA_ORPHAN_AGE_SECONDS') ?? 86_400; // 24h
    const orphans = await this.media.findStalePending(ageSeconds, 100);
    for (const row of orphans) {
      await this.media.softDelete(row.id);
      const assetRoot = (row.storageKey ?? '').replace(/\/original\/[^/]*$/, '/');
      if (assetRoot) {
        await this.storage.deletePrefix(assetRoot);
      }
    }
    if (orphans.length) {
      this.logger.log(`swept ${orphans.length} orphaned pending upload(s)`);
    }
  }

  async cleanup(job: MediaCleanupJob): Promise<void> {
    if (job.deliveryPrefix) {
      await this.storage.deletePrefix(job.deliveryPrefix);
    } else if (job.storageKey) {
      await this.storage.deleteObject(job.storageKey);
    }
    this.logger.log(`cleaned storage for media ${job.mediaId}`);
  }

  // ─── helpers ──────────────────────────────────────────────────────────────────

  private async finalize(
    mediaId: string,
    masterKey: string,
    outputPrefix: string,
    durationSeconds?: string | undefined,
    width?: number | undefined,
    height?: number | undefined,
  ): Promise<void> {
    await this.media.markReady(mediaId, {
      hlsMasterKey: masterKey,
      deliveryPrefix: outputPrefix,
      isHls: true,
      ...(durationSeconds ? { durationSeconds } : {}),
      ...(width !== undefined ? { width } : {}),
      ...(height !== undefined ? { height } : {}),
    });
    this.logger.log(`media ${mediaId} transcode → ready`);
  }

  private async enqueuePoll(job: TranscodePollJob): Promise<void> {
    await this.queue.send(QueueName.MEDIA, JobName.TRANSCODE_POLL, job, { delaySeconds: this.pollDelay(job.attempt) });
  }

  /**
   * Safety net (cron-driven): catch assets stuck in `processing` whose poll chain broke
   * (lost message, DLQ'd poll, worker crash). Resume polling, or fail past an absolute cap.
   * A healthy chain refreshes `updated_at` every poll, so it's never flagged.
   */
  async reconcileStuck(): Promise<void> {
    const stuckSeconds = this.config.get<number>('MEDIA_TRANSCODE_STUCK_SECONDS') ?? 300;
    const maxSeconds = this.config.get<number>('MEDIA_TRANSCODE_MAX_SECONDS') ?? 21_600; // 6h
    const rows = await this.media.findStuckProcessing(stuckSeconds, 50);
    for (const row of rows) {
      const ageSeconds = (Date.now() - new Date(row.createdAt).getTime()) / 1000;
      if (!row.processingJobId || ageSeconds > maxSeconds) {
        await this.media.markFailed(row.id, 'transcode stalled / exceeded max processing time');
        this.logger.warn(`reconcile: failed stuck media ${row.id}`);
        continue;
      }
      const assetRoot = (row.storageKey ?? '').replace(/\/original\/[^/]*$/, '/');
      await this.enqueuePoll({
        mediaId: row.id,
        jobId: row.processingJobId,
        masterKey: `${assetRoot}hls/master.m3u8`,
        outputPrefix: `${assetRoot}hls/`,
        attempt: 0,
      });
      this.logger.warn(`reconcile: resumed poll for stuck media ${row.id}`);
    }
  }
}
