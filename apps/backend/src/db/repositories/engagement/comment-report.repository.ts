import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { commentReports, comments, users } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export type ReportReason = 'nudity_sexual' | 'violence_gore' | 'hate_speech' | 'harassment_bullying' | 'other';

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
}
