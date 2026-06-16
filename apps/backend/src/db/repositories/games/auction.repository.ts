import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { auctions, bids } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface AuctionRecord {
  id: string;
  title: string;
  description: string | null;
  prize: string | null;
  contentId: string | null;
  startAt: string;
  endAt: string;
  status: string;
  minBidPoints: number;
  winnerUserId: string | null;
  winningAmount: number | null;
}

export interface BidRecord {
  id: string;
  userId: string;
  amountPoints: number;
  status: string;
}

export interface AuctionCreate {
  title: string;
  description?: string;
  prize?: string;
  contentId?: string;
  startAt: string;
  endAt: string;
  minBidPoints?: number;
}

@Injectable()
export class AuctionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private cols() {
    return {
      id: auctions.id, title: auctions.title, description: auctions.description, prize: auctions.prize, contentId: auctions.contentId,
      startAt: auctions.startAt, endAt: auctions.endAt, status: auctions.status, minBidPoints: auctions.minBidPoints,
      winnerUserId: auctions.winnerUserId, winningAmount: auctions.winningAmount,
    };
  }

  async create(input: AuctionCreate, adminId: string, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(auctions)
      .values({
        title: input.title,
        startAt: input.startAt,
        endAt: input.endAt,
        createdBy: adminId,
        ...(input.description ? { description: input.description } : {}),
        ...(input.prize ? { prize: input.prize } : {}),
        ...(input.contentId ? { contentId: input.contentId } : {}),
        ...(input.minBidPoints !== undefined ? { minBidPoints: input.minBidPoints } : {}),
      })
      .returning({ id: auctions.id });
    return rows[0]!.id;
  }

  async list(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: AuctionRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(auctions.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db.select(this.cols()).from(auctions).where(where).orderBy(desc(auctions.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(auctions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async listOpen(tx?: DBExecutor): Promise<AuctionRecord[]> {
    return this.exec(tx).select(this.cols()).from(auctions).where(and(eq(auctions.status, 'open'), sql`${auctions.startAt} <= now()`, sql`${auctions.endAt} > now()`)).orderBy(desc(auctions.endAt));
  }

  async getById(id: string, tx?: DBExecutor): Promise<AuctionRecord | null> {
    const rows = await this.exec(tx).select(this.cols()).from(auctions).where(eq(auctions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async setStatus(id: string, status: 'open' | 'closed' | 'cancelled', tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).update(auctions).set({ status, updatedAt: sql`now()` }).where(eq(auctions.id, id)).returning({ id: auctions.id });
    return rows.length > 0;
  }

  async settle(id: string, winnerUserId: string | null, winningAmount: number | null, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(auctions)
      .set({ status: 'settled', winnerUserId, winningAmount, updatedAt: sql`now()` })
      .where(eq(auctions.id, id));
  }

  // ─── Bids ──────────────────────────────────────────────────────────────────
  async getHighestActive(auctionId: string, tx?: DBExecutor): Promise<BidRecord | null> {
    const rows = await this.exec(tx)
      .select({ id: bids.id, userId: bids.userId, amountPoints: bids.amountPoints, status: bids.status })
      .from(bids)
      .where(and(eq(bids.auctionId, auctionId), eq(bids.status, 'active')))
      .orderBy(desc(bids.amountPoints))
      .limit(1);
    return rows[0] ?? null;
  }

  async getUserActiveBid(auctionId: string, userId: string, tx?: DBExecutor): Promise<BidRecord | null> {
    const rows = await this.exec(tx)
      .select({ id: bids.id, userId: bids.userId, amountPoints: bids.amountPoints, status: bids.status })
      .from(bids)
      .where(and(eq(bids.auctionId, auctionId), eq(bids.userId, userId), eq(bids.status, 'active')))
      .limit(1);
    return rows[0] ?? null;
  }

  async listActiveBids(auctionId: string, tx?: DBExecutor): Promise<BidRecord[]> {
    return this.exec(tx)
      .select({ id: bids.id, userId: bids.userId, amountPoints: bids.amountPoints, status: bids.status })
      .from(bids)
      .where(and(eq(bids.auctionId, auctionId), eq(bids.status, 'active')));
  }

  async placeBid(auctionId: string, userId: string, amountPoints: number, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx).insert(bids).values({ auctionId, userId, amountPoints }).returning({ id: bids.id });
    return rows[0]!.id;
  }

  async setBidStatus(bidId: string, status: 'active' | 'outbid' | 'won' | 'refunded', tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(bids).set({ status }).where(eq(bids.id, bidId));
  }

  async countBids(auctionId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx).select({ n: sql<number>`count(*)::int` }).from(bids).where(eq(bids.auctionId, auctionId));
    return rows[0]?.n ?? 0;
  }

  async update(id: string, patch: Partial<AuctionCreate>, tx?: DBExecutor): Promise<boolean> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['title', 'description', 'prize', 'contentId', 'startAt', 'endAt', 'minBidPoints'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    const rows = await this.exec(tx).update(auctions).set(set).where(eq(auctions.id, id)).returning({ id: auctions.id });
    return rows.length > 0;
  }

  async delete(id: string): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      await tx.delete(bids).where(eq(bids.auctionId, id));
      const rows = await tx.delete(auctions).where(eq(auctions.id, id)).returning({ id: auctions.id });
      return rows.length > 0;
    });
  }
}
