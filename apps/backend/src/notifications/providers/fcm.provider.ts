import { EnvConfig } from '@config/env.config';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type * as admin from 'firebase-admin';
import { FirebaseAdminService } from '@auth/services/firebase-admin.service';

/**
 * Payload for a single push. Higher layers build this via a payload factory;
 * this provider is pure transport.
 */
export interface FcmPayload {
  title: string;
  body: string;
  imageUrl?: string;
  /** Deep-link + custom fields. All values are stringified before send (FCM requirement). */
  data?: Record<string, string | number | boolean | null | undefined>;
}

export interface FcmSendResult {
  fcmToken: string;
  success: boolean;
  messageId?: string;
  errorCode?: string;
  errorMessage?: string;
  /** True when the error means the token will never work again → deactivate it. */
  isPermanent?: boolean;
}

export interface FcmTopicSendResult {
  messageId: string;
}

/**
 * FCM permanent error codes — the token is invalid and further sends will always fail.
 * Callers must deactivate the device on these.
 */
const PERMANENT_FCM_ERROR_CODES: ReadonlySet<string> = new Set([
  'messaging/registration-token-not-registered',
  'messaging/invalid-registration-token',
  'messaging/invalid-argument',
  'messaging/mismatched-credential',
]);

/** FCM multicast has a hard cap of 500 tokens per call; higher layers must chunk. */
export const FCM_MULTICAST_MAX = 500;

/**
 * Single Firebase Cloud Messaging provider. No abstraction until a second push provider
 * is a real requirement. Reuses the Firebase app singleton owned by FirebaseAdminService.
 */
@Injectable()
export class FcmProvider {
  private readonly logger = new Logger(FcmProvider.name);
  private readonly dryRun: boolean;
  private readonly defaultAndroidChannelId: string;
  private readonly defaultWebIconUrl: string;

  constructor(
    private readonly config: ConfigService<EnvConfig>,
    private readonly firebase: FirebaseAdminService,
  ) {
    this.dryRun = (this.config.get<boolean>('FCM_DRY_RUN') as boolean | undefined) ?? false;
    this.defaultAndroidChannelId = this.config.get<string>('FCM_DEFAULT_ANDROID_CHANNEL_ID') ?? 'default';
    this.defaultWebIconUrl = this.config.get<string>('FCM_DEFAULT_WEB_ICON_URL') ?? '';
    if (this.dryRun) {
      this.logger.warn('FCM dry-run mode enabled — pushes will be logged, not sent.');
    }
  }

  /**
   * Send the same payload to up to 500 tokens in one FCM multicast call.
   * Caller is responsible for chunking beyond that. Returns per-token outcomes so the
   * caller can deactivate permanently-failed tokens and log everything.
   */
  async sendToTokens(fcmTokens: string[], payload: FcmPayload): Promise<FcmSendResult[]> {
    if (fcmTokens.length === 0) {
      return [];
    }
    if (fcmTokens.length > FCM_MULTICAST_MAX) {
      throw new Error(`sendToTokens: max ${FCM_MULTICAST_MAX} tokens per call, got ${fcmTokens.length}`);
    }

    if (this.dryRun) {
      this.logger.debug(`[dry-run] sendToTokens tokens=${fcmTokens.length} title="${payload.title}"`);
      return fcmTokens.map((fcmToken) => ({ fcmToken, success: true, messageId: 'dry-run' }));
    }

    const message = this.buildMulticastMessage(fcmTokens, payload);
    const response = await this.firebase.getMessaging().sendEachForMulticast(message);

    return response.responses.map((r, i) => {
      const fcmToken = fcmTokens[i]!;
      if (r.success) {
        return { fcmToken, success: true, messageId: r.messageId ?? '' };
      }
      const errorCode = r.error?.code ?? 'messaging/unknown-error';
      return {
        fcmToken,
        success: false,
        errorCode,
        errorMessage: r.error?.message ?? 'unknown error',
        isPermanent: PERMANENT_FCM_ERROR_CODES.has(errorCode),
      };
    });
  }

  /** One FCM call, no token enumeration. Errors bubble up (SQS retries transient). */
  async sendToTopic(topic: string, payload: FcmPayload): Promise<FcmTopicSendResult> {
    if (this.dryRun) {
      this.logger.debug(`[dry-run] sendToTopic topic=${topic} title="${payload.title}"`);
      return { messageId: 'dry-run' };
    }
    const message = this.buildTopicMessage(topic, payload);
    const messageId = await this.firebase.getMessaging().send(message);
    return { messageId };
  }

  // ─── Payload builders ────────────────────────────────────────────────────

  private buildMulticastMessage(tokens: string[], payload: FcmPayload): admin.messaging.MulticastMessage {
    const notification: admin.messaging.Notification = { title: payload.title, body: payload.body };
    if (payload.imageUrl) {
      notification.imageUrl = payload.imageUrl;
    }
    const data = this.stringifyData(payload.data);
    return {
      tokens,
      notification,
      ...(data ? { data } : {}),
      android: this.buildAndroidBlock(payload),
      webpush: this.buildWebPushBlock(payload),
    };
  }

  private buildTopicMessage(topic: string, payload: FcmPayload): admin.messaging.Message {
    const notification: admin.messaging.Notification = { title: payload.title, body: payload.body };
    if (payload.imageUrl) {
      notification.imageUrl = payload.imageUrl;
    }
    const data = this.stringifyData(payload.data);
    return {
      topic,
      notification,
      ...(data ? { data } : {}),
      android: this.buildAndroidBlock(payload),
      webpush: this.buildWebPushBlock(payload),
    };
  }

  private buildAndroidBlock(payload: FcmPayload): admin.messaging.AndroidConfig {
    return {
      notification: {
        channelId: this.defaultAndroidChannelId,
        title: payload.title,
        body: payload.body,
      },
    };
  }

  private buildWebPushBlock(payload: FcmPayload): admin.messaging.WebpushConfig {
    const webNotification: Record<string, string> = { title: payload.title, body: payload.body };
    if (payload.imageUrl || this.defaultWebIconUrl) {
      webNotification['icon'] = payload.imageUrl ?? this.defaultWebIconUrl;
    }
    return { notification: webNotification };
  }

  /** FCM requires all data-block values to be strings. Null/undefined values are dropped. */
  private stringifyData(data: FcmPayload['data']): Record<string, string> | undefined {
    if (!data) {
      return undefined;
    }
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(data)) {
      if (v === null || v === undefined) {
        continue;
      }
      out[k] = String(v);
    }
    return Object.keys(out).length > 0 ? out : undefined;
  }
}
