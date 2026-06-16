import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { moderationTickets, moderationReports, users } from '@db/drizzle/schema';
import { and, desc, eq, inArray, sql, type SQL } from 'drizzle-orm';

export type TicketStatus = 'open' | 'in_review' | 'resolved' | 'dismissed' | 'escalated';
export type Resolution = 'content_removed' | 'user_warned' | 'user_suspended' | 'user_banned' | 'no_action';

export interface TicketRecord {
  id: string;
  subjectType: string;
  subjectId: string | null;
  offenderUserId: string | null;
  offenderUsername?: string | null;
  severity: string;
  category: string;
  contentSnapshot: string | null;
  reportCount: number;
  isRepeatOffender: boolean;
  status: string;
  assignedTo: string | null;
  resolution: string | null;
  resolutionNote: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export interface ReportRecord {
  id: string;
  reporterUserId: string | null;
  reporterUsername: string | null;
  reason: string;
  note: string | null;
  createdAt: string;
}

export interface TicketIngest {
  subjectType: 'comment' | 'content' | 'user';
  subjectId: string;
  offenderUserId?: string;
  category: string;
  severity?: 'high' | 'medium' | 'low';
  contentSnapshot?: string;
  reporterUserId?: string;
  reason: string;
  note?: string;
}

const OPEN_STATUSES = ['open', 'in_review', 'escalated'];

@Injectable()
export class ModerationRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Create a ticket for a subject, or bump the existing open one; always attaches a report. */
  async createOrBumpTicket(input: TicketIngest): Promise<string> {
    return this.dbService.transaction(async (tx) => {
      const existing = await tx
        .select({ id: moderationTickets.id })
        .from(moderationTickets)
        .where(and(eq(moderationTickets.subjectType, input.subjectType), eq(moderationTickets.subjectId, input.subjectId), inArray(moderationTickets.status, OPEN_STATUSES)))
        .limit(1);
      let ticketId: string;
      if (existing[0]) {
        ticketId = existing[0].id;
        await tx.update(moderationTickets).set({ reportCount: sql`${moderationTickets.reportCount} + 1`, updatedAt: sql`now()` }).where(eq(moderationTickets.id, ticketId));
      } else {
        const rows = await tx
          .insert(moderationTickets)
          .values({
            subjectType: input.subjectType,
            subjectId: input.subjectId,
            category: input.category,
            ...(input.offenderUserId ? { offenderUserId: input.offenderUserId } : {}),
            ...(input.severity ? { severity: input.severity } : {}),
            ...(input.contentSnapshot ? { contentSnapshot: input.contentSnapshot } : {}),
          })
          .returning({ id: moderationTickets.id });
        ticketId = rows[0]!.id;
      }
      await tx.insert(moderationReports).values({ ticketId, reason: input.reason, ...(input.reporterUserId ? { reporterUserId: input.reporterUserId } : {}), ...(input.note ? { note: input.note } : {}) });
      return ticketId;
    });
  }

  private cols() {
    return {
      id: moderationTickets.id, subjectType: moderationTickets.subjectType, subjectId: moderationTickets.subjectId,
      offenderUserId: moderationTickets.offenderUserId, offenderUsername: users.username, severity: moderationTickets.severity,
      category: moderationTickets.category, contentSnapshot: moderationTickets.contentSnapshot, reportCount: moderationTickets.reportCount,
      isRepeatOffender: moderationTickets.isRepeatOffender, status: moderationTickets.status, assignedTo: moderationTickets.assignedTo,
      resolution: moderationTickets.resolution, resolutionNote: moderationTickets.resolutionNote, resolvedAt: moderationTickets.resolvedAt, createdAt: moderationTickets.createdAt,
    };
  }

  async list(opts: { page: number; limit: number; status?: string; severity?: string; category?: string }, tx?: DBExecutor): Promise<{ items: TicketRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) conds.push(eq(moderationTickets.status, opts.status));
    if (opts.severity) conds.push(eq(moderationTickets.severity, opts.severity));
    if (opts.category) conds.push(eq(moderationTickets.category, opts.category));
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db.select(this.cols()).from(moderationTickets).leftJoin(users, eq(users.id, moderationTickets.offenderUserId)).where(where).orderBy(desc(moderationTickets.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(moderationTickets).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async getById(id: string, tx?: DBExecutor): Promise<TicketRecord | null> {
    const rows = await this.exec(tx).select(this.cols()).from(moderationTickets).leftJoin(users, eq(users.id, moderationTickets.offenderUserId)).where(eq(moderationTickets.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getReports(ticketId: string, tx?: DBExecutor): Promise<ReportRecord[]> {
    return this.exec(tx)
      .select({ id: moderationReports.id, reporterUserId: moderationReports.reporterUserId, reporterUsername: users.username, reason: moderationReports.reason, note: moderationReports.note, createdAt: moderationReports.createdAt })
      .from(moderationReports)
      .leftJoin(users, eq(users.id, moderationReports.reporterUserId))
      .where(eq(moderationReports.ticketId, ticketId))
      .orderBy(desc(moderationReports.createdAt));
  }

  async assign(ticketId: string, adminId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).update(moderationTickets).set({ assignedTo: adminId, status: 'in_review', updatedAt: sql`now()` }).where(eq(moderationTickets.id, ticketId)).returning({ id: moderationTickets.id });
    return rows.length > 0;
  }

  async setStatus(ticketId: string, status: TicketStatus, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).update(moderationTickets).set({ status, updatedAt: sql`now()` }).where(eq(moderationTickets.id, ticketId)).returning({ id: moderationTickets.id });
    return rows.length > 0;
  }

  async resolve(ticketId: string, resolution: Resolution, note: string | undefined, adminId: string, dismissed: boolean, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .update(moderationTickets)
      .set({ resolution, status: dismissed ? 'dismissed' : 'resolved', resolvedBy: adminId, resolvedAt: sql`now()`, updatedAt: sql`now()`, ...(note ? { resolutionNote: note } : {}) })
      .where(eq(moderationTickets.id, ticketId));
  }

  async stats(tx?: DBExecutor): Promise<Record<string, number>> {
    const rows = await this.exec(tx).select({ status: moderationTickets.status, n: sql<number>`count(*)::int` }).from(moderationTickets).groupBy(moderationTickets.status);
    return Object.fromEntries(rows.map((r) => [r.status, r.n]));
  }
}
