// Worker process: runs the cron scheduler and consumes SQS queues.
import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@config/env-config.module';
import { LoggerModule } from '@logger/logger.module';
import { QueueModule } from '@queue/queue.module';
import { QueueConsumerModule } from '@queue/consumer/queue-consumer.module';
import { BackgroundModule } from '@bg/background.module';

@Module({
  imports: [
    EnvConfigModule,
    LoggerModule,
    QueueModule,
    QueueConsumerModule,
    BackgroundModule,
  ],
})
export class WorkerModule {}
