import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { deviceTokens, users } from '@db/drizzle/schema';
import { and, desc, eq, sql } from 'drizzle-orm';

export interface DeviceRecord {
  id: string;
  platform: string;
}

export interface DeviceListItem {
  id: string;
  platform: string;
  deviceId: string | null;
  appVersion: string | null;
  isActive: boolean;
  lastSeenAt: string | null;
  createdAt: string;
}

export interface DeviceOwner {
  userId: string;
  accountType: string;
}

@Injectable()
export class DeviceRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Who currently owns this fcm_token (and what kind of account), if anyone. */
  async findOwner(fcmToken: string, tx?: DBExecutor): Promise<DeviceOwner | null> {
    const rows = await this.exec(tx)
      .select({ userId: deviceTokens.userId, accountType: users.accountType })
      .from(deviceTokens)
      .innerJoin(users, eq(deviceTokens.userId, users.id))
      .where(eq(deviceTokens.fcmToken, fcmToken))
      .limit(1);
    const row = rows[0];
    return row ? { userId: row.userId, accountType: row.accountType } : null;
  }

  /** Upsert by fcm_token; re-registration moves the token to the current user. */
  async upsert(
    input: { userId: string; fcmToken: string; platform: string; deviceId?: string | undefined; appVersion?: string | undefined },
    tx?: DBExecutor,
  ): Promise<DeviceRecord> {
    const rows = await this.exec(tx)
      .insert(deviceTokens)
      .values({
        userId: input.userId,
        fcmToken: input.fcmToken,
        platform: input.platform,
        ...(input.deviceId ? { deviceId: input.deviceId } : {}),
        ...(input.appVersion ? { appVersion: input.appVersion } : {}),
        isActive: true,
        lastSeenAt: sql`now()`,
      })
      .onConflictDoUpdate({
        target: deviceTokens.fcmToken,
        set: { userId: input.userId, platform: input.platform, isActive: true, lastSeenAt: sql`now()`, updatedAt: sql`now()` },
      })
      .returning({ id: deviceTokens.id, platform: deviceTokens.platform });
    return rows[0]!;
  }

  /** A user's registered devices (newest-seen first) — for the "manage devices" screen. */
  async listByUser(userId: string, tx?: DBExecutor): Promise<DeviceListItem[]> {
    return this.exec(tx)
      .select({
        id: deviceTokens.id,
        platform: deviceTokens.platform,
        deviceId: deviceTokens.deviceId,
        appVersion: deviceTokens.appVersion,
        isActive: deviceTokens.isActive,
        lastSeenAt: deviceTokens.lastSeenAt,
        createdAt: deviceTokens.createdAt,
      })
      .from(deviceTokens)
      .where(eq(deviceTokens.userId, userId))
      .orderBy(desc(deviceTokens.lastSeenAt));
  }

  async removeByFcm(userId: string, fcmToken: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).delete(deviceTokens).where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.fcmToken, fcmToken)));
  }

  // ─── Push send support ──────────────────────────────────────────────────────

  /**
   * Active push targets for a user — the send worker uses this to resolve FCM tokens.
   * Returns rows in a shape the FCM caller can immediately use: id (for logs + deactivate),
   * fcmToken (for the actual send), platform (for optional per-platform payload tweaks).
   */
  async listActiveTokensByUser(
    userId: string,
    tx?: DBExecutor,
  ): Promise<Array<{ id: string; fcmToken: string; platform: string }>> {
    return this.exec(tx)
      .select({
        id: deviceTokens.id,
        fcmToken: deviceTokens.fcmToken,
        platform: deviceTokens.platform,
      })
      .from(deviceTokens)
      .where(and(eq(deviceTokens.userId, userId), eq(deviceTokens.isActive, true)));
  }

  /** Same shape as listActiveTokensByUser, but for a pre-resolved set of device ids. */
  async listActiveTokensByIds(
    deviceTokenIds: string[],
    tx?: DBExecutor,
  ): Promise<Array<{ id: string; fcmToken: string; platform: string }>> {
    if (deviceTokenIds.length === 0) {
      return [];
    }
    return this.exec(tx)
      .select({
        id: deviceTokens.id,
        fcmToken: deviceTokens.fcmToken,
        platform: deviceTokens.platform,
      })
      .from(deviceTokens)
      .where(
        and(
          eq(deviceTokens.isActive, true),
          sql`${deviceTokens.id} = ANY(${deviceTokenIds}::uuid[])`,
        ),
      );
  }

  /**
   * Soft-deactivate on permanent FCM error (e.g. registration-token-not-registered).
   * Rows are kept for audit + reactivation on re-register. Topic rows drop when the
   * row is later hard-deleted; while inactive, sends skip them via listActiveTokensByUser.
   */
  async deactivate(deviceTokenId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(deviceTokens)
      .set({ isActive: false, updatedAt: sql`now()` })
      .where(eq(deviceTokens.id, deviceTokenId));
  }
}
