import { IOtpEmailJob } from '@bg/interfaces/job.interface';
import { QueueHandler } from '@queue/consumer/queue-handler.decorator';
import { JobHandler, QueueMessage } from '@queue/interfaces/queue.interface';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable } from '@nestjs/common';
import { EmailJobService } from './email-job.service';

@QueueHandler({ queue: QueueName.EMAIL, name: JobName.OTP_EMAIL })
@Injectable()
export class EmailOtpHandler implements JobHandler<IOtpEmailJob> {
  constructor(private readonly emailJobService: EmailJobService) {}

  async handle(message: QueueMessage<IOtpEmailJob>): Promise<void> {
    await this.emailJobService.sendOtpEmail(message.body);
  }
}
