import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { predictions, predictionOptions, predictionEntries } from '@db/drizzle/schema';
import { and, asc, desc, eq, sql, type SQL } from 'drizzle-orm';

export interface PredictionRecord {
  id: string;
  question: string;
  description: string | null;
  contentId: string | null;
  startAt: string;
  endAt: string;
  status: string;
  rewardPoints: number;
  rewardXp: number;
  entryCostPoints: number;
  payoutMultiplier: number;
  correctOptionId: string | null;
}

export interface OptionRecord {
  id: string;
  label: string | null;
  optionMediaId: string | null;
  sortOrder: number;
  isCorrect: boolean;
}

export interface EntryRecord {
  id: string;
  userId: string;
  optionId: string;
  isCorrect: boolean | null;
  pointsStaked: number;
  pointsAwarded: number;
}

export interface PredictionCreate {
  question: string;
  description?: string;
  contentId?: string;
  startAt: string;
  endAt: string;
  rewardPoints?: number;
  rewardXp?: number;
  entryCostPoints?: number;
  payoutMultiplier?: number;
}

@Injectable()
export class PredictionRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private cols() {
    return {
      id: predictions.id, question: predictions.question, description: predictions.description, contentId: predictions.contentId,
      startAt: predictions.startAt, endAt: predictions.endAt, status: predictions.status, rewardPoints: predictions.rewardPoints,
      rewardXp: predictions.rewardXp, entryCostPoints: predictions.entryCostPoints, payoutMultiplier: predictions.payoutMultiplier,
      correctOptionId: predictions.correctOptionId,
    };
  }

  async create(input: PredictionCreate, options: string[], adminId: string): Promise<string> {
    return this.dbService.transaction(async (tx) => {
      const rows = await tx
        .insert(predictions)
        .values({
          question: input.question,
          startAt: input.startAt,
          endAt: input.endAt,
          createdBy: adminId,
          ...(input.description ? { description: input.description } : {}),
          ...(input.contentId ? { contentId: input.contentId } : {}),
          ...(input.rewardPoints !== undefined ? { rewardPoints: input.rewardPoints } : {}),
          ...(input.rewardXp !== undefined ? { rewardXp: input.rewardXp } : {}),
          ...(input.entryCostPoints !== undefined ? { entryCostPoints: input.entryCostPoints } : {}),
          ...(input.payoutMultiplier !== undefined ? { payoutMultiplier: input.payoutMultiplier } : {}),
        })
        .returning({ id: predictions.id });
      const id = rows[0]!.id;
      await tx.insert(predictionOptions).values(options.map((label, i) => ({ predictionId: id, label, sortOrder: i })));
      return id;
    });
  }

  async list(opts: { page: number; limit: number; status?: string }, tx?: DBExecutor): Promise<{ items: PredictionRecord[]; total: number }> {
    const db = this.exec(tx);
    const conds: SQL[] = [];
    if (opts.status) {
      conds.push(eq(predictions.status, opts.status));
    }
    const where = conds.length ? and(...conds) : undefined;
    const [items, totalRes] = await Promise.all([
      db.select(this.cols()).from(predictions).where(where).orderBy(desc(predictions.createdAt)).limit(opts.limit).offset((opts.page - 1) * opts.limit),
      db.select({ n: sql<number>`count(*)::int` }).from(predictions).where(where),
    ]);
    return { items, total: totalRes[0]?.n ?? 0 };
  }

  async listOpen(tx?: DBExecutor): Promise<PredictionRecord[]> {
    return this.exec(tx).select(this.cols()).from(predictions).where(and(eq(predictions.status, 'open'), sql`${predictions.startAt} <= now()`, sql`${predictions.endAt} > now()`)).orderBy(desc(predictions.endAt));
  }

  async getById(id: string, tx?: DBExecutor): Promise<PredictionRecord | null> {
    const rows = await this.exec(tx).select(this.cols()).from(predictions).where(eq(predictions.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getOptions(predictionId: string, tx?: DBExecutor): Promise<OptionRecord[]> {
    return this.exec(tx)
      .select({ id: predictionOptions.id, label: predictionOptions.label, optionMediaId: predictionOptions.optionMediaId, sortOrder: predictionOptions.sortOrder, isCorrect: predictionOptions.isCorrect })
      .from(predictionOptions)
      .where(eq(predictionOptions.predictionId, predictionId))
      .orderBy(asc(predictionOptions.sortOrder));
  }

  async getEntry(predictionId: string, userId: string, tx?: DBExecutor): Promise<EntryRecord | null> {
    const rows = await this.exec(tx)
      .select({ id: predictionEntries.id, userId: predictionEntries.userId, optionId: predictionEntries.optionId, isCorrect: predictionEntries.isCorrect, pointsStaked: predictionEntries.pointsStaked, pointsAwarded: predictionEntries.pointsAwarded })
      .from(predictionEntries)
      .where(and(eq(predictionEntries.predictionId, predictionId), eq(predictionEntries.userId, userId)))
      .limit(1);
    return rows[0] ?? null;
  }

  async listEntries(predictionId: string, tx?: DBExecutor): Promise<EntryRecord[]> {
    return this.exec(tx)
      .select({ id: predictionEntries.id, userId: predictionEntries.userId, optionId: predictionEntries.optionId, isCorrect: predictionEntries.isCorrect, pointsStaked: predictionEntries.pointsStaked, pointsAwarded: predictionEntries.pointsAwarded })
      .from(predictionEntries)
      .where(eq(predictionEntries.predictionId, predictionId));
  }

  async createEntry(predictionId: string, userId: string, optionId: string, pointsStaked: number, tx?: DBExecutor): Promise<string> {
    const rows = await this.exec(tx).insert(predictionEntries).values({ predictionId, userId, optionId, pointsStaked }).returning({ id: predictionEntries.id });
    return rows[0]!.id;
  }

  async setEntryResult(entryId: string, isCorrect: boolean, pointsAwarded: number, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).update(predictionEntries).set({ isCorrect, pointsAwarded }).where(eq(predictionEntries.id, entryId));
  }

  async resolve(id: string, correctOptionId: string, adminId: string, tx?: DBExecutor): Promise<void> {
    const db = this.exec(tx);
    await db.update(predictions).set({ correctOptionId, status: 'resolved', resolvedBy: adminId, resolvedAt: sql`now()`, updatedAt: sql`now()` }).where(eq(predictions.id, id));
    await db.update(predictionOptions).set({ isCorrect: sql`(${predictionOptions.id} = ${correctOptionId})` }).where(eq(predictionOptions.predictionId, id));
  }

  async setStatus(id: string, status: 'open' | 'locked' | 'cancelled', tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx).update(predictions).set({ status, updatedAt: sql`now()` }).where(eq(predictions.id, id)).returning({ id: predictions.id });
    return rows.length > 0;
  }

  async countEntries(predictionId: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx).select({ n: sql<number>`count(*)::int` }).from(predictionEntries).where(eq(predictionEntries.predictionId, predictionId));
    return rows[0]?.n ?? 0;
  }

  /** Count a user's prediction entries since a timestamp (the free-entry allowance window). */
  async countEntriesByUserSince(userId: string, since: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .select({ n: sql<number>`count(*)::int` })
      .from(predictionEntries)
      .where(and(eq(predictionEntries.userId, userId), sql`${predictionEntries.createdAt} >= ${since}`));
    return rows[0]?.n ?? 0;
  }

  /** Edit descriptive/scheduling/reward fields (not options). */
  async update(id: string, patch: Partial<PredictionCreate>, tx?: DBExecutor): Promise<boolean> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['question', 'description', 'contentId', 'startAt', 'endAt', 'rewardPoints', 'rewardXp', 'entryCostPoints', 'payoutMultiplier'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    const rows = await this.exec(tx).update(predictions).set(set).where(eq(predictions.id, id)).returning({ id: predictions.id });
    return rows.length > 0;
  }

  async delete(id: string): Promise<boolean> {
    return this.dbService.transaction(async (tx) => {
      await tx.delete(predictionOptions).where(eq(predictionOptions.predictionId, id));
      const rows = await tx.delete(predictions).where(eq(predictions.id, id)).returning({ id: predictions.id });
      return rows.length > 0;
    });
  }
}
