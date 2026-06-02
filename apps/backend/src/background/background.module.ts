import { EmailModule } from '@email/email.module';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { EmailJobService } from './email/email-job.service';
import { EmailOtpHandler } from './email/email.handler';
import { CronService } from './cron/cron.service';
import { CronScheduler } from './cron/cron.scheduler';
import { DailyMailHandler } from './cron/cron.handler';

/**
 * Worker-scoped background jobs. Import ONLY in WorkerModule so the cron
 * scheduler fires once and the @QueueHandler providers are discovered by the
 * QueueConsumerService. Producers (QueueService) live in the global QueueModule.
 */
@Module({
  imports: [ScheduleModule.forRoot(), EmailModule],
  providers: [EmailJobService, EmailOtpHandler, CronService, CronScheduler, DailyMailHandler],
})
export class BackgroundModule {}
