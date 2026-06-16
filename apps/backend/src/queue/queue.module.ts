import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SqsQueueDriver } from './drivers/sqs.driver';
import { QueueService } from './queue.service';
import { QUEUE_DRIVER } from './queue.constant';

/**
 * Global producer module. Exposes QueueService (enqueue) + the QUEUE_DRIVER
 * token to the whole app. Driver is env-selected; today SQS (ElasticMQ↔AWS).
 */
@Global()
@Module({
  imports: [ConfigModule],
  providers: [SqsQueueDriver, { provide: QUEUE_DRIVER, useExisting: SqsQueueDriver }, QueueService],
  exports: [QueueService, QUEUE_DRIVER],
})
export class QueueModule {}
