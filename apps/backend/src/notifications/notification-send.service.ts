import { Injectable, Logger } from '@nestjs/common';
import { QueueService } from '@queue/queue.service';
import { JobName, QueueName } from '@queue/queue.constant';
import {
  IPushJobPayload,
  IPushToDevicesJob,
  IPushToTopicJob,
  IPushToUserJob,
} from '@bg/interfaces/job.interface';

/**
 * Business-facing push API. Every send is fire-and-forget: the request path enqueues
 * an SQS job and returns immediately. Workers under `src/background/notifications/`
 * consume the queue, call FCM, and record outcomes in notification_logs.
 *
 * Feature code should always call this service — never talk to FcmProvider or the
 * queue directly. Keeps the hot path off FCM latency and lets us evolve delivery
 * without changing call sites.
 */
@Injectable()
export class NotificationSendService {
  private readonly logger = new Logger(NotificationSendService.name);

  constructor(private readonly queue: QueueService) {}

  /**
   * Transactional push: resolve the user's active devices in the worker and multicast.
   * Enqueues one job regardless of device count; the worker handles multi-device fan-out.
   */
  async sendToUser(userId: string, payload: IPushJobPayload): Promise<void> {
    const job: IPushToUserJob = { userId, payload };
    await this.queue.send(QueueName.NOTIFICATIONS, JobName.PUSH_TO_USER, job);
    this.logger.debug(`Enqueued PUSH_TO_USER user=${userId} template=${payload.templateKey}`);
  }

  /**
   * Broadcast to a topic (e.g. 'all', 'daily_streak'). One FCM call, no per-device enumeration.
   * FCM topic subscription must already be in place (see topic-subscribe endpoints).
   */
  async sendToTopic(topic: string, payload: IPushJobPayload): Promise<void> {
    const job: IPushToTopicJob = { topic, payload };
    await this.queue.send(QueueName.NOTIFICATIONS, JobName.PUSH_TO_TOPIC, job);
    this.logger.debug(`Enqueued PUSH_TO_TOPIC topic=${topic} template=${payload.templateKey}`);
  }

  /**
   * Send to a pre-resolved set of device_token ids. Used by admin campaign fan-out and any
   * caller that already knows the target device ids (e.g. cross-user broadcasts).
   */
  async sendToDevices(
    deviceTokenIds: string[],
    payload: IPushJobPayload,
    ownerUserId?: string,
  ): Promise<void> {
    if (deviceTokenIds.length === 0) {
      return;
    }
    const job: IPushToDevicesJob = {
      deviceTokenIds,
      ...(ownerUserId ? { userId: ownerUserId } : {}),
      payload,
    };
    await this.queue.send(QueueName.NOTIFICATIONS, JobName.PUSH_TO_DEVICES, job);
    this.logger.debug(`Enqueued PUSH_TO_DEVICES devices=${deviceTokenIds.length} template=${payload.templateKey}`);
  }
}
