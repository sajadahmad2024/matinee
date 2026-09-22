import { Injectable, Logger } from '@nestjs/common';
import { DeviceRepository } from '@db/repositories/auth/device.repository';
import { NotificationLogsRepository } from '@db/repositories/notifications/notification-logs.repository';
import {
  FCM_MULTICAST_MAX,
  FcmPayload,
  FcmProvider,
  FcmSendResult,
} from '@notifications/providers/fcm.provider';
import {
  IPushJobPayload,
  IPushToDevicesJob,
  IPushToTopicJob,
  IPushToUserJob,
} from '@bg/interfaces/job.interface';

/**
 * Worker-side execution for every push job. Handlers under `notification-send.handlers.ts`
 * are thin wrappers that dispatch here.
 *
 * Key invariants:
 *  - Never re-throw permanent FCM errors (stale token, invalid arg) — swallow and log
 *    so SQS doesn't retry pointlessly. Deactivate the device inline.
 *  - Always re-throw transient errors so SQS retries via visibility timeout / DLQ.
 *  - Batch multicast in chunks of FCM_MULTICAST_MAX (500).
 *  - Log every attempt (sent or failed) to notification_logs for audit.
 *
 * Topic subscription is client-managed (FirebaseMessaging.subscribeToTopic on the client);
 * this service only *sends* to topics, it does not manage subscriptions.
 */
@Injectable()
export class NotificationSendJobService {
  private readonly logger = new Logger(NotificationSendJobService.name);

  constructor(
    private readonly fcm: FcmProvider,
    private readonly devices: DeviceRepository,
    private readonly logs: NotificationLogsRepository,
  ) {}

  // ─── Push jobs ───────────────────────────────────────────────────────────

  async runPushToUser(job: IPushToUserJob): Promise<void> {
    const targets = await this.devices.listActiveTokensByUser(job.userId);
    if (targets.length === 0) {
      this.logger.debug(`PUSH_TO_USER user=${job.userId} — no active devices, skipping`);
      return;
    }
    await this.multicast(targets, job.payload, job.userId);
  }

  async runPushToDevices(job: IPushToDevicesJob): Promise<void> {
    const targets = await this.devices.listActiveTokensByIds(job.deviceTokenIds);
    if (targets.length === 0) {
      this.logger.debug(`PUSH_TO_DEVICES — no active devices from ${job.deviceTokenIds.length} ids`);
      return;
    }
    await this.multicast(targets, job.payload, job.userId ?? null);
  }

  async runPushToTopic(job: IPushToTopicJob): Promise<void> {
    const fcmPayload = this.toFcmPayload(job.payload);
    try {
      const { messageId } = await this.fcm.sendToTopic(job.topic, fcmPayload);
      await this.logs.createMany([
        {
          userId: null,
          deviceTokenId: null,
          templateKey: job.payload.templateKey,
          title: job.payload.title,
          body: job.payload.body,
          data: (job.payload.data ?? {}) as Record<string, unknown>,
          topic: job.topic,
          status: 'sent',
          fcmMessageId: messageId,
        },
      ]);
    } catch (err) {
      // Topic send failure is one row — record it and re-throw so SQS retries.
      const e = err as Error & { code?: string };
      await this.logs.createMany([
        {
          userId: null,
          deviceTokenId: null,
          templateKey: job.payload.templateKey,
          title: job.payload.title,
          body: job.payload.body,
          data: (job.payload.data ?? {}) as Record<string, unknown>,
          topic: job.topic,
          status: 'failed',
          errorCode: e.code ?? 'messaging/unknown-error',
          errorMessage: e.message.slice(0, 300),
        },
      ]);
      throw err;
    }
  }

  // ─── Internals ───────────────────────────────────────────────────────────

  /**
   * Send the same payload to a set of device tokens, chunked by FCM's multicast cap.
   * Records every per-token outcome, deactivates permanently-failed devices.
   */
  private async multicast(
    targets: Array<{ id: string; fcmToken: string; platform: string }>,
    payload: IPushJobPayload,
    userId: string | null,
  ): Promise<void> {
    const fcmPayload = this.toFcmPayload(payload);
    const results: FcmSendResult[] = [];
    for (let i = 0; i < targets.length; i += FCM_MULTICAST_MAX) {
      const batch = targets.slice(i, i + FCM_MULTICAST_MAX);
      const batchResults = await this.fcm.sendToTokens(
        batch.map((t) => t.fcmToken),
        fcmPayload,
      );
      results.push(...batchResults);
    }

    const byToken = new Map(targets.map((t) => [t.fcmToken, t.id]));
    const logRows = results.map((r) => ({
      userId,
      deviceTokenId: byToken.get(r.fcmToken) ?? null,
      templateKey: payload.templateKey,
      title: payload.title,
      body: payload.body,
      data: (payload.data ?? {}) as Record<string, unknown>,
      status: (r.success ? 'sent' : 'failed') as 'sent' | 'failed',
      fcmMessageId: r.messageId ?? null,
      errorCode: r.errorCode ?? null,
      errorMessage: r.errorMessage?.slice(0, 300) ?? null,
    }));
    await this.logs.createMany(logRows);

    // Inline stale-token cleanup — most invalid tokens are caught here.
    const permanentlyFailedIds = results
      .filter((r) => r.isPermanent === true)
      .map((r) => byToken.get(r.fcmToken))
      .filter((id): id is string => Boolean(id));
    for (const id of permanentlyFailedIds) {
      await this.devices.deactivate(id);
    }

    if (permanentlyFailedIds.length > 0) {
      this.logger.log(
        `Push send: ${results.length} attempted, ${results.filter((r) => r.success).length} succeeded, ${permanentlyFailedIds.length} devices deactivated`,
      );
    }
  }

  private toFcmPayload(payload: IPushJobPayload): FcmPayload {
    return {
      title: payload.title,
      body: payload.body,
      ...(payload.imageUrl ? { imageUrl: payload.imageUrl } : {}),
      ...(payload.data ? { data: payload.data } : {}),
    };
  }
}
