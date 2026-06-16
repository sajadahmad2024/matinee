import { Injectable } from '@nestjs/common';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { ContentJobService } from './content-job.service';

@QueueHandler({ queue: QueueName.CONTENT, name: JobName.PUBLISH_SCHEDULED })
@Injectable()
export class ContentPublishScheduledHandler implements JobHandler<unknown> {
  constructor(private readonly jobs: ContentJobService) {}
  async handle(_message: QueueMessage<unknown>): Promise<void> {
    await this.jobs.publishScheduled();
  }
}

@QueueHandler({ queue: QueueName.CONTENT, name: JobName.LICENSE_EXPIRY_REMINDER })
@Injectable()
export class ContentLicenseExpiryHandler implements JobHandler<unknown> {
  constructor(private readonly jobs: ContentJobService) {}
  async handle(_message: QueueMessage<unknown>): Promise<void> {
    await this.jobs.licenseExpiryReminder();
  }
}
