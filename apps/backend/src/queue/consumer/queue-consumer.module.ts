import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DiscoveryModule } from '@nestjs/core';
import { QueueConsumerService } from './queue-consumer.service';

/**
 * Worker-only module. Import this in WorkerModule (NOT AppModule) so polling
 * runs only in the worker process. Handler providers are discovered across the
 * whole worker DI context via DiscoveryService.
 */
@Module({
  imports: [DiscoveryModule, ConfigModule],
  providers: [QueueConsumerService],
})
export class QueueConsumerModule {}
