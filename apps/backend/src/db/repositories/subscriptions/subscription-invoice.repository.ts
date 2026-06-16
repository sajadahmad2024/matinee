import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { subscriptionInvoices, users } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface InvoiceRecord {
  id: string;
  subscriptionId: string | null;
  userId: string;
  invoiceNumber: string;
  amountCents: number;
  currency: string;
  region: string | null;
  status: string;
  paymentMethod: string | null;
  platform: string | null;
  billedAt: string;
  paidAt: string | null;
  refundedAt: string | null;
  provider: string;
  providerInvoiceId: string | null;
}

export interface InvoiceCreate {
  subscriptionId: string;
  userId: string;
  invoiceNumber: string;
  amountCents: number;
  currency: string;
  region?: string;
  status: 'paid' | 'pending' | 'failed';
  paymentMethod?: string;
  platform?: string;
  provider: string;
  providerInvoiceId?: string;
}

@Injectable()
export class SubscriptionInvoiceRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async create(input: InvoiceCreate, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(subscriptionInvoices)
      .values({
        subscriptionId: input.subscriptionId,
        userId: input.userId,
        invoiceNumber: input.invoiceNumber,
        amountCents: input.amountCents,
        currency: input.currency,
        status: input.status,
        provider: input.provider,
        ...(input.region ? { region: input.region } : {}),
        ...(input.paymentMethod ? { paymentMethod: input.paymentMethod } : {}),
        ...(input.platform ? { platform: input.platform } : {}),
        ...(input.providerInvoiceId ? { providerInvoiceId: input.providerInvoiceId } : {}),
        ...(input.status === 'paid' ? { paidAt: sql`now()` } : {}),
      })
      .returning({ id: subscriptionInvoices.id });
    return rows[0]!.id;
  }

  async getById(id: string, tx?: DBExecutor): Promise<InvoiceRecord | null> {
    const rows = await this.exec(tx).select().from(subscriptionInvoices).where(eq(subscriptionInvoices.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async listByUser(userId: string, page: number, limit: number, tx?: DBExecutor): Promise<{ items: InvoiceRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = eq(subscriptionInvoices.userId, userId);
    const [items, totalRes] = await Promise.all([
      db.select().from(subscriptionInvoices).where(where).orderBy(desc(subscriptionInvoices.billedAt)).limit(limit).offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(subscriptionInvoices).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  /** Admin transaction ledger — all invoices across users (filter status), with redeemer joined. */
  async listAll(
    opts: { page: number; limit: number; status?: string },
    tx?: DBExecutor,
  ): Promise<{ items: (InvoiceRecord & { username: string | null })[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(subscriptionInvoices.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db
        .select({
          id: subscriptionInvoices.id,
          subscriptionId: subscriptionInvoices.subscriptionId,
          userId: subscriptionInvoices.userId,
          username: users.username,
          invoiceNumber: subscriptionInvoices.invoiceNumber,
          amountCents: subscriptionInvoices.amountCents,
          currency: subscriptionInvoices.currency,
          region: subscriptionInvoices.region,
          status: subscriptionInvoices.status,
          paymentMethod: subscriptionInvoices.paymentMethod,
          platform: subscriptionInvoices.platform,
          billedAt: subscriptionInvoices.billedAt,
          paidAt: subscriptionInvoices.paidAt,
          refundedAt: subscriptionInvoices.refundedAt,
          provider: subscriptionInvoices.provider,
          providerInvoiceId: subscriptionInvoices.providerInvoiceId,
        })
        .from(subscriptionInvoices)
        .leftJoin(users, eq(users.id, subscriptionInvoices.userId))
        .where(where)
        .orderBy(desc(subscriptionInvoices.billedAt))
        .limit(opts.limit)
        .offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(subscriptionInvoices).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async markRefunded(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(subscriptionInvoices)
      .set({ status: 'refunded', refundedAt: sql`now()` })
      .where(eq(subscriptionInvoices.id, id))
      .returning({ id: subscriptionInvoices.id });
    return rows.length > 0;
  }
}
