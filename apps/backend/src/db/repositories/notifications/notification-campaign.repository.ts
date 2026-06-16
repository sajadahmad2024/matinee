import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { notificationCampaigns, users } from '@db/drizzle/schema';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

export interface CampaignRecord {
  id: string;
  title: string;
  message: string;
  deepLink: string | null;
  targetType: string;
  targetFilter: unknown;
  status: string;
  scheduledAt: string | null;
  sentAt: string | null;
  recipientCount: number;
  createdAt: string;
}

export interface CampaignCreate {
  title: string;
  message: string;
  deepLink?: string;
  targetType: 'all' | 'segment' | 'selected';
  targetFilter?: Record<string, unknown>;
  scheduledAt?: string;
}

@Injectable()
export class NotificationCampaignRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private cols() {
    return {
      id: notificationCampaigns.id, title: notificationCampaigns.title, message: notificationCampaigns.message, deepLink: notificationCampaigns.deepLink,
      targetType: notificationCampaigns.targetType, targetFilter: notificationCampaigns.targetFilter, status: notificationCampaigns.status,
      scheduledAt: notificationCampaigns.scheduledAt, sentAt: notificationCampaigns.sentAt, recipientCount: notificationCampaigns.recipientCount, createdAt: notificationCampaigns.createdAt,
    };
  }

  async create(input: CampaignCreate, status: 'draft' | 'scheduled', adminId: string, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(notificationCampaigns)
      .values({
        title: input.title,
        message: input.message,
        targetType: input.targetType,
        status,
        createdBy: adminId,
        ...(input.deepLink ? { deepLink: input.deepLink } : {}),
        ...(input.targetFilter ? { targetFilter: input.targetFilter } : {}),
        ...(input.scheduledAt ? { scheduledAt: input.scheduledAt } : {}),
      })
      .returning({ id: notificationCampaigns.id });
    return rows[0]!.id;
  }

  async list(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: CampaignRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = opts.status ? eq(notificationCampaigns.status, opts.status) : undefined;
    const [items, totalRes] = await Promise.all([
      db.select(this.cols()).from(notificationCampaigns).where(where).orderBy(desc(notificationCampaigns.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(notificationCampaigns).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async getById(id: string, tx?: DBExecutor): Promise<CampaignRecord | null> {
    const rows = await this.exec(tx).select(this.cols()).from(notificationCampaigns).where(eq(notificationCampaigns.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async setStatus(id: string, status: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(notificationCampaigns).set({ status, updatedAt: sql`now()` }).where(eq(notificationCampaigns.id, id));
  }

  async markSent(id: string, recipientCount: number, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(notificationCampaigns).set({ status: 'sent', sentAt: sql`now()`, recipientCount, deliveredCount: recipientCount, updatedAt: sql`now()` }).where(eq(notificationCampaigns.id, id));
  }

  /** Resolve the audience to a list of customer user ids. */
  async resolveAudience(targetType: string, targetFilter: Record<string, unknown>, tx?: DBExecutor): Promise<string[]> {
    const db = this.exec(tx);
    if (targetType === 'selected') {
      const ids = Array.isArray(targetFilter['userIds']) ? (targetFilter['userIds'] as string[]) : [];
      if (ids.length === 0) {
        return [];
      }
      const rows = await db.select({ id: users.id }).from(users).where(and(inArray(users.id, ids), eq(users.accountType, 'customer'), isNull(users.deletedAt)));
      return rows.map((r) => r.id);
    }
    const conds = [eq(users.accountType, 'customer'), eq(users.status, 'active'), isNull(users.deletedAt)];
    if (targetType === 'segment' && typeof targetFilter['region'] === 'string') {
      conds.push(eq(users.region, targetFilter['region'] as string));
    }
    const rows = await db.select({ id: users.id }).from(users).where(and(...conds));
    return rows.map((r) => r.id);
  }
}
