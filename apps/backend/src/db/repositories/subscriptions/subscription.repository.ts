import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { subscriptions, subscriptionPlans, users } from '@db/drizzle/schema';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';

/** A user's current subscription, summarized for profile/billing reads. */
export interface ActiveSubscription {
  id: string;
  planId: string | null;
  planName: string | null;
  status: string;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export interface SubscriptionRecord {
  id: string;
  userId: string;
  username?: string | null;
  planId: string | null;
  planName: string | null;
  status: string;
  region: string | null;
  amountCents: number | null;
  currency: string | null;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndAt: string | null;
  canceledAt: string | null;
  cancelReason: string | null;
  provider: string | null;
  providerSubscriptionId: string | null;
  createdAt: string;
}

export interface CreateSubscriptionInput {
  userId: string;
  planId: string;
  status: 'active' | 'trialing';
  region: string;
  countryCode?: string;
  amountCents: number;
  currency: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndAt?: string | null;
  provider: string;
  providerSubscriptionId: string;
}

/** Statuses that count as "currently subscribed" (gates premium + the profile badge). */
const ACTIVE_STATUSES = ['active', 'trialing', 'past_due'];

/**
 * Subscriptions domain data access. Profile reads the active-subscription summary from here;
 * the future Subscriptions module will own the write/billing side against the same repo.
 */
@Injectable()
export class SubscriptionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async getActiveForUser(userId: string, tx?: DBExecutor): Promise<ActiveSubscription | null> {
    const rows = await this.exec(tx)
      .select({
        id: subscriptions.id,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
        status: subscriptions.status,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        canceledAt: subscriptions.canceledAt,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptionPlans.id, subscriptions.planId))
      .where(and(eq(subscriptions.userId, userId), inArray(subscriptions.status, ACTIVE_STATUSES)))
      .orderBy(desc(subscriptions.currentPeriodEnd))
      .limit(1);
    const row = rows[0];
    if (!row) {
      return null;
    }
    return {
      id: row.id,
      planId: row.planId,
      planName: row.planName,
      status: row.status,
      currentPeriodEnd: row.currentPeriodEnd,
      cancelAtPeriodEnd: row.canceledAt != null,
    };
  }

  async create(input: CreateSubscriptionInput, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(subscriptions)
      .values({
        userId: input.userId,
        planId: input.planId,
        status: input.status,
        region: input.region,
        amountCents: input.amountCents,
        currency: input.currency,
        startedAt: sql`now()`,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        provider: input.provider,
        providerSubscriptionId: input.providerSubscriptionId,
        ...(input.countryCode ? { countryCode: input.countryCode } : {}),
        ...(input.trialEndAt ? { trialEndAt: input.trialEndAt } : {}),
      })
      .returning({ id: subscriptions.id });
    return rows[0]!.id;
  }

  async getById(id: string, tx?: DBExecutor): Promise<SubscriptionRecord | null> {
    const rows = await this.select(tx).where(eq(subscriptions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  /** Latest subscription for a user regardless of status (for "my subscription"). */
  async getLatestForUser(userId: string, tx?: DBExecutor): Promise<SubscriptionRecord | null> {
    const rows = await this.select(tx).where(eq(subscriptions.userId, userId)).orderBy(desc(subscriptions.createdAt)).limit(1);
    return rows[0] ?? null;
  }

  async listAll(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: SubscriptionRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(subscriptions.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      this.select(tx).where(where).orderBy(desc(subscriptions.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(subscriptions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /** Mark canceled (immediate). Returns false if not found. */
  async cancel(id: string, reason: string | undefined, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(subscriptions)
      .set({ status: 'canceled', canceledAt: sql`now()`, updatedAt: sql`now()`, ...(reason ? { cancelReason: reason } : {}) })
      .where(eq(subscriptions.id, id))
      .returning({ id: subscriptions.id });
    return rows.length > 0;
  }

  private select(tx?: DBExecutor) {
    return this.exec(tx)
      .select({
        id: subscriptions.id,
        userId: subscriptions.userId,
        username: users.username,
        planId: subscriptions.planId,
        planName: subscriptionPlans.name,
        status: subscriptions.status,
        region: subscriptions.region,
        amountCents: subscriptions.amountCents,
        currency: subscriptions.currency,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        trialEndAt: subscriptions.trialEndAt,
        canceledAt: subscriptions.canceledAt,
        cancelReason: subscriptions.cancelReason,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        createdAt: subscriptions.createdAt,
      })
      .from(subscriptions)
      .leftJoin(subscriptionPlans, eq(subscriptionPlans.id, subscriptions.planId))
      .leftJoin(users, eq(users.id, subscriptions.userId));
  }
}
