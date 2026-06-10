import { EmailModule } from '@email/email.module';
import { MediaModule } from '@media/media.module';
import { Module } from '@nestjs/common';
import { EmailJobService } from './email/email-job.service';
import { EmailOtpHandler } from './email/email.handler';
import { CronModule } from './cron/cron.module';
import { DailyMailHandler } from './cron/cron.handler';
import { MediaJobService } from './media/media-job.service';
import {
  MediaTranscodeHandler,
  MediaTranscodePollHandler,
  MediaReconcileHandler,
  MediaOrphanSweepHandler,
  MediaCleanupHandler,
} from './media/media.handlers';

/**
 * Worker-scoped ASYNC job CONSUMERS — the @QueueHandler providers discovered by the
 * QueueConsumerService. Scheduling (the producer) lives in CronModule; this module holds
 * the handlers that do the work pushed onto the queue. Import ONLY in WorkerModule.
 */
@Module({
  imports: [EmailModule, MediaModule, CronModule],
  providers: [
    EmailJobService,
    EmailOtpHandler,
    DailyMailHandler,
    MediaJobService,
    MediaTranscodeHandler,
    MediaTranscodePollHandler,
    MediaReconcileHandler,
    MediaOrphanSweepHandler,
    MediaCleanupHandler,
  ],
})
export class BackgroundModule {}
