import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { rewardRedemptions, rewardCatalogItems, users } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface RedemptionRecord {
  id: string;
  itemId: string;
  itemName: string | null;
  userId: string;
  username?: string | null;
  costPoints: number;
  status: string;
  fulfillmentNote: string | null;
  redeemedAt: string;
  fulfilledAt: string | null;
}

export type RedemptionStatus = 'pending' | 'confirmed' | 'fulfilled' | 'cancelled' | 'refunded';

@Injectable()
export class RewardRedemptionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async create(itemId: string, userId: string, costPoints: number, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(rewardRedemptions)
      .values({ itemId, userId, costPoints })
      .returning({ id: rewardRedemptions.id });
    return rows[0]!.id;
  }

  async getById(id: string, tx?: DBExecutor): Promise<RedemptionRecord | null> {
    const rows = await this.exec(tx)
      .select({
        id: rewardRedemptions.id,
        itemId: rewardRedemptions.itemId,
        itemName: rewardCatalogItems.name,
        userId: rewardRedemptions.userId,
        costPoints: rewardRedemptions.costPoints,
        status: rewardRedemptions.status,
        fulfillmentNote: rewardRedemptions.fulfillmentNote,
        redeemedAt: rewardRedemptions.redeemedAt,
        fulfilledAt: rewardRedemptions.fulfilledAt,
      })
      .from(rewardRedemptions)
      .leftJoin(rewardCatalogItems, eq(rewardCatalogItems.id, rewardRedemptions.itemId))
      .where(eq(rewardRedemptions.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async listByUser(userId: string, page: number, limit: number, tx?: DBExecutor): Promise<{ items: RedemptionRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = eq(rewardRedemptions.userId, userId);
    const [items, totalRes] = await Promise.all([
      db
        .select({
          id: rewardRedemptions.id,
          itemId: rewardRedemptions.itemId,
          itemName: rewardCatalogItems.name,
          userId: rewardRedemptions.userId,
          costPoints: rewardRedemptions.costPoints,
          status: rewardRedemptions.status,
          fulfillmentNote: rewardRedemptions.fulfillmentNote,
          redeemedAt: rewardRedemptions.redeemedAt,
          fulfilledAt: rewardRedemptions.fulfilledAt,
        })
        .from(rewardRedemptions)
        .leftJoin(rewardCatalogItems, eq(rewardCatalogItems.id, rewardRedemptions.itemId))
        .where(where)
        .orderBy(desc(rewardRedemptions.redeemedAt))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(rewardRedemptions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /** Admin queue (optionally filtered by status), with item + redeemer joined. */
  async listAll(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: RedemptionRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(rewardRedemptions.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db
        .select({
          id: rewardRedemptions.id,
          itemId: rewardRedemptions.itemId,
          itemName: rewardCatalogItems.name,
          userId: rewardRedemptions.userId,
          username: users.username,
          costPoints: rewardRedemptions.costPoints,
          status: rewardRedemptions.status,
          fulfillmentNote: rewardRedemptions.fulfillmentNote,
          redeemedAt: rewardRedemptions.redeemedAt,
          fulfilledAt: rewardRedemptions.fulfilledAt,
        })
        .from(rewardRedemptions)
        .leftJoin(rewardCatalogItems, eq(rewardCatalogItems.id, rewardRedemptions.itemId))
        .leftJoin(users, eq(users.id, rewardRedemptions.userId))
        .where(where)
        .orderBy(desc(rewardRedemptions.redeemedAt))
        .limit(opts.limit)
        .offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(rewardRedemptions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /** Move to a terminal/intermediate state; `fulfilled`/`cancelled` stamp fulfilledAt. */
  async setStatus(id: string, status: RedemptionStatus, note: string | undefined, tx?: DBExecutor): Promise<boolean> {
    const stamps = status === 'fulfilled' || status === 'cancelled' || status === 'refunded' ? { fulfilledAt: sql`now()` } : {};
    const rows = await this.exec(tx)
      .update(rewardRedemptions)
      .set({ status, ...(note ? { fulfillmentNote: note } : {}), ...stamps })
      .where(eq(rewardRedemptions.id, id))
      .returning({ id: rewardRedemptions.id });
    return rows.length > 0;
  }
}
