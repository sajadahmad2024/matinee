import { ISmsJob } from '@bg/interfaces/job.interface';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable } from '@nestjs/common';
import { SmsJobService } from './sms-job.service';

@QueueHandler({ queue: QueueName.SMS, name: JobName.SEND_SMS })
@Injectable()
export class SmsSendHandler implements JobHandler<ISmsJob> {
  constructor(private readonly smsJobService: SmsJobService) {}

  async handle(message: QueueMessage<ISmsJob>): Promise<void> {
    await this.smsJobService.send(message.body);
  }
}
