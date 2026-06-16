import { QueueName } from '../queue.constant';

/** A received message, provider-agnostic. */
export interface QueueMessage<T = unknown> {
  /** Provider message id (SQS MessageId). */
  id: string;
  /** Job name (carried as a message attribute). */
  name: string;
  /** Deserialized payload. */
  body: T;
  /** Handle used to acknowledge (delete) or extend the message. */
  receiptHandle: string;
  /** How many times this message has been received (drives DLQ redrive). */
  receiveCount: number;
}

export interface SendOptions {
  /** Delay before the message becomes visible (0–900s in SQS). */
  delaySeconds?: number;
  /** FIFO message group id (FIFO queues only). */
  groupId?: string;
  /** FIFO dedupe id (FIFO queues only). */
  dedupeId?: string;
}

export interface ReceiveOptions {
  max: number;
  waitSeconds: number;
  visibilitySeconds: number;
}

export interface EnsureQueueOptions {
  dlqName?: string;
  maxReceiveCount?: number;
}

/**
 * Provider-agnostic queue driver. The SQS implementation talks to ElasticMQ
 * locally and AWS SQS in stage/prod with no code change — only env differs.
 */
export interface QueueDriver {
  send<T>(
    queue: QueueName,
    name: string,
    body: T,
    options?: SendOptions,
  ): Promise<{ messageId: string }>;
  receive(queue: QueueName, options: ReceiveOptions): Promise<QueueMessage[]>;
  deleteMessage(queue: QueueName, receiptHandle: string): Promise<void>;
  ensureQueue(queue: QueueName, options?: EnsureQueueOptions): Promise<void>;
}

/** A worker-side job handler. Tag the class with `@QueueHandler({ queue, name })`. */
export interface JobHandler<T = unknown> {
  handle(message: QueueMessage<T>): Promise<void>;
}

export interface QueueHandlerMeta {
  queue: QueueName;
  name: string;
}
