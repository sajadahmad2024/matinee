import { Inject, Injectable } from '@nestjs/common';
import { QueueDriver, SendOptions } from './interfaces/queue.interface';
import { JobName, QUEUE_DRIVER, QueueName } from './queue.constant';

/**
 * Producer API used by business code to enqueue jobs.
 * Provider-agnostic: backed by SQS (ElasticMQ locally, AWS SQS in prod).
 */
@Injectable()
export class QueueService {
  constructor(@Inject(QUEUE_DRIVER) private readonly driver: QueueDriver) {}

  send<T>(
    queue: QueueName,
    name: JobName | string,
    body: T,
    options?: SendOptions,
  ): Promise<{ messageId: string }> {
    return this.driver.send(queue, String(name), body, options);
  }
}
