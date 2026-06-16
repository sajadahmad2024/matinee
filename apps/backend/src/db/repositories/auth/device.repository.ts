import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { deviceTokens, deviceTokenTopics, users } from '@db/drizzle/schema';
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

  async setTopics(deviceTokenId: string, topics: string[], tx?: DBExecutor): Promise<void> {
    const db = this.exec(tx);
    await db.delete(deviceTokenTopics).where(eq(deviceTokenTopics.deviceTokenId, deviceTokenId));
    if (topics.length > 0) {
      await db.insert(deviceTokenTopics).values(topics.map((topic) => ({ deviceTokenId, topic }))).onConflictDoNothing();
    }
  }

  async getTopics(deviceTokenId: string, tx?: DBExecutor): Promise<string[]> {
    const rows = await this.exec(tx)
      .select({ topic: deviceTokenTopics.topic })
      .from(deviceTokenTopics)
      .where(eq(deviceTokenTopics.deviceTokenId, deviceTokenId));
    return rows.map((r) => r.topic);
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

  /** Reassign all of a guest's devices to the merged-into user. */
  async repointUser(fromUserId: string, toUserId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(deviceTokens).set({ userId: toUserId, updatedAt: sql`now()` }).where(eq(deviceTokens.userId, fromUserId));
  }
}
