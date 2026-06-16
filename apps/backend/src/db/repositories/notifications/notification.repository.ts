import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { userNotifications } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface NotificationRecord {
  id: string;
  category: string;
  title: string;
  body: string | null;
  deepLink: string | null;
  imageMediaId: string | null;
  sourceType: string | null;
  sourceId: string | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
}

export interface NotificationFilter {
  page: number;
  limit: number;
  category?: string;
  unreadOnly?: boolean;
}

@Injectable()
export class NotificationRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Insert a notification into a user's inbox. Used by admin warn + the notifications module. */
  async create(
    userId: string,
    input: { category: string; title: string; body?: string; deepLink?: string; imageMediaId?: string; sourceType?: string; sourceId?: string; campaignId?: string },
    tx?: DBExecutor,
  ): Promise<string> {
    const rows = await this.exec(tx)
      .insert(userNotifications)
      .values({
        userId,
        category: input.category,
        title: input.title,
        ...(input.body ? { body: input.body } : {}),
        ...(input.deepLink ? { deepLink: input.deepLink } : {}),
        ...(input.imageMediaId ? { imageMediaId: input.imageMediaId } : {}),
        ...(input.sourceType ? { sourceType: input.sourceType } : {}),
        ...(input.sourceId ? { sourceId: input.sourceId } : {}),
        ...(input.campaignId ? { campaignId: input.campaignId } : {}),
      })
      .returning({ id: userNotifications.id });
    return rows[0]!.id;
  }

  /** Bulk insert notifications (campaign fan-out). Returns count inserted. */
  async createMany(
    rows: Array<{ userId: string; category: string; title: string; body?: string; deepLink?: string; imageMediaId?: string; campaignId?: string }>,
    tx?: DBExecutor,
  ): Promise<number> {
    if (rows.length === 0) {
      return 0;
    }
    await this.exec(tx).insert(userNotifications).values(
      rows.map((r) => ({
        userId: r.userId,
        category: r.category,
        title: r.title,
        ...(r.body ? { body: r.body } : {}),
        ...(r.deepLink ? { deepLink: r.deepLink } : {}),
        ...(r.imageMediaId ? { imageMediaId: r.imageMediaId } : {}),
        ...(r.campaignId ? { campaignId: r.campaignId } : {}),
      })),
    );
    return rows.length;
  }

  /** Paginated inbox (newest first), uses idx_user_notifications_user. */
  async listByUser(
    userId: string,
    filter: NotificationFilter,
    tx?: DBExecutor,
  ): Promise<{ items: NotificationRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [eq(userNotifications.userId, userId)];
    if (filter.category) {
      conds.push(eq(userNotifications.category, filter.category));
    }
    if (filter.unreadOnly) {
      conds.push(eq(userNotifications.isRead, false));
    }
    const where = and(...conds);
    const [items, totalRes] = await Promise.all([
      db
        .select({
          id: userNotifications.id,
          category: userNotifications.category,
          title: userNotifications.title,
          body: userNotifications.body,
          deepLink: userNotifications.deepLink,
          imageMediaId: userNotifications.imageMediaId,
          sourceType: userNotifications.sourceType,
          sourceId: userNotifications.sourceId,
          isRead: userNotifications.isRead,
          readAt: userNotifications.readAt,
          createdAt: userNotifications.createdAt,
        })
        .from(userNotifications)
        .where(where)
        .orderBy(desc(userNotifications.createdAt))
        .limit(filter.limit)
        .offset((filter.page - 1) * filter.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(userNotifications).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /** Unread badge count (uses partial idx_user_notifications_unread). */
  async unreadCount(userId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .select({ n: sql<number>`count(*)::int` })
      .from(userNotifications)
      .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)));
    return rows[0]?.n ?? 0;
  }

  /**
   * Mark one notification read; scoped to the owner so a user can't touch another's.
   * Matches on id+owner regardless of current read-state, so the return value means
   * "exists & owned" (idempotent: re-marking an already-read item still returns true).
   */
  async markRead(userId: string, id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(userNotifications)
      .set({ isRead: true, readAt: sql`coalesce(${userNotifications.readAt}, now())` })
      .where(and(eq(userNotifications.id, id), eq(userNotifications.userId, userId)))
      .returning({ id: userNotifications.id });
    return rows.length > 0;
  }

  /** Mark every unread notification read; returns how many were flipped. */
  async markAllRead(userId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .update(userNotifications)
      .set({ isRead: true, readAt: sql`now()` })
      .where(and(eq(userNotifications.userId, userId), eq(userNotifications.isRead, false)))
      .returning({ id: userNotifications.id });
    return rows.length;
  }
}
