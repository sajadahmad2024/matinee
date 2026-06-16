import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { rewardCatalogItems } from '@db/drizzle/schema';
import { and, desc, eq, gt, isNull, or, sql, type SQL } from 'drizzle-orm';

export interface CatalogItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageMediaId: string | null;
  costPoints: number;
  stockTotal: number | null;
  stockRemaining: number | null;
  requiresSubscription: boolean;
  region: string | null;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

export interface CatalogCreate {
  name: string;
  description?: string;
  category: string;
  imageMediaId?: string;
  costPoints: number;
  stockTotal?: number;
  requiresSubscription?: boolean;
  region?: string;
  startsAt?: string;
  endsAt?: string;
}

export type CatalogUpdate = Partial<CatalogCreate & { isActive: boolean }>;

@Injectable()
export class RewardCatalogRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private map(r: typeof rewardCatalogItems.$inferSelect): CatalogItem {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      category: r.category,
      imageMediaId: r.imageMediaId,
      costPoints: r.costPoints,
      stockTotal: r.stockTotal,
      stockRemaining: r.stockRemaining,
      requiresSubscription: r.requiresSubscription,
      region: r.region,
      isActive: r.isActive,
      startsAt: r.startsAt,
      endsAt: r.endsAt,
    };
  }

  /**
   * Browse list. `storefront` applies the customer rules: active, in its live window, in stock,
   * and region-available (item.region null = global, else must equal the viewer's region).
   */
  async list(
    opts: { page: number; limit: number; category?: string; storefront?: boolean; region?: string | null },
    tx?: DBExecutor,
  ): Promise<{ items: CatalogItem[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.category) {
      conds.push(eq(rewardCatalogItems.category, opts.category));
    }
    if (opts.storefront) {
      conds.push(eq(rewardCatalogItems.isActive, true));
      conds.push(or(isNull(rewardCatalogItems.startsAt), sql`${rewardCatalogItems.startsAt} <= now()`)!);
      conds.push(or(isNull(rewardCatalogItems.endsAt), sql`${rewardCatalogItems.endsAt} > now()`)!);
      conds.push(or(isNull(rewardCatalogItems.stockRemaining), gt(rewardCatalogItems.stockRemaining, 0))!);
      const regionCond = opts.region
        ? or(isNull(rewardCatalogItems.region), eq(rewardCatalogItems.region, opts.region))
        : isNull(rewardCatalogItems.region);
      conds.push(regionCond!);
    }
    const where = conds.length ? and(...conds) : undefined;
    const [rows, totalRes] = await Promise.all([
      db
        .select()
        .from(rewardCatalogItems)
        .where(where)
        .orderBy(desc(rewardCatalogItems.createdAt))
        .limit(opts.limit)
        .offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(rewardCatalogItems).where(where),
    ]);
    return { items: rows.map((r) => this.map(r)), total: totalRes[0]?.n ?? 0 };
  }

  async getById(id: string, tx?: DBExecutor): Promise<CatalogItem | null> {
    const rows = await this.exec(tx).select().from(rewardCatalogItems).where(eq(rewardCatalogItems.id, id)).limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  async create(input: CatalogCreate, adminId: string, tx?: DBExecutor): Promise<CatalogItem> {
    const rows = await this.exec(tx)
      .insert(rewardCatalogItems)
      .values({
        name: input.name,
        category: input.category,
        costPoints: input.costPoints,
        requiresSubscription: input.requiresSubscription ?? false,
        createdBy: adminId,
        ...(input.description ? { description: input.description } : {}),
        ...(input.imageMediaId ? { imageMediaId: input.imageMediaId } : {}),
        ...(input.stockTotal !== undefined ? { stockTotal: input.stockTotal, stockRemaining: input.stockTotal } : {}),
        ...(input.region ? { region: input.region } : {}),
        ...(input.startsAt ? { startsAt: input.startsAt } : {}),
        ...(input.endsAt ? { endsAt: input.endsAt } : {}),
      })
      .returning();
    return this.map(rows[0]!);
  }

  async update(id: string, patch: CatalogUpdate, tx?: DBExecutor): Promise<CatalogItem | null> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['name', 'description', 'category', 'imageMediaId', 'costPoints', 'requiresSubscription', 'region', 'startsAt', 'endsAt', 'isActive'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    if (patch.stockTotal !== undefined) {
      set['stockTotal'] = patch.stockTotal;
      set['stockRemaining'] = patch.stockTotal; // resetting total resets remaining
    }
    const rows = await this.exec(tx).update(rewardCatalogItems).set(set).where(eq(rewardCatalogItems.id, id)).returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  /** Atomically claim one unit of stock; false if sold out. Call inside the redeem transaction. */
  async claimStock(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(rewardCatalogItems)
      .set({ stockRemaining: sql`${rewardCatalogItems.stockRemaining} - 1` })
      .where(and(eq(rewardCatalogItems.id, id), gt(rewardCatalogItems.stockRemaining, 0)))
      .returning({ id: rewardCatalogItems.id });
    return rows.length > 0;
  }

  /** Return one unit of stock (on cancel/refund). */
  async releaseStock(id: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(rewardCatalogItems)
      .set({ stockRemaining: sql`${rewardCatalogItems.stockRemaining} + 1` })
      .where(and(eq(rewardCatalogItems.id, id), sql`${rewardCatalogItems.stockRemaining} is not null`));
  }
}
