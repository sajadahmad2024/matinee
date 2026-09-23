import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { notificationLogs } from '@db/drizzle/schema';

/**
 * One row per FCM send attempt for transactional (non-campaign) pushes.
 * Admin-campaign delivery is logged separately in notification_deliveries (0011).
 * `topic` set → broadcast row (user_id + device_token_id null).
 */
export interface CreateLogInput {
  userId?: string | null;
  deviceTokenId?: string | null;
  templateKey: string;
  title?: string | null;
  body?: string | null;
  data?: Record<string, unknown>;
  topic?: string | null;
  status: 'sent' | 'failed';
  fcmMessageId?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
}

@Injectable()
export class NotificationLogsRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Batch insert — send worker records every per-token outcome in one round-trip. */
  async createMany(rows: CreateLogInput[], tx?: DBExecutor): Promise<number> {
    if (rows.length === 0) {
      return 0;
    }
    await this.exec(tx)
      .insert(notificationLogs)
      .values(
        rows.map((r) => ({
          ...(r.userId ? { userId: r.userId } : {}),
          ...(r.deviceTokenId ? { deviceTokenId: r.deviceTokenId } : {}),
          templateKey: r.templateKey,
          ...(r.title ? { title: r.title } : {}),
          ...(r.body ? { body: r.body } : {}),
          data: r.data ?? {},
          ...(r.topic ? { topic: r.topic } : {}),
          status: r.status,
          ...(r.fcmMessageId ? { fcmMessageId: r.fcmMessageId } : {}),
          ...(r.errorCode ? { errorCode: r.errorCode } : {}),
          ...(r.errorMessage ? { errorMessage: r.errorMessage } : {}),
        })),
      );
    return rows.length;
  }
}
