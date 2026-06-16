import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { subscriptionPlans, planRegionPrices } from '@db/drizzle/schema';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';

export interface PlanRecord {
  id: string;
  name: string;
  description: string | null;
  basePriceCents: number;
  baseCurrency: string;
  interval: string;
  trialDays: number;
  features: unknown;
  isActive: boolean;
  isPopular: boolean;
  sortOrder: number;
}

export interface RegionPrice {
  region: string;
  priceCents: number;
  currency: string;
}

export interface PlanCreate {
  name: string;
  description?: string;
  basePriceCents: number;
  baseCurrency?: string;
  interval: 'monthly' | 'yearly';
  trialDays?: number;
  features?: unknown;
  isPopular?: boolean;
  sortOrder?: number;
}

@Injectable()
export class SubscriptionPlanRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private map(r: typeof subscriptionPlans.$inferSelect): PlanRecord {
    return {
      id: r.id,
      name: r.name,
      description: r.description,
      basePriceCents: r.basePriceCents,
      baseCurrency: r.baseCurrency,
      interval: r.interval,
      trialDays: r.trialDays,
      features: r.features,
      isActive: r.isActive,
      isPopular: r.isPopular,
      sortOrder: r.sortOrder,
    };
  }

  async list(activeOnly: boolean, tx?: DBExecutor): Promise<PlanRecord[]> {
    const conds = [isNull(subscriptionPlans.deletedAt)];
    if (activeOnly) {
      conds.push(eq(subscriptionPlans.isActive, true));
    }
    const rows = await this.exec(tx).select().from(subscriptionPlans).where(and(...conds)).orderBy(asc(subscriptionPlans.sortOrder));
    return rows.map((r) => this.map(r));
  }

  async getById(id: string, tx?: DBExecutor): Promise<PlanRecord | null> {
    const rows = await this.exec(tx).select().from(subscriptionPlans).where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt))).limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  async create(input: PlanCreate, adminId: string, tx?: DBExecutor): Promise<PlanRecord> {
    const rows = await this.exec(tx)
      .insert(subscriptionPlans)
      .values({
        name: input.name,
        basePriceCents: input.basePriceCents,
        interval: input.interval,
        createdBy: adminId,
        ...(input.description ? { description: input.description } : {}),
        ...(input.baseCurrency ? { baseCurrency: input.baseCurrency } : {}),
        ...(input.trialDays !== undefined ? { trialDays: input.trialDays } : {}),
        ...(input.features !== undefined ? { features: input.features } : {}),
        ...(input.isPopular !== undefined ? { isPopular: input.isPopular } : {}),
        ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      })
      .returning();
    return this.map(rows[0]!);
  }

  async update(id: string, patch: Partial<PlanCreate & { isActive: boolean }>, tx?: DBExecutor): Promise<PlanRecord | null> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['name', 'description', 'basePriceCents', 'baseCurrency', 'interval', 'trialDays', 'features', 'isPopular', 'sortOrder', 'isActive'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    const rows = await this.exec(tx).update(subscriptionPlans).set(set).where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt))).returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  async softDelete(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(subscriptionPlans)
      .set({ deletedAt: sql`now()`, isActive: false, updatedAt: sql`now()` })
      .where(and(eq(subscriptionPlans.id, id), isNull(subscriptionPlans.deletedAt)))
      .returning({ id: subscriptionPlans.id });
    return rows.length > 0;
  }

  // ─── Region prices ─────────────────────────────────────────────────────────
  async getRegionPrices(planId: string, tx?: DBExecutor): Promise<RegionPrice[]> {
    return this.exec(tx)
      .select({ region: planRegionPrices.region, priceCents: planRegionPrices.priceCents, currency: planRegionPrices.currency })
      .from(planRegionPrices)
      .where(eq(planRegionPrices.planId, planId));
  }

  async priceForRegion(planId: string, region: string, tx?: DBExecutor): Promise<RegionPrice | null> {
    const rows = await this.exec(tx)
      .select({ region: planRegionPrices.region, priceCents: planRegionPrices.priceCents, currency: planRegionPrices.currency })
      .from(planRegionPrices)
      .where(and(eq(planRegionPrices.planId, planId), eq(planRegionPrices.region, region)))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Upsert a region price for a plan. */
  async setRegionPrice(planId: string, region: string, priceCents: number, currency: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(planRegionPrices)
      .values({ planId, region, priceCents, currency })
      .onConflictDoUpdate({ target: [planRegionPrices.planId, planRegionPrices.region], set: { priceCents, currency, updatedAt: sql`now()` } });
  }
}
