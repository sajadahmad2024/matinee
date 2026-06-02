import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';

/**
 * Runs in the worker only (BackgroundModule is worker-scoped). The timer just
 * enqueues a job so the actual work goes through the queue/DLQ machinery.
 */
@Injectable()
export class CronScheduler {
  private readonly logger = new Logger(CronScheduler.name);

  constructor(private readonly queue: QueueService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async scheduleDailyMail(): Promise<void> {
    this.logger.debug('Enqueuing daily mail job');
    await this.queue.send(QueueName.CRON, JobName.DAILY_MAIL, { jobType: JobName.DAILY_MAIL });
  }
}
