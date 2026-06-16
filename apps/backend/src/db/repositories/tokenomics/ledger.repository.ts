import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { ledgerTransactions } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface LedgerEntry {
  id: string;
  currency: string;
  amount: number;
  balanceAfter: number;
  direction: string;
  sourceKind: string;
  sourceType: string;
  sourceId: string | null;
  note: string | null;
  createdAt: string;
}

export type LedgerCurrency = 'points' | 'xp';
export type LedgerDirection = 'earn' | 'spend' | 'refund' | 'purchase' | 'adjust';
export type LedgerSourceKind = 'earned' | 'purchased';

export interface LedgerFilter {
  page: number;
  limit: number;
  currency?: LedgerCurrency;
  direction?: LedgerDirection;
}

export interface AppendInput {
  userId: string;
  currency: LedgerCurrency;
  /** Signed: positive earns/refunds, negative spends. */
  amount: number;
  direction: LedgerDirection;
  sourceKind: LedgerSourceKind;
  sourceType: string;
  sourceId?: string;
  idempotencyKey: string;
  note?: string;
}

export interface AppendResult {
  id: string;
  balanceAfter: number;
  /** false when the idempotency key already existed (no new row written). */
  applied: boolean;
}

@Injectable()
export class LedgerRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Paginated transaction history for a user (newest first), uses idx_ledger_user. */
  async listByUser(
    userId: string,
    filter: LedgerFilter,
    tx?: DBExecutor,
  ): Promise<{ items: LedgerEntry[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [eq(ledgerTransactions.userId, userId)];
    if (filter.currency) {
      conds.push(eq(ledgerTransactions.currency, filter.currency));
    }
    if (filter.direction) {
      conds.push(eq(ledgerTransactions.direction, filter.direction));
    }
    const where = and(...conds);
    const [items, totalRes] = await Promise.all([
      db
        .select({
          id: ledgerTransactions.id,
          currency: ledgerTransactions.currency,
          amount: ledgerTransactions.amount,
          balanceAfter: ledgerTransactions.balanceAfter,
          direction: ledgerTransactions.direction,
          sourceKind: ledgerTransactions.sourceKind,
          sourceType: ledgerTransactions.sourceType,
          sourceId: ledgerTransactions.sourceId,
          note: ledgerTransactions.note,
          createdAt: ledgerTransactions.createdAt,
        })
        .from(ledgerTransactions)
        .where(where)
        .orderBy(desc(ledgerTransactions.createdAt))
        .limit(filter.limit)
        .offset((filter.page - 1) * filter.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(ledgerTransactions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /**
   * Append a transaction. The `ledger_apply` BEFORE-INSERT trigger sets balance_after and
   * maintains the wallet (and raises check_violation on an over-spend). Idempotent on
   * idempotency_key.
   *
   * NB: we must NOT use `ON CONFLICT DO NOTHING` here — a BEFORE-INSERT trigger fires *before*
   * conflict resolution, so the wallet mutation would happen even when the row is skipped,
   * double-crediting on replay. A PLAIN insert instead errors on the unique violation, which
   * rolls back the whole statement (trigger side-effects included). We catch 23505 and return
   * the prior row (applied=false). Callers therefore must not wrap append() in an outer
   * transaction that can't tolerate the abort (today none do — each award is its own statement).
   */
  async append(input: AppendInput, tx?: DBExecutor): Promise<AppendResult> {
    try {
      const inserted = await this.exec(tx)
        .insert(ledgerTransactions)
        .values({
          userId: input.userId,
          currency: input.currency,
          amount: input.amount,
          direction: input.direction,
          sourceKind: input.sourceKind,
          sourceType: input.sourceType,
          idempotencyKey: input.idempotencyKey,
          ...(input.sourceId ? { sourceId: input.sourceId } : {}),
          ...(input.note ? { note: input.note } : {}),
        })
        .returning({ id: ledgerTransactions.id, balanceAfter: ledgerTransactions.balanceAfter });
      return { id: inserted[0]!.id, balanceAfter: inserted[0]!.balanceAfter, applied: true };
    } catch (e) {
      if (!this.isUniqueViolation(e)) {
        throw e;
      }
      // Key already applied — the failed insert (and its trigger wallet-update) rolled back.
      const existing = await this.exec(tx)
        .select({ id: ledgerTransactions.id, balanceAfter: ledgerTransactions.balanceAfter })
        .from(ledgerTransactions)
        .where(eq(ledgerTransactions.idempotencyKey, input.idempotencyKey))
        .limit(1);
      const row = existing[0]!;
      return { id: row.id, balanceAfter: row.balanceAfter, applied: false };
    }
  }

  private isUniqueViolation(e: unknown): boolean {
    const code = (e as { code?: string })?.code ?? (e as { cause?: { code?: string } })?.cause?.code;
    return code === '23505';
  }

  /**
   * Count a user's earn events for a source type since midnight UTC (daily-cap checks).
   * Filters to a single currency (default 'points') so one earn event = one row — an event
   * that credits both points and xp must not be counted twice.
   */
  async countTodayBySource(
    userId: string,
    sourceType: string,
    currency: LedgerCurrency = 'points',
    tx?: DBExecutor,
  ): Promise<number> {
    const rows = await this.exec(tx)
      .select({ n: sql<number>`count(*)::int` })
      .from(ledgerTransactions)
      .where(
        and(
          eq(ledgerTransactions.userId, userId),
          eq(ledgerTransactions.sourceType, sourceType),
          eq(ledgerTransactions.currency, currency),
          eq(ledgerTransactions.direction, 'earn'),
          sql`${ledgerTransactions.createdAt} >= date_trunc('day', now())`,
        ),
      );
    return rows[0]?.n ?? 0;
  }
}
