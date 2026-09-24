import { EmailModule } from '@email/email.module';
import { SmsModule } from '@sms/sms.module';
import { Module } from '@nestjs/common';
import { EmailJobService } from './email/email-job.service';
import { EmailOtpHandler } from './email/email.handler';
import { SmsJobService } from './sms/sms-job.service';
import { SmsSendHandler } from './sms/sms.handler';
import { NotificationFanoutJobService } from './notifications/notification-fanout-job.service';
import { NotificationFanoutHandler } from './notifications/notification.handler';
import { CronModule } from './cron/cron.module';
import { DailyMailHandler } from './cron/cron.handler';
import { ContentJobService } from './content/content-job.service';
import {
  ContentPublishScheduledHandler,
  ContentLicenseExpiryHandler,
} from './content/content.handlers';

/**
 * Worker-scoped ASYNC job CONSUMERS — the @QueueHandler providers discovered by the
 * QueueConsumerService. Scheduling (the producer) lives in CronModule; this module holds
 * the handlers that do the work pushed onto the queue. Import ONLY in WorkerModule.
 *
 * Media is INTENTIONALLY absent here — the transcoder Lambda (invoked directly by SQS via
 * event-source mapping, see infra/floci/lambda.tf) owns every media state transition beyond
 * the initial `pending` row the API creates. The NestJS worker has no media-related handlers.
 */
@Module({
  imports: [EmailModule, SmsModule, CronModule],
  providers: [
    EmailJobService,
    EmailOtpHandler,
    SmsJobService,
    SmsSendHandler,
    NotificationFanoutJobService,
    NotificationFanoutHandler,
    DailyMailHandler,
    ContentJobService,
    ContentPublishScheduledHandler,
    ContentLicenseExpiryHandler,
  ],
})
export class BackgroundModule {}
