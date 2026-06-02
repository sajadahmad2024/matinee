import { EnvConfig } from '@config/env.config';
import {
  CreateQueueCommand,
  DeleteMessageCommand,
  GetQueueAttributesCommand,
  GetQueueUrlCommand,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
  SQSClientConfig,
} from '@aws-sdk/client-sqs';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  EnsureQueueOptions,
  QueueDriver,
  QueueMessage,
  ReceiveOptions,
  SendOptions,
} from '../interfaces/queue.interface';
import { QueueName } from '../queue.constant';

const JOB_NAME_ATTR = 'jobName';

/**
 * SQS-backed queue driver.
 *
 * Same code for ElasticMQ (local) and AWS SQS (stage/prod):
 *  - local: SQS_ENDPOINT=http://localhost:9326, dummy creds
 *  - prod:  SQS_ENDPOINT empty → SDK resolves real AWS SQS for SQS_REGION,
 *           credentials from the default provider chain (IAM role)
 */
@Injectable()
export class SqsQueueDriver implements QueueDriver {
  private readonly logger = new Logger(SqsQueueDriver.name);
  private readonly client: SQSClient;
  private readonly prefix: string;
  private readonly urlCache = new Map<string, string>();

  constructor(config: ConfigService<EnvConfig>) {
    const region = config.get<string>('SQS_REGION') ?? 'us-east-1';
    const endpoint = config.get<string>('SQS_ENDPOINT');
    const accessKeyId = config.get<string>('SQS_ACCESS_KEY_ID');
    const secretAccessKey = config.get<string>('SQS_SECRET_ACCESS_KEY');

    const clientConfig: SQSClientConfig = { region };
    if (endpoint) {
      clientConfig.endpoint = endpoint;
    }
    // Only set explicit creds when provided (local). In prod, leaving these
    // unset lets the SDK use the IAM role / default credential chain.
    if (accessKeyId && secretAccessKey) {
      clientConfig.credentials = { accessKeyId, secretAccessKey };
    }

    this.client = new SQSClient(clientConfig);
    this.prefix = config.get<string>('SQS_QUEUE_PREFIX') ?? '';
  }

  private fullName(name: string): string {
    return `${this.prefix}${name}`;
  }

  async send<T>(
    queue: QueueName,
    name: string,
    body: T,
    options?: SendOptions,
  ): Promise<{ messageId: string }> {
    const url = await this.resolveUrl(queue);
    const input: ConstructorParameters<typeof SendMessageCommand>[0] = {
      QueueUrl: url,
      MessageBody: JSON.stringify(body),
      MessageAttributes: {
        [JOB_NAME_ATTR]: { DataType: 'String', StringValue: name },
      },
    };
    if (options?.delaySeconds !== undefined) {
      input.DelaySeconds = options.delaySeconds;
    }
    if (options?.groupId !== undefined) {
      input.MessageGroupId = options.groupId;
    }
    if (options?.dedupeId !== undefined) {
      input.MessageDeduplicationId = options.dedupeId;
    }
    const res = await this.client.send(new SendMessageCommand(input));
    return { messageId: res.MessageId ?? '' };
  }

  async receive(queue: QueueName, options: ReceiveOptions): Promise<QueueMessage[]> {
    const url = await this.resolveUrl(queue);
    const res = await this.client.send(
      new ReceiveMessageCommand({
        QueueUrl: url,
        MaxNumberOfMessages: options.max,
        WaitTimeSeconds: options.waitSeconds,
        VisibilityTimeout: options.visibilitySeconds,
        MessageAttributeNames: ['All'],
        MessageSystemAttributeNames: ['ApproximateReceiveCount'],
      }),
    );

    const messages = res.Messages ?? [];
    return messages.map((m) => {
      const nameAttr = m.MessageAttributes?.[JOB_NAME_ATTR]?.StringValue ?? '';
      const receiveCount = parseInt(m.Attributes?.['ApproximateReceiveCount'] ?? '1', 10);
      let body: unknown = null;
      try {
        body = m.Body ? JSON.parse(m.Body) : null;
      } catch {
        body = m.Body ?? null;
      }
      return {
        id: m.MessageId ?? '',
        name: nameAttr,
        body,
        receiptHandle: m.ReceiptHandle ?? '',
        receiveCount,
      };
    });
  }

  async deleteMessage(queue: QueueName, receiptHandle: string): Promise<void> {
    const url = await this.resolveUrl(queue);
    await this.client.send(
      new DeleteMessageCommand({ QueueUrl: url, ReceiptHandle: receiptHandle }),
    );
  }

  async ensureQueue(queue: QueueName, options?: EnsureQueueOptions): Promise<void> {
    const fullName = this.fullName(queue);

    // Already exists (e.g. ElasticMQ conf or IaC) → just cache the URL.
    const existing = await this.tryGetUrl(fullName);
    if (existing) {
      this.urlCache.set(queue, existing);
      return;
    }

    const attributes: Record<string, string> = {};
    if (options?.dlqName) {
      const dlqFull = this.fullName(options.dlqName);
      const dlqUrl = (await this.tryGetUrl(dlqFull)) ?? (await this.createQueue(dlqFull));
      const dlqArn = await this.getQueueArn(dlqUrl);
      attributes['RedrivePolicy'] = JSON.stringify({
        deadLetterTargetArn: dlqArn,
        maxReceiveCount: String(options.maxReceiveCount ?? 5),
      });
    }

    const url = await this.createQueue(fullName, attributes);
    this.urlCache.set(queue, url);
    this.logger.log(`Ensured queue "${fullName}"${options?.dlqName ? ' (+DLQ)' : ''}`);
  }

  private async resolveUrl(queue: QueueName): Promise<string> {
    const cached = this.urlCache.get(queue);
    if (cached) {
      return cached;
    }
    const url = await this.createQueueOrGet(this.fullName(queue));
    this.urlCache.set(queue, url);
    return url;
  }

  private async createQueueOrGet(fullName: string): Promise<string> {
    const existing = await this.tryGetUrl(fullName);
    if (existing) {
      return existing;
    }
    return this.createQueue(fullName);
  }

  private async createQueue(fullName: string, attributes?: Record<string, string>): Promise<string> {
    const input: ConstructorParameters<typeof CreateQueueCommand>[0] = { QueueName: fullName };
    if (attributes && Object.keys(attributes).length > 0) {
      input.Attributes = attributes;
    }
    const res = await this.client.send(new CreateQueueCommand(input));
    return res.QueueUrl ?? '';
  }

  private async tryGetUrl(fullName: string): Promise<string | null> {
    try {
      const res = await this.client.send(new GetQueueUrlCommand({ QueueName: fullName }));
      return res.QueueUrl ?? null;
    } catch (error) {
      const name = (error as { name?: string }).name ?? '';
      if (name === 'QueueDoesNotExist' || name === 'AWS.SimpleQueueService.NonExistentQueue') {
        return null;
      }
      throw error;
    }
  }

  private async getQueueArn(url: string): Promise<string> {
    const res = await this.client.send(
      new GetQueueAttributesCommand({ QueueUrl: url, AttributeNames: ['QueueArn'] }),
    );
    return res.Attributes?.['QueueArn'] ?? '';
  }
}
