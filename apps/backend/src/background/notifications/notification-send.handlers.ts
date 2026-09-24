import { Injectable } from '@nestjs/common';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import {
  IPushToDevicesJob,
  IPushToTopicJob,
  IPushToUserJob,
} from '@bg/interfaces/job.interface';
import { NotificationSendJobService } from './notification-send-job.service';

@QueueHandler({ queue: QueueName.NOTIFICATIONS, name: JobName.PUSH_TO_USER })
@Injectable()
export class PushToUserHandler implements JobHandler<IPushToUserJob> {
  constructor(private readonly jobs: NotificationSendJobService) {}
  handle(message: QueueMessage<IPushToUserJob>): Promise<void> {
    return this.jobs.runPushToUser(message.body);
  }
}

@QueueHandler({ queue: QueueName.NOTIFICATIONS, name: JobName.PUSH_TO_DEVICES })
@Injectable()
export class PushToDevicesHandler implements JobHandler<IPushToDevicesJob> {
  constructor(private readonly jobs: NotificationSendJobService) {}
  handle(message: QueueMessage<IPushToDevicesJob>): Promise<void> {
    return this.jobs.runPushToDevices(message.body);
  }
}

@QueueHandler({ queue: QueueName.NOTIFICATIONS, name: JobName.PUSH_TO_TOPIC })
@Injectable()
export class PushToTopicHandler implements JobHandler<IPushToTopicJob> {
  constructor(private readonly jobs: NotificationSendJobService) {}
  handle(message: QueueMessage<IPushToTopicJob>): Promise<void> {
    return this.jobs.runPushToTopic(message.body);
  }
}
