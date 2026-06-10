import { EnvConfig } from '@config/env.config';
import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscoveryService, Reflector } from '@nestjs/core';
import { JobHandler, QueueHandlerMeta, QueueMessage } from '../interfaces/queue.interface';
import { dlqNameFor, QUEUE_DRIVER, QUEUE_HANDLER_METADATA, QueueName } from '../queue.constant';
import type { QueueDriver } from '../interfaces/queue.interface';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Worker-only runtime. On boot it discovers every `@QueueHandler` provider,
 * ensures the queues (+ DLQ redrive) exist, then long-polls each queue and
 * dispatches messages by job name. Successful handlers ack (delete) the
 * message; failures are left to redrive to the DLQ via SQS maxReceiveCount.
 */
@Injectable()
export class QueueConsumerService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(QueueConsumerService.name);
  private running = false;
  private loops: Promise<void>[] = [];
  private readonly handlers = new Map<string, JobHandler>();
  private readonly queues = new Set<QueueName>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly reflector: Reflector,
    private readonly config: ConfigService<EnvConfig>,
    @Inject(QUEUE_DRIVER) private readonly driver: QueueDriver,
  ) {}

  async onModuleInit(): Promise<void> {
    if (!(this.config.get<boolean>('QUEUE_CONSUMER_ENABLED') ?? false)) {
      this.logger.log('Queue consumer disabled (QUEUE_CONSUMER_ENABLED=false)');
      return;
    }

    this.discoverHandlers();
    if (this.queues.size === 0) {
      this.logger.warn('No @QueueHandler providers found; consumer idle');
      return;
    }

    if (this.config.get<boolean>('QUEUE_AUTO_CREATE') ?? false) {
      const maxReceiveCount = this.config.get<number>('QUEUE_MAX_RECEIVE_COUNT') ?? 5;
      for (const queue of this.queues) {
        await this.driver.ensureQueue(queue, { dlqName: dlqNameFor(queue), maxReceiveCount });
      }
    }

    this.running = true;
    for (const queue of this.queues) {
      this.loops.push(this.pollLoop(queue));
    }
    this.logger.log(`Queue consumer started for: ${[...this.queues].join(', ')}`);
  }

  async onModuleDestroy(): Promise<void> {
    this.running = false;
    await Promise.allSettled(this.loops);
  }

  private discoverHandlers(): void {
    for (const wrapper of this.discovery.getProviders()) {
      const { instance, metatype } = wrapper;
      if (!instance || !metatype) {
        continue;
      }
      const meta = this.reflector.get<QueueHandlerMeta | undefined>(
        QUEUE_HANDLER_METADATA,
        metatype,
      );
      if (meta && typeof (instance as JobHandler).handle === 'function') {
        this.handlers.set(`${meta.queue}:${meta.name}`, instance as JobHandler);
        this.queues.add(meta.queue);
        this.logger.log(`Registered handler ${meta.queue}:${meta.name}`);
      }
    }
  }

  private async pollLoop(queue: QueueName): Promise<void> {
    const waitSeconds = this.config.get<number>('QUEUE_WAIT_TIME_SECONDS') ?? 20;
    const visibilitySeconds = this.config.get<number>('QUEUE_VISIBILITY_TIMEOUT') ?? 30;
    const max = this.config.get<number>('QUEUE_BATCH_SIZE') ?? 10;

    while (this.running) {
      try {
        const messages = await this.driver.receive(queue, { max, waitSeconds, visibilitySeconds });
        for (const message of messages) {
          if (!this.running) {
            break;
          }
          await this.dispatch(queue, message);
        }
      } catch (error) {
        this.logger.error(`poll error on "${queue}": ${(error as Error).message}`);
        await sleep(1000);
      }
    }
  }

  private async dispatch(queue: QueueName, message: QueueMessage): Promise<void> {
    const handler = this.handlers.get(`${queue}:${message.name}`);
    if (!handler) {
      this.logger.warn(`No handler for ${queue}:${message.name}; leaving message for redrive`);
      return;
    }
    try {
      await handler.handle(message);
      await this.driver.deleteMessage(queue, message.receiptHandle);
    } catch (error) {
      // Do not delete → visibility timeout lapses → redelivered → DLQ after maxReceiveCount.
      this.logger.error(
        `handler ${queue}:${message.name} failed (receive #${message.receiveCount}): ${
          (error as Error).message
        }`,
      );
    }
  }
}
