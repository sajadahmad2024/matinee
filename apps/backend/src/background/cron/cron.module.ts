import { MediaModule } from '@media/media.module';
import { AnalyticsRollupModule } from '../../analytics/rollup/analytics-rollup.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronScheduler } from './cron.scheduler';
import { CronService } from './cron.service';

/**
 * Dedicated cron module — the scheduling PRODUCER. Import ONLY in WorkerModule so timers
 * fire once per cluster. Heavy work is pushed to the background queue (async handlers);
 * trivial work runs inline. `CronService` is exported so async handlers can invoke task
 * bodies off the queue.
 *
 * `MediaModule` is imported so the scheduler can call `MediaService.reconcileStuck()` +
 * `sweepOrphans()` inline — no queue hop needed for maintenance work already single-flighted
 * by `withLock`.
 */
@Module({
  imports: [ScheduleModule.forRoot(), MediaModule, AnalyticsRollupModule],
  providers: [CronScheduler, CronService],
  exports: [CronService],
})
export class CronModule {}
