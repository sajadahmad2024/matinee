import { CacheService } from '@cache/cache.service';
import { MediaService } from '@media/media.service';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CronService } from './cron.service';
import { CRON_LOCK_TTL, CronName } from './cron.constant';

/**
 * The ONLY place scheduled timers live. Worker-only (CronModule is imported by WorkerModule),
 * so ticks fire once per cluster — guarded by a distributed lock so that with multiple worker
 * replicas exactly one runs each tick. A tick is tiny: it either runs a trivial SYNC task
 * inline, or (default) enqueues an SQS job for a background handler to run ASYNC.
 */
@Injectable()
export class CronScheduler {
  private readonly logger = new Logger(CronScheduler.name);

  constructor(
    private readonly queue: QueueService,
    private readonly cache: CacheService,
    private readonly tasks: CronService,
    private readonly media: MediaService,
  ) {}

  // ─── ASYNC ticks (enqueue → background handler) ───────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  scheduleDailyMail(): Promise<void> {
    return this.tick(CronName.DAILY_MAIL, () => this.queue.send(QueueName.CRON, JobName.DAILY_MAIL, { jobType: JobName.DAILY_MAIL }));
  }

  /**
   * Fail rows stuck in PROCESSING (Lambda that half-succeeded — wrote HLS but couldn't
   * UPDATE — is the classic case). Runs INLINE via MediaService instead of enqueueing:
   * cron ticks are already single-flight thanks to `withLock`, and the work is a bounded
   * few DB writes.
   */
  @Cron(CronExpression.EVERY_10_MINUTES)
  scheduleMediaReconcile(): Promise<void> {
    return this.tick(CronName.MEDIA_RECONCILE, () => this.media.reconcileStuck());
  }

  /** Delete never-completed uploads (rows stuck in `pending`). Runs INLINE. */
  @Cron(CronExpression.EVERY_HOUR)
  scheduleMediaOrphanSweep(): Promise<void> {
    return this.tick(CronName.MEDIA_ORPHAN_SWEEP, () => this.media.sweepOrphans());
  }

  /** Go-live scheduled content whose publish time has passed. */
  @Cron(CronExpression.EVERY_MINUTE)
  schedulePublishScheduled(): Promise<void> {
    return this.tick(CronName.PUBLISH_SCHEDULED, () =>
      this.queue.send(QueueName.CONTENT, JobName.PUBLISH_SCHEDULED, {}),
    );
  }

  /** Daily reminder for licenses expiring soon. */
  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  scheduleLicenseExpiryReminder(): Promise<void> {
    return this.tick(CronName.LICENSE_EXPIRY_REMINDER, () =>
      this.queue.send(QueueName.CONTENT, JobName.LICENSE_EXPIRY_REMINDER, {}),
    );
  }

  // ─── SYNC tick (trivial, inline) ──────────────────────────────────────────────

  @Cron(CronExpression.EVERY_30_MINUTES)
  runHeartbeat(): Promise<void> {
    return this.tick(CronName.HEARTBEAT, async () => this.tasks.heartbeat());
  }

  // ─── Single-flight tick guard (one worker per tick) ───────────────────────────

  private async tick(name: CronName, run: () => Promise<unknown>): Promise<void> {
    const won = await this.cache.withLock(`cron:${name}`, CRON_LOCK_TTL, async () => {
      await run();
      return true;
    });
    if (won === null) {
      this.logger.debug(`cron ${name} skipped (another worker holds the tick)`);
    }
  }
}
