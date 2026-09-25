import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { moderationTickets, moderationReports, moderationTicketNotes, users } from '@db/drizzle/schema';
import { and, asc, desc, eq, gte, inArray, isNotNull, isNull, lte, ne, or, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

export type TicketStatus = 'open' | 'in_review' | 'resolved' | 'dismissed' | 'escalated';
export type Resolution = 'content_removed' | 'user_warned' | 'user_suspended' | 'user_banned' | 'no_action';
export type TicketSort = 'newest' | 'oldest' | 'severity' | 'reports';

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
  assigneeName?: string | null;
  resolution: string | null;
  resolutionNote: string | null;
  resolvedBy?: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface ReportRecord {
  id: string;
  reporterUserId: string | null;
  reporterUsername: string | null;
  reason: string;
  note: string | null;
  createdAt: string;
}

export interface NoteRecord {
  id: string;
  body: string;
  authorId: string | null;
  authorName: string | null;
  createdAt: string;
}

export interface PriorTicketRecord {
  id: string;
  subjectType: string;
  category: string;
  severity: string;
  status: string;
  resolution: string | null;
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

export interface TicketListFilter {
  page: number;
  limit: number;
  status?: string | undefined; // a TicketStatus or 'pending' (= any open status)
  severity?: string | undefined;
  category?: string | undefined;
  subjectType?: string | undefined;
  assignee?: string | undefined; // uuid | 'unassigned'
  offenderId?: string | undefined;
  repeatOffender?: boolean | undefined;
  q?: string | undefined;
  from?: string | undefined;
  to?: string | undefined;
  sort?: TicketSort | undefined;
}

export const OPEN_STATUSES: TicketStatus[] = ['open', 'in_review', 'escalated'];
const OPEN_SQL = sql.raw(`('open','in_review','escalated')`);
const sevRank = (expr: string) => sql.raw(`(case ${expr} when 'high' then 3 when 'medium' then 2 else 1 end)`);
const escapeLike = (s: string) => s.replace(/[\\%_]/g, (c) => `\\${c}`);
const assignee = alias(users, 'assignee');
const noteAuthor = alias(users, 'note_author');

@Injectable()
export class ModerationRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Has the offender a prior actioned ticket or a warn/suspend/ban on record? */
  private repeatOffenderSql(userId: string): SQL {
    return sql`(exists (select 1 from moderation_tickets p where p.offender_user_id = ${userId} and p.status = 'resolved' and p.resolution is distinct from 'no_action')
      or exists (select 1 from user_enforcement_actions e where e.user_id = ${userId} and e.action in ('warn','suspend','ban')))`;
  }

  /**
   * Create a ticket for a subject, or bump the existing open one; always attaches a report.
   * Race-safe: a single upsert against the partial unique index (one open ticket per subject).
   * A bump raises severity if the new report is more severe. `is_repeat_offender` is computed
   * from the offender's history. A second report by the same reporter on the same ticket
   * violates `uq_moderation_reports_ticket_reporter` (23505) — callers map that to 409.
   */
  async createOrBumpTicket(input: TicketIngest, outerTx?: DBExecutor): Promise<string> {
    const run = async (tx: DBExecutor) => {
      const rows = await tx
        .insert(moderationTickets)
        .values({
          subjectType: input.subjectType,
          subjectId: input.subjectId,
          category: input.category,
          isRepeatOffender: input.offenderUserId ? this.repeatOffenderSql(input.offenderUserId) : false,
          ...(input.offenderUserId ? { offenderUserId: input.offenderUserId } : {}),
          ...(input.severity ? { severity: input.severity } : {}),
          ...(input.contentSnapshot ? { contentSnapshot: input.contentSnapshot } : {}),
        })
        .onConflictDoUpdate({
          target: [moderationTickets.subjectType, moderationTickets.subjectId],
          targetWhere: sql`status in ${OPEN_SQL}`,
          set: {
            reportCount: sql`moderation_tickets.report_count + 1`,
            severity: sql`case when ${sevRank('excluded.severity')} > ${sevRank('moderation_tickets.severity')} then excluded.severity else moderation_tickets.severity end`,
            isRepeatOffender: sql`moderation_tickets.is_repeat_offender or excluded.is_repeat_offender`,
            updatedAt: sql`now()`,
          },
        })
        .returning({ id: moderationTickets.id });
      const ticketId = rows[0]!.id;
      await tx.insert(moderationReports).values({ ticketId, reason: input.reason, ...(input.reporterUserId ? { reporterUserId: input.reporterUserId } : {}), ...(input.note ? { note: input.note } : {}) });
      return ticketId;
    };
    return outerTx ? run(outerTx) : this.dbService.transaction(run);
  }

  /** The open (open / in_review / escalated) ticket for a subject, if any. */
  async findOpenTicket(subjectType: string, subjectId: string, tx?: DBExecutor): Promise<{ id: string; status: string } | null> {
    const rows = await this.exec(tx)
      .select({ id: moderationTickets.id, status: moderationTickets.status })
      .from(moderationTickets)
      .where(and(eq(moderationTickets.subjectType, subjectType), eq(moderationTickets.subjectId, subjectId), inArray(moderationTickets.status, OPEN_STATUSES)))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Does this reporter already have a report on the subject's open ticket? */
  async hasOpenReport(subjectType: string, subjectId: string, reporterUserId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .select({ id: moderationReports.id })
      .from(moderationReports)
      .innerJoin(moderationTickets, eq(moderationTickets.id, moderationReports.ticketId))
      .where(
        and(
          eq(moderationTickets.subjectType, subjectType),
          eq(moderationTickets.subjectId, subjectId),
          inArray(moderationTickets.status, OPEN_STATUSES),
          eq(moderationReports.reporterUserId, reporterUserId),
        ),
      )
      .limit(1);
    return rows.length > 0;
  }

  private cols() {
    return {
      id: moderationTickets.id, subjectType: moderationTickets.subjectType, subjectId: moderationTickets.subjectId,
      offenderUserId: moderationTickets.offenderUserId, offenderUsername: users.username, severity: moderationTickets.severity,
      category: moderationTickets.category, contentSnapshot: moderationTickets.contentSnapshot, reportCount: moderationTickets.reportCount,
      isRepeatOffender: moderationTickets.isRepeatOffender, status: moderationTickets.status, assignedTo: moderationTickets.assignedTo,
      assigneeName: sql<string | null>`coalesce(nullif(trim(concat_ws(' ', ${assignee.firstName}, ${assignee.lastName})), ''), ${assignee.email}, ${assignee.username})`,
      resolution: moderationTickets.resolution, resolutionNote: moderationTickets.resolutionNote, resolvedBy: moderationTickets.resolvedBy,
      resolvedAt: moderationTickets.resolvedAt, createdAt: moderationTickets.createdAt, updatedAt: moderationTickets.updatedAt,
    };
  }

  private listWhere(f: TicketListFilter): SQL | undefined {
    const conds: SQL[] = [];
    if (f.status === 'pending') conds.push(inArray(moderationTickets.status, OPEN_STATUSES));
    else if (f.status) conds.push(eq(moderationTickets.status, f.status));
    if (f.severity) conds.push(eq(moderationTickets.severity, f.severity));
    if (f.category) conds.push(eq(moderationTickets.category, f.category));
    if (f.subjectType) conds.push(eq(moderationTickets.subjectType, f.subjectType));
    if (f.assignee === 'unassigned') conds.push(isNull(moderationTickets.assignedTo));
    else if (f.assignee) conds.push(eq(moderationTickets.assignedTo, f.assignee));
    if (f.offenderId) conds.push(eq(moderationTickets.offenderUserId, f.offenderId));
    if (f.repeatOffender !== undefined) conds.push(eq(moderationTickets.isRepeatOffender, f.repeatOffender));
    if (f.from) conds.push(gte(moderationTickets.createdAt, f.from));
    if (f.to) conds.push(lte(moderationTickets.createdAt, f.to));
    if (f.q) {
      const pattern = `%${escapeLike(f.q)}%`;
      conds.push(
        or(
          sql`${users.username} ilike ${pattern}`,
          sql`concat_ws(' ', ${users.firstName}, ${users.lastName}) ilike ${pattern}`,
          sql`${moderationTickets.contentSnapshot} ilike ${pattern}`,
          sql`${moderationTickets.offenderUserId}::text = ${f.q}`,
          sql`${moderationTickets.subjectId}::text = ${f.q}`,
          sql`${moderationTickets.id}::text = ${f.q}`,
        )!,
      );
    }
    return conds.length ? and(...conds) : undefined;
  }

  async list(f: TicketListFilter, tx?: DBExecutor): Promise<{ items: TicketRecord[]; total: number }> {
    const db = this.exec(tx);
    const where = this.listWhere(f);
    const order: SQL[] =
      f.sort === 'oldest'
        ? [asc(moderationTickets.createdAt), asc(moderationTickets.id)]
        : f.sort === 'severity'
          ? [sql`${sevRank('moderation_tickets.severity')} desc`, desc(moderationTickets.createdAt)]
          : f.sort === 'reports'
            ? [desc(moderationTickets.reportCount), desc(moderationTickets.createdAt)]
            : [desc(moderationTickets.createdAt), desc(moderationTickets.id)];
    const [items, totalRes] = await Promise.all([
      db
        .select(this.cols())
        .from(moderationTickets)
        .leftJoin(users, eq(users.id, moderationTickets.offenderUserId))
        .leftJoin(assignee, eq(assignee.id, moderationTickets.assignedTo))
        .where(where)
        .orderBy(...order)
        .limit(f.limit)
        .offset((f.page - 1) * f.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(moderationTickets).leftJoin(users, eq(users.id, moderationTickets.offenderUserId)).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async getById(id: string, tx?: DBExecutor): Promise<TicketRecord | null> {
    const rows = await this.exec(tx)
      .select(this.cols())
      .from(moderationTickets)
      .leftJoin(users, eq(users.id, moderationTickets.offenderUserId))
      .leftJoin(assignee, eq(assignee.id, moderationTickets.assignedTo))
      .where(eq(moderationTickets.id, id))
      .limit(1);
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

  /** Assign an open ticket (→ in_review). False when the ticket is missing or closed. */
  async assign(ticketId: string, adminId: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(moderationTickets)
      .set({ assignedTo: adminId, status: 'in_review', updatedAt: sql`now()` })
      .where(and(eq(moderationTickets.id, ticketId), inArray(moderationTickets.status, OPEN_STATUSES)))
      .returning({ id: moderationTickets.id });
    return rows.length > 0;
  }

  /** Move an open ticket between open statuses; `open` returns it to the queue (unassigned). */
  async setStatus(ticketId: string, status: TicketStatus, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(moderationTickets)
      .set({ status, updatedAt: sql`now()`, ...(status === 'open' ? { assignedTo: null } : {}) })
      .where(and(eq(moderationTickets.id, ticketId), inArray(moderationTickets.status, OPEN_STATUSES)))
      .returning({ id: moderationTickets.id });
    return rows.length > 0;
  }

  /** Close an open ticket. False when it was already closed (lost a race) or is missing. */
  async resolve(ticketId: string, resolution: Resolution, note: string | undefined, adminId: string, dismissed: boolean, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(moderationTickets)
      .set({ resolution, status: dismissed ? 'dismissed' : 'resolved', resolvedBy: adminId, resolvedAt: sql`now()`, updatedAt: sql`now()`, ...(note ? { resolutionNote: note } : {}) })
      .where(and(eq(moderationTickets.id, ticketId), inArray(moderationTickets.status, OPEN_STATUSES)))
      .returning({ id: moderationTickets.id });
    return rows.length > 0;
  }

  /** After an offender is actioned, flag their other open tickets as repeat-offender. */
  async markRepeatOffender(userId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .update(moderationTickets)
      .set({ isRepeatOffender: true, updatedAt: sql`now()` })
      .where(and(eq(moderationTickets.offenderUserId, userId), inArray(moderationTickets.status, OPEN_STATUSES), eq(moderationTickets.isRepeatOffender, false)))
      .returning({ id: moderationTickets.id });
    return rows.length;
  }

  // ─── Notes ─────────────────────────────────────────────────────────────────

  async addNote(ticketId: string, authorId: string, body: string, tx?: DBExecutor): Promise<NoteRecord> {
    const rows = await this.exec(tx).insert(moderationTicketNotes).values({ ticketId, authorId, body }).returning({ id: moderationTicketNotes.id });
    const notes = await this.listNotes(ticketId, rows[0]!.id, tx);
    return notes[0]!;
  }

  async listNotes(ticketId: string, noteId?: string, tx?: DBExecutor): Promise<NoteRecord[]> {
    return this.exec(tx)
      .select({
        id: moderationTicketNotes.id,
        body: moderationTicketNotes.body,
        authorId: moderationTicketNotes.authorId,
        authorName: sql<string | null>`coalesce(nullif(trim(concat_ws(' ', ${noteAuthor.firstName}, ${noteAuthor.lastName})), ''), ${noteAuthor.email}, ${noteAuthor.username})`,
        createdAt: moderationTicketNotes.createdAt,
      })
      .from(moderationTicketNotes)
      .leftJoin(noteAuthor, eq(noteAuthor.id, moderationTicketNotes.authorId))
      .where(and(eq(moderationTicketNotes.ticketId, ticketId), noteId ? eq(moderationTicketNotes.id, noteId) : undefined))
      .orderBy(desc(moderationTicketNotes.createdAt), desc(moderationTicketNotes.id));
  }

  // ─── Offender history ──────────────────────────────────────────────────────

  async priorTickets(offenderUserId: string, excludeTicketId: string, limit = 20, tx?: DBExecutor): Promise<PriorTicketRecord[]> {
    return this.exec(tx)
      .select({
        id: moderationTickets.id, subjectType: moderationTickets.subjectType, category: moderationTickets.category, severity: moderationTickets.severity,
        status: moderationTickets.status, resolution: moderationTickets.resolution, createdAt: moderationTickets.createdAt,
      })
      .from(moderationTickets)
      .where(and(eq(moderationTickets.offenderUserId, offenderUserId), ne(moderationTickets.id, excludeTicketId)))
      .orderBy(desc(moderationTickets.createdAt))
      .limit(limit);
  }

  async offenderTotals(offenderUserId: string, tx?: DBExecutor): Promise<{ tickets: number; actioned: number; dismissed: number; open: number }> {
    const rows = await this.exec(tx)
      .select({
        tickets: sql<number>`count(*)::int`,
        actioned: sql<number>`(count(*) filter (where status = 'resolved' and resolution is distinct from 'no_action'))::int`,
        dismissed: sql<number>`(count(*) filter (where status = 'dismissed'))::int`,
        open: sql<number>`(count(*) filter (where status in ${OPEN_SQL}))::int`,
      })
      .from(moderationTickets)
      .where(eq(moderationTickets.offenderUserId, offenderUserId));
    return rows[0] ?? { tickets: 0, actioned: 0, dismissed: 0, open: 0 };
  }

  // ─── Stats ─────────────────────────────────────────────────────────────────

  async countsByStatus(tx?: DBExecutor): Promise<Record<string, number>> {
    const rows = await this.exec(tx).select({ status: moderationTickets.status, n: sql<number>`count(*)::int` }).from(moderationTickets).groupBy(moderationTickets.status);
    return Object.fromEntries(rows.map((r) => [r.status, r.n]));
  }

  /** @deprecated kept for compatibility — ticket counts keyed by status. */
  stats(tx?: DBExecutor): Promise<Record<string, number>> {
    return this.countsByStatus(tx);
  }

  async pendingBreakdown(tx?: DBExecutor): Promise<{ bySeverity: Record<string, number>; byType: Record<string, number> }> {
    const db = this.exec(tx);
    const open = inArray(moderationTickets.status, OPEN_STATUSES);
    const [sev, type] = await Promise.all([
      db.select({ k: moderationTickets.severity, n: sql<number>`count(*)::int` }).from(moderationTickets).where(open).groupBy(moderationTickets.severity),
      db.select({ k: moderationTickets.subjectType, n: sql<number>`count(*)::int` }).from(moderationTickets).where(open).groupBy(moderationTickets.subjectType),
    ]);
    return { bySeverity: Object.fromEntries(sev.map((r) => [r.k, r.n])), byType: Object.fromEntries(type.map((r) => [r.k, r.n])) };
  }

  /** Mean minutes from creation to close, for tickets closed in the last 7 days and the 7 before. */
  async avgResolutionMinutes(tx?: DBExecutor): Promise<{ current: number | null; previous: number | null }> {
    const mins = sql`extract(epoch from (resolved_at - created_at)) / 60.0`;
    const rows = await this.exec(tx)
      .select({
        current: sql<string | null>`avg(${mins}) filter (where resolved_at >= now() - interval '7 days')`,
        previous: sql<string | null>`avg(${mins}) filter (where resolved_at < now() - interval '7 days')`,
      })
      .from(moderationTickets)
      .where(and(isNotNull(moderationTickets.resolvedAt), sql`resolved_at >= now() - interval '14 days'`, inArray(moderationTickets.status, ['resolved', 'dismissed'])));
    const r = rows[0];
    const num = (v: string | null | undefined) => (v === null || v === undefined ? null : Number(v));
    return { current: num(r?.current), previous: num(r?.previous) };
  }

  /** Tickets closed (resolved + dismissed) today / yesterday (UTC days). */
  async closedCounts(tx?: DBExecutor): Promise<{ today: number; yesterday: number }> {
    const rows = await this.exec(tx)
      .select({
        today: sql<number>`(count(*) filter (where resolved_at >= date_trunc('day', now() at time zone 'utc') at time zone 'utc'))::int`,
        yesterday: sql<number>`(count(*) filter (where resolved_at < date_trunc('day', now() at time zone 'utc') at time zone 'utc'))::int`,
      })
      .from(moderationTickets)
      .where(and(inArray(moderationTickets.status, ['resolved', 'dismissed']), sql`resolved_at >= (date_trunc('day', now() at time zone 'utc') - interval '1 day') at time zone 'utc'`));
    return rows[0] ?? { today: 0, yesterday: 0 };
  }

  /** Reports per hour for the last 24 hourly buckets (oldest first) + the previous 24h total. */
  async reportVolume24h(tx?: DBExecutor): Promise<{ buckets: { hour: string; reports: number }[]; previous24h: number }> {
    const db = this.exec(tx);
    const [bucketRes, prevRes] = await Promise.all([
      db.execute(sql`
        select to_char(h at time zone 'utc', 'YYYY-MM-DD"T"HH24:00:00.000"Z"') as hour,
               (select count(*) from moderation_reports r where r.created_at >= h and r.created_at < h + interval '1 hour')::int as reports
          from generate_series(date_trunc('hour', now()) - interval '23 hours', date_trunc('hour', now()), interval '1 hour') as h
         order by h`),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(moderationReports)
        .where(and(sql`created_at >= date_trunc('hour', now()) - interval '47 hours'`, sql`created_at < date_trunc('hour', now()) - interval '23 hours'`)),
    ]);
    const buckets = (bucketRes.rows as { hour: string; reports: number }[]).map((r) => ({ hour: r.hour, reports: Number(r.reports) }));
    return { buckets, previous24h: prevRes[0]?.n ?? 0 };
  }

  async categoryCounts(days: number, tx?: DBExecutor): Promise<Record<string, number>> {
    const rows = await this.exec(tx)
      .select({ k: moderationTickets.category, n: sql<number>`count(*)::int` })
      .from(moderationTickets)
      .where(sql`created_at >= now() - make_interval(days => ${days})`)
      .groupBy(moderationTickets.category);
    return Object.fromEntries(rows.map((r) => [r.k, r.n]));
  }

  /** Inputs for the safety score: UGC + content created in the window vs. flagged subjects. */
  async safetyInputs(days: number, tx?: DBExecutor): Promise<{ totalItems: number; flaggedItems: number }> {
    const res = await this.exec(tx).execute(sql`
      select
        ((select count(*) from comments where created_at >= now() - make_interval(days => ${days}))
         + (select count(*) from contents where created_at >= now() - make_interval(days => ${days})))::int as total_items,
        (select count(distinct (subject_type, subject_id)) from moderation_tickets
          where subject_type in ('comment','content') and created_at >= now() - make_interval(days => ${days})
            and (status in ${OPEN_SQL} or (status = 'resolved' and resolution is distinct from 'no_action')))::int as flagged_items`);
    const r = res.rows[0] as { total_items: number; flagged_items: number } | undefined;
    return { totalItems: Number(r?.total_items ?? 0), flaggedItems: Number(r?.flagged_items ?? 0) };
  }
}
