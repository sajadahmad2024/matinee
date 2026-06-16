import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { rewardRules, rewardRuleVersions } from '@db/drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface RewardRuleRecord {
  id: string;
  ruleKey: string;
  name: string;
  description: string | null;
  isEnabled: boolean;
  config: unknown;
  version: number;
  updatedAt: string;
}

export interface RewardRuleVersionRecord {
  version: number;
  config: unknown;
  changedBy: string | null;
  createdAt: string;
}

export interface RewardRuleUpdate {
  name?: string;
  description?: string;
  isEnabled?: boolean;
  config?: unknown;
}

@Injectable()
export class RewardRuleRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  private map(r: typeof rewardRules.$inferSelect): RewardRuleRecord {
    return {
      id: r.id,
      ruleKey: r.ruleKey,
      name: r.name,
      description: r.description,
      isEnabled: r.isEnabled,
      config: r.config,
      version: r.version,
      updatedAt: r.updatedAt,
    };
  }

  async list(opts: { enabledOnly?: boolean } = {}, tx?: DBExecutor): Promise<RewardRuleRecord[]> {
    const db = this.exec(tx);
    const rows = opts.enabledOnly
      ? await db.select().from(rewardRules).where(eq(rewardRules.isEnabled, true)).orderBy(rewardRules.ruleKey)
      : await db.select().from(rewardRules).orderBy(rewardRules.ruleKey);
    return rows.map((r) => this.map(r));
  }

  async getByKey(ruleKey: string, tx?: DBExecutor): Promise<RewardRuleRecord | null> {
    const rows = await this.exec(tx).select().from(rewardRules).where(eq(rewardRules.ruleKey, ruleKey)).limit(1);
    return rows[0] ? this.map(rows[0]) : null;
  }

  /**
   * Update a rule and snapshot the new config as the next version (audit + rollback source),
   * atomically. Returns the updated rule, or null if the key doesn't exist.
   */
  async update(ruleKey: string, patch: RewardRuleUpdate, changedBy: string, tx?: DBExecutor): Promise<RewardRuleRecord | null> {
    const run = async (db: DBExecutor): Promise<RewardRuleRecord | null> => {
      const updated = await db
        .update(rewardRules)
        .set({
          ...(patch.name !== undefined ? { name: patch.name } : {}),
          ...(patch.description !== undefined ? { description: patch.description } : {}),
          ...(patch.isEnabled !== undefined ? { isEnabled: patch.isEnabled } : {}),
          ...(patch.config !== undefined ? { config: patch.config } : {}),
          version: sql`${rewardRules.version} + 1`,
          updatedBy: changedBy,
          updatedAt: sql`now()`,
        })
        .where(eq(rewardRules.ruleKey, ruleKey))
        .returning();
      const row = updated[0];
      if (!row) {
        return null;
      }
      await db
        .insert(rewardRuleVersions)
        .values({ ruleId: row.id, ruleKey: row.ruleKey, version: row.version, config: row.config, changedBy })
        .onConflictDoNothing();
      return this.map(row);
    };
    return tx ? run(tx) : this.dbService.db.transaction((t) => run(t));
  }

  async listVersions(ruleKey: string, tx?: DBExecutor): Promise<RewardRuleVersionRecord[]> {
    return this.exec(tx)
      .select({
        version: rewardRuleVersions.version,
        config: rewardRuleVersions.config,
        changedBy: rewardRuleVersions.changedBy,
        createdAt: rewardRuleVersions.createdAt,
      })
      .from(rewardRuleVersions)
      .where(eq(rewardRuleVersions.ruleKey, ruleKey))
      .orderBy(desc(rewardRuleVersions.version));
  }
}
