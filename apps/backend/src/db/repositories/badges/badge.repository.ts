import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { badges, badgeTriggers, userBadges } from '@db/drizzle/schema';
import { and, desc, eq, inArray, isNull, sql } from 'drizzle-orm';

export interface BadgeRecord {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  triggerKey: string;
  operator: string;
  threshold: number;
  rewardPoints: number;
  rewardXp: number;
  isActive: boolean;
  earnedCount: number;
}

export interface EarnedBadge extends BadgeRecord {
  earnedAt: string;
}

export interface TriggerRecord {
  key: string;
  label: string;
  unit: string | null;
  description: string | null;
}

export interface BadgeCreate {
  name: string;
  slug: string;
  description?: string;
  triggerKey: string;
  operator: 'gt' | 'gte' | 'eq' | 'lt' | 'lte';
  threshold: number;
  rewardPoints?: number;
  rewardXp?: number;
}

@Injectable()
export class BadgeRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private map(r: typeof badges.$inferSelect): BadgeRecord {
    return {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description,
      triggerKey: r.triggerKey,
      operator: r.operator,
      threshold: Number(r.threshold),
      rewardPoints: r.rewardPoints,
      rewardXp: r.rewardXp,
      isActive: r.isActive,
      earnedCount: Number(r.earnedCount),
    };
  }

  async list(activeOnly: boolean, tx?: DBExecutor): Promise<BadgeRecord[]> {
    const conds = [isNull(badges.deletedAt)];
    if (activeOnly) {
      conds.push(eq(badges.isActive, true));
    }
    const rows = await this.exec(tx).select().from(badges).where(and(...conds)).orderBy(desc(badges.createdAt));
    return rows.map((r) => this.map(r));
  }

  async getById(id: string, tx?: DBExecutor): Promise<BadgeRecord | null> {
    const rows = await this.exec(tx).select().from(badges).where(and(eq(badges.id, id), isNull(badges.deletedAt))).limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  async listTriggers(tx?: DBExecutor): Promise<TriggerRecord[]> {
    return this.exec(tx)
      .select({ key: badgeTriggers.key, label: badgeTriggers.label, unit: badgeTriggers.unit, description: badgeTriggers.description })
      .from(badgeTriggers)
      .where(eq(badgeTriggers.isActive, true));
  }

  async create(input: BadgeCreate, adminId: string, tx?: DBExecutor): Promise<BadgeRecord> {
    const rows = await this.exec(tx)
      .insert(badges)
      .values({
        name: input.name,
        slug: input.slug,
        triggerKey: input.triggerKey,
        operator: input.operator,
        threshold: String(input.threshold),
        createdBy: adminId,
        ...(input.description ? { description: input.description } : {}),
        ...(input.rewardPoints !== undefined ? { rewardPoints: input.rewardPoints } : {}),
        ...(input.rewardXp !== undefined ? { rewardXp: input.rewardXp } : {}),
      })
      .returning();
    return this.map(rows[0]!);
  }

  async update(id: string, patch: Partial<BadgeCreate & { isActive: boolean }>, tx?: DBExecutor): Promise<BadgeRecord | null> {
    const set: Record<string, unknown> = { updatedAt: sql`now()` };
    for (const k of ['name', 'slug', 'description', 'triggerKey', 'operator', 'rewardPoints', 'rewardXp', 'isActive'] as const) {
      if (patch[k] !== undefined) {
        set[k] = patch[k];
      }
    }
    if (patch.threshold !== undefined) {
      set['threshold'] = String(patch.threshold);
    }
    const rows = await this.exec(tx).update(badges).set(set).where(and(eq(badges.id, id), isNull(badges.deletedAt))).returning();
    return rows[0] ? this.map(rows[0]) : null;
  }

  async softDelete(id: string, tx?: DBExecutor): Promise<boolean> {
    const rows = await this.exec(tx)
      .update(badges)
      .set({ deletedAt: sql`now()`, isActive: false, updatedAt: sql`now()` })
      .where(and(eq(badges.id, id), isNull(badges.deletedAt)))
      .returning({ id: badges.id });
    return rows.length > 0;
  }

  /** Badges a user has earned (auto-awarded by the trg_evaluate_badges trigger on user_metrics). */
  async listEarned(userId: string, tx?: DBExecutor): Promise<EarnedBadge[]> {
    const rows = await this.exec(tx)
      .select({ badge: badges, earnedAt: userBadges.earnedAt })
      .from(userBadges)
      .innerJoin(badges, eq(badges.id, userBadges.badgeId))
      .where(eq(userBadges.userId, userId))
      .orderBy(desc(userBadges.earnedAt));
    return rows.map((r) => ({ ...this.map(r.badge), earnedAt: r.earnedAt }));
  }

  async earnedIds(userId: string, badgeIds: string[], tx?: DBExecutor): Promise<Set<string>> {
    if (badgeIds.length === 0) {
      return new Set();
    }
    const rows = await this.exec(tx)
      .select({ badgeId: userBadges.badgeId })
      .from(userBadges)
      .where(and(eq(userBadges.userId, userId), inArray(userBadges.badgeId, badgeIds)));
    return new Set(rows.map((r) => r.badgeId));
  }
}
