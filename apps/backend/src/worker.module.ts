// Worker process: runs the cron scheduler and consumes SQS queues.
import { Module } from '@nestjs/common';
import { EnvConfigModule } from '@config/env-config.module';
import { LoggerModule } from '@logger/logger.module';
import { QueueModule } from '@queue/queue.module';
import { QueueConsumerModule } from '@queue/consumer/queue-consumer.module';
import { BackgroundModule } from '@bg/background.module';
import { CronModule } from '@cron/cron.module';
import { DBModule } from '@db/db.module';
import { CacheModule } from '@cache/cache.module';

@Module({
  imports: [
    EnvConfigModule,
    LoggerModule,
    DBModule, // repositories used by worker jobs (e.g. media transcode/cleanup)
    CacheModule, // distributed lock for cron tick single-flight
    QueueModule,
    QueueConsumerModule,
    CronModule, // scheduling producer (worker-only so timers fire once)
    BackgroundModule, // async job consumers (@QueueHandler)
  ],
})
export class WorkerModule {}
