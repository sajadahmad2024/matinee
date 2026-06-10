import { CacheService } from '@cache/cache.service';
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
  ) {}

  // ─── ASYNC ticks (enqueue → background handler) ───────────────────────────────

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  scheduleDailyMail(): Promise<void> {
    return this.tick(CronName.DAILY_MAIL, () => this.queue.send(QueueName.CRON, JobName.DAILY_MAIL, { jobType: JobName.DAILY_MAIL }));
  }

  /** Resume/fail transcodes whose poll chain went stale (broken/lost message). */
  @Cron(CronExpression.EVERY_10_MINUTES)
  scheduleMediaReconcile(): Promise<void> {
    return this.tick(CronName.MEDIA_RECONCILE, () => this.queue.send(QueueName.MEDIA, JobName.MEDIA_RECONCILE, {}));
  }

  /** Delete never-completed uploads (rows stuck in `pending`). */
  @Cron(CronExpression.EVERY_HOUR)
  scheduleMediaOrphanSweep(): Promise<void> {
    return this.tick(CronName.MEDIA_ORPHAN_SWEEP, () => this.queue.send(QueueName.MEDIA, JobName.MEDIA_ORPHAN_SWEEP, {}));
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
