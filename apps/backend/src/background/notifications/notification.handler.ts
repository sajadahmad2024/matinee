import { INotifyCampaignFanoutJob } from '@bg/interfaces/job.interface';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable } from '@nestjs/common';
import { NotificationFanoutJobService } from './notification-fanout-job.service';

@QueueHandler({ queue: QueueName.NOTIFICATIONS, name: JobName.NOTIFY_CAMPAIGN_FANOUT })
@Injectable()
export class NotificationFanoutHandler implements JobHandler<INotifyCampaignFanoutJob> {
  constructor(private readonly fanout: NotificationFanoutJobService) {}

  async handle(message: QueueMessage<INotifyCampaignFanoutJob>): Promise<void> {
    await this.fanout.run(message.body);
  }
}
