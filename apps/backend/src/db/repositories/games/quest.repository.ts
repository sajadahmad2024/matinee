import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { quests, questContents, questParticipations, questContentProgress } from '@db/drizzle/schema';
import { and, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface QuestRecord {
  id: string;
  name: string;
  description: string | null;
  rewardPoints: number;
  rewardXp: number;
  startAt: string;
  endAt: string;
  requireAll: boolean;
  status: string;
  contentCount: number;
}

export interface Participation {
  completedCount: number;
  isCompleted: boolean;
  completedAt: string | null;
  rewardedAt: string | null;
}

export interface QuestCreate {
  name: string;
  description?: string;
  rewardPoints?: number;
  rewardXp?: number;
  startAt: string;
  endAt: string;
  requireAll?: boolean;
}

@Injectable()
export class QuestRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private contentCountSql() {
    return sql<number>`(select count(*)::int from ${questContents} where ${questContents.questId} = ${quests.id})`;
  }

  async create(input: QuestCreate, contentIds: string[], adminId: string): Promise<string> {
    return this.dbService.transaction(async (tx) => {
      const rows = await tx
        .insert(quests)
        .values({
          name: input.name,
          startAt: input.startAt,
          endAt: input.endAt,
          createdBy: adminId,
          ...(input.description ? { description: input.description } : {}),
          ...(input.rewardPoints !== undefined ? { rewardPoints: input.rewardPoints } : {}),
          ...(input.rewardXp !== undefined ? { rewardXp: input.rewardXp } : {}),
          ...(input.requireAll !== undefined ? { requireAll: input.requireAll } : {}),
        })
        .returning({ id: quests.id });
      const id = rows[0]!.id;
      if (contentIds.length) {
        await tx.insert(questContents).values(contentIds.map((contentId) => ({ questId: id, contentId }))).onConflictDoNothing();
      }
      return id;
    });
  }

  async list(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: QuestRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(quests.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db.select({ ...this.cols(), contentCount: this.contentCountSql() }).from(quests).where(where).orderBy(desc(quests.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(quests).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async getById(id: string, tx?: DBExecutor): Promise<QuestRecord | null> {
    const rows = await this.exec(tx).select({ ...this.cols(), contentCount: this.contentCountSql() }).from(quests).where(eq(quests.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getContentIds(questId: string, tx?: DBExecutor): Promise<string[]> {
    const rows = await this.exec(tx).select({ contentId: questContents.contentId }).from(questContents).where(eq(questContents.questId, questId));
    return rows.map((r) => r.contentId);
  }

  /** Active quests within their live window + the caller's participation summary. */
  async listActiveForUser(userId: string, tx?: DBExecutor): Promise<Array<QuestRecord & { participation: Participation | null }>> {
    const db = this.exec(tx);
    const rows = await db
      .select({
        ...this.cols(),
        contentCount: this.contentCountSql(),
        completedCount: questParticipations.completedCount,
        isCompleted: questParticipations.isCompleted,
        completedAt: questParticipations.completedAt,
        rewardedAt: questParticipations.rewardedAt,
      })
      .from(quests)
      .leftJoin(questParticipations, and(eq(questParticipations.questId, quests.id), eq(questParticipations.userId, userId)))
      .where(and(eq(quests.status, 'active'), sql`${quests.startAt} <= now()`, sql`${quests.endAt} > now()`))
      .orderBy(desc(quests.endAt));
    return rows.map((r) => ({
      id: r.id, name: r.name, description: r.description, rewardPoints: r.rewardPoints, rewardXp: r.rewardXp,
      startAt: r.startAt, endAt: r.endAt, requireAll: r.requireAll, status: r.status, contentCount: r.contentCount,
      participation: r.completedCount === null ? null : { completedCount: r.completedCount, isCompleted: r.isCompleted!, completedAt: r.completedAt, rewardedAt: r.rewardedAt },
    }));
  }

  async getParticipation(questId: string, userId: string, tx?: DBExecutor): Promise<Participation | null> {
    const rows = await this.exec(tx)
      .select({ completedCount: questParticipations.completedCount, isCompleted: questParticipations.isCompleted, completedAt: questParticipations.completedAt, rewardedAt: questParticipations.rewardedAt })
      .from(questParticipations)
      .where(and(eq(questParticipations.questId, questId), eq(questParticipations.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async getCompletedContentIds(questId: string, userId: string, tx?: DBExecutor): Promise<string[]> {
    const rows = await this.exec(tx).select({ contentId: questContentProgress.contentId }).from(questContentProgress).where(and(eq(questContentProgress.questId, questId), eq(questContentProgress.userId, userId)));
    return rows.map((r) => r.contentId);
  }

  /** Record completing one quest content; recompute participation. Returns the fresh participation. */
  async recordContentComplete(quest: QuestRecord, userId: string, contentId: string): Promise<Participation> {
    return this.dbService.transaction(async (tx) => {
      await tx.insert(questContentProgress).values({ questId: quest.id, userId, contentId }).onConflictDoNothing();
      const cntRows = await tx.select({ n: sql<number>`count(*)::int` }).from(questContentProgress).where(and(eq(questContentProgress.questId, quest.id), eq(questContentProgress.userId, userId)));
      const completedCount = cntRows[0]?.n ?? 0;
      const required = quest.requireAll ? quest.contentCount : 1;
      const isCompleted = completedCount >= required;
      await tx
        .insert(questParticipations)
        .values({ questId: quest.id, userId, completedCount, isCompleted, ...(isCompleted ? { completedAt: sql`now()` } : {}) })
        .onConflictDoUpdate({
          target: [questParticipations.questId, questParticipations.userId],
          set: { completedCount, isCompleted, ...(isCompleted ? { completedAt: sql`coalesce(${questParticipations.completedAt}, now())` } : {}) },
        });
      return { completedCount, isCompleted, completedAt: isCompleted ? new Date().toISOString() : null, rewardedAt: null };
    });
  }

  async markRewarded(questId: string, userId: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(questParticipations).set({ rewardedAt: sql`now()` }).where(and(eq(questParticipations.questId, questId), eq(questParticipations.userId, userId)));
  }

  async update(id: string, patch: Partial<QuestCreate>, tx?: DBExecutor): Promise<boolean> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['name', 'description', 'rewardPoints', 'rewardXp', 'startAt', 'endAt', 'requireAll'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    const rows = await this.exec(tx).update(quests).set(set).where(eq(quests.id, id)).returning({ id: quests.id });
    return rows.length > 0;
  }

  async setStatus(id: string, status: 'draft' | 'active' | 'ended' | 'cancelled', tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).update(quests).set({ status, updatedAt: sql`now()` }).where(eq(quests.id, id)).returning({ id: quests.id });
    return rows.length > 0;
  }

  /** Hard-delete a quest (only when not live — draft/ended/cancelled), with its content links. */
  async delete(id: string): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      const guard = await tx.select({ status: quests.status }).from(quests).where(eq(quests.id, id)).limit(1);
      if (!guard[0] || guard[0].status === 'active') {
        return false;
      }
      await tx.delete(questContentProgress).where(eq(questContentProgress.questId, id));
      await tx.delete(questParticipations).where(eq(questParticipations.questId, id));
      await tx.delete(questContents).where(eq(questContents.questId, id));
      const rows = await tx.delete(quests).where(eq(quests.id, id)).returning({ id: quests.id });
      return rows.length > 0;
    });
  }

  private cols() {
    return {
      id: quests.id, name: quests.name, description: quests.description, rewardPoints: quests.rewardPoints,
      rewardXp: quests.rewardXp, startAt: quests.startAt, endAt: quests.endAt, requireAll: quests.requireAll, status: quests.status,
    };
  }
}
