import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { CronScheduler } from './cron.scheduler';
import { CronService } from './cron.service';

/**
 * Dedicated cron module — the scheduling PRODUCER. Import ONLY in WorkerModule so timers
 * fire once per cluster. Heavy work is pushed to the background queue (async handlers);
 * trivial work runs inline. `CronService` is exported so async handlers can invoke task
 * bodies off the queue.
 */
@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [CronScheduler, CronService],
  exports: [CronService],
})
export class CronModule {}
