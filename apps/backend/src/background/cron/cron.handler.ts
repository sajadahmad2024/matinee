import { ICronJob } from '@bg/interfaces/job.interface';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable } from '@nestjs/common';
import { CronService } from './cron.service';

@QueueHandler({ queue: QueueName.CRON, name: JobName.DAILY_MAIL })
@Injectable()
export class DailyMailHandler implements JobHandler<ICronJob> {
  constructor(private readonly cronService: CronService) {}

  async handle(message: QueueMessage<ICronJob>): Promise<void> {
    await this.cronService.sendDailyMail(message.body?.data);
  }
}
