import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { adminAuditLog } from '@db/drizzle/schema';
import { and, desc, eq, like, sql, type SQL } from 'drizzle-orm';

export interface AuditEntry {
  actorId: string | null;
  action: string;
  targetType?: string | undefined;
  targetId?: string | undefined;
  targetLabel?: string | undefined;
  metadata?: Record<string, unknown> | undefined;
  ipAddress?: string | undefined;
  userAgent?: string | undefined;
}

export interface AuditRecord {
  id: string;
  actorId: string | null;
  actorLabel: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  targetLabel: string | null;
  metadata: unknown;
  createdAt: string;
}

export interface AuditListFilter {
  page: number;
  limit: number;
  actionPrefix?: string | undefined;
  actorId?: string | undefined;
  targetType?: string | undefined;
  targetId?: string | undefined;
}

/** Admin audit trail (`admin_audit_log`) — append-only record of privileged actions. */
@Injectable()
export class AdminAuditRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private cols() {
    return {
      id: adminAuditLog.id,
      actorId: adminAuditLog.actorId,
      actorLabel: adminAuditLog.actorLabel,
      action: adminAuditLog.action,
      targetType: adminAuditLog.targetType,
      targetId: adminAuditLog.targetId,
      targetLabel: adminAuditLog.targetLabel,
      metadata: adminAuditLog.metadata,
      createdAt: adminAuditLog.createdAt,
    };
  }

  /** Append audit rows; the actor label (email / username) is snapshotted from `users`. */
  async record(entries: AuditEntry | AuditEntry[], tx?: DBExecutor): Promise<void> {
    const list = Array.isArray(entries) ? entries : [entries];
    if (!list.length) return;
    await this.exec(tx)
      .insert(adminAuditLog)
      .values(
        list.map((e) => ({
          actorId: e.actorId,
          actorLabel: e.actorId
            ? sql`(select left(coalesce(nullif(trim(concat_ws(' ', u.first_name, u.last_name)), ''), u.email, u.username), 150) from users u where u.id = ${e.actorId})`
            : null,
          action: e.action,
          metadata: e.metadata ?? {},
          ...(e.targetType ? { targetType: e.targetType } : {}),
          ...(e.targetId ? { targetId: e.targetId } : {}),
          ...(e.targetLabel ? { targetLabel: e.targetLabel.slice(0, 200) } : {}),
          ...(e.ipAddress ? { ipAddress: e.ipAddress.slice(0, 45) } : {}),
          ...(e.userAgent ? { userAgent: e.userAgent.slice(0, 300) } : {}),
        })),
      );
  }

  /** Timeline for one target, newest first. */
  async listForTarget(targetType: string, targetId: string, limit = 100, tx?: DBExecutor): Promise<AuditRecord[]> {
    return this.exec(tx)
      .select(this.cols())
      .from(adminAuditLog)
      .where(and(eq(adminAuditLog.targetType, targetType), eq(adminAuditLog.targetId, targetId)))
      .orderBy(desc(adminAuditLog.createdAt), desc(adminAuditLog.id))
      .limit(limit);
  }

  async list(filter: AuditListFilter, tx?: DBExecutor): Promise<{ items: AuditRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (filter.actionPrefix) conds.push(like(adminAuditLog.action, `${filter.actionPrefix}%`));
    if (filter.actorId) conds.push(eq(adminAuditLog.actorId, filter.actorId));
    if (filter.targetType) conds.push(eq(adminAuditLog.targetType, filter.targetType));
    if (filter.targetId) conds.push(eq(adminAuditLog.targetId, filter.targetId));
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db
        .select(this.cols())
        .from(adminAuditLog)
        .where(where)
        .orderBy(desc(adminAuditLog.createdAt), desc(adminAuditLog.id))
        .limit(filter.limit)
        .offset((filter.page - 1) * filter.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(adminAuditLog).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }
}
