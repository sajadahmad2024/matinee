import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { commentReports, comments, users } from '@db/drizzle/schema';
import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';

export type ReportReason = 'nudity_sexual' | 'violence_gore' | 'hate_speech' | 'harassment_bullying' | 'spam' | 'other';

export interface ReportRecord {
  id: string;
  commentId: string;
  commentBody: string;
  reason: string;
  description: string | null;
  status: string;
  reportedBy: string;
  reporterUsername: string | null;
  createdAt: string;
}

@Injectable()
export class CommentReportRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** File a report (one row per report; a comment can be reported by many users). */
  async create(input: { commentId: string; reportedBy: string; reason: ReportReason; description?: string }, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx)
      .insert(commentReports)
      .values({
        commentId: input.commentId,
        reportedBy: input.reportedBy,
        reason: input.reason,
        ...(input.description ? { description: input.description } : {}),
      })
      .returning({ id: commentReports.id });
    return rows[0]!.id;
  }

  /** Admin queue: reports, newest first, optionally filtered by status. */
  async list(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: ReportRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(commentReports.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [rows, totalRes] = await Promise.all([
      db
        .select({
          id: commentReports.id,
          commentId: commentReports.commentId,
          commentBody: comments.body,
          reason: commentReports.reason,
          description: commentReports.description,
          status: commentReports.status,
          reportedBy: commentReports.reportedBy,
          reporterUsername: users.username,
          createdAt: commentReports.createdAt,
        })
        .from(commentReports)
        .innerJoin(comments, eq(comments.id, commentReports.commentId))
        .leftJoin(users, eq(users.id, commentReports.reportedBy))
        .where(where)
        .orderBy(desc(commentReports.createdAt))
        .limit(opts.limit)
        .offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(commentReports).where(where),
    ]);
    return { items: rows, total: totalRes[0]?.n ?? 0 };
  }

  /** Resolve a report (actioned/dismissed) + stamp the reviewer. Returns false if not found. */
  async resolve(id: string, status: 'actioned' | 'dismissed', reviewedBy: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(commentReports)
      .set({ status, reviewedBy, reviewedAt: sql`now()` })
      .where(eq(commentReports.id, id))
      .returning({ id: commentReports.id });
    return rows.length > 0;
  }

  async getById(id: string, tx?: DBExecutor): Promise<{ id: string; commentId: string; status: string } | null> {
    const rows = await this.exec(tx)
      .select({ id: commentReports.id, commentId: commentReports.commentId, status: commentReports.status })
      .from(commentReports)
      .where(eq(commentReports.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Close every pending report on a comment (ticket resolved / author enforced). Returns count. */
  async resolvePendingForComment(commentId: string, status: 'actioned' | 'dismissed', reviewedBy: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .update(commentReports)
      .set({ status, reviewedBy, reviewedAt: sql`now()` })
      .where(and(eq(commentReports.commentId, commentId), eq(commentReports.status, 'pending')))
      .returning({ id: commentReports.id });
    return rows.length;
  }

  /** Pending count + whether any report on the comment was actioned (for ticket sync). */
  async summaryForComment(commentId: string, tx?: DBExecutor): Promise<{ pending: number; actioned: number }> {
    const rows = await this.exec(tx)
      .select({
        pending: sql<number>`count(*) filter (where ${commentReports.status} = 'pending')::int`,
        actioned: sql<number>`count(*) filter (where ${commentReports.status} = 'actioned')::int`,
      })
      .from(commentReports)
      .where(eq(commentReports.commentId, commentId));
    return { pending: rows[0]?.pending ?? 0, actioned: rows[0]?.actioned ?? 0 };
  }

  /** Every report on one comment (thread view). */
  async listForComment(commentId: string, tx?: DBExecutor): Promise<ReportRecord[]> {
    return this.exec(tx)
      .select({
        id: commentReports.id,
        commentId: commentReports.commentId,
        commentBody: comments.body,
        reason: commentReports.reason,
        description: commentReports.description,
        status: commentReports.status,
        reportedBy: commentReports.reportedBy,
        reporterUsername: users.username,
        createdAt: commentReports.createdAt,
      })
      .from(commentReports)
      .innerJoin(comments, eq(comments.id, commentReports.commentId))
      .leftJoin(users, eq(users.id, commentReports.reportedBy))
      .where(eq(commentReports.commentId, commentId))
      .orderBy(asc(commentReports.createdAt));
  }
}
