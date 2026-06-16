import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { levelDefinitions } from '@db/drizzle/schema';
import { sql } from 'drizzle-orm';

export interface LevelDef {
  level: number;
  xpToAdvance: number;
  cumulativeToReach: number;
}

/**
 * The precomputed XP→level curve (`level_definitions`). Rebuilt from the 'leveling' reward-rule
 * config by the DB function `regenerate_level_definitions()`.
 */
@Injectable()
export class LevelRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Full curve, ordered by level. NUMERIC columns come back as strings → coerced to number. */
  async getCurve(tx?: DBExecutor): Promise<LevelDef[]> {
    const rows = await this.exec(tx)
      .select({
        level: levelDefinitions.level,
        xpToAdvance: levelDefinitions.xpToAdvance,
        cumulativeToReach: levelDefinitions.cumulativeToReach,
      })
      .from(levelDefinitions)
      .orderBy(levelDefinitions.level);
    return rows.map((r) => ({
      level: r.level,
      xpToAdvance: Number(r.xpToAdvance),
      cumulativeToReach: Number(r.cumulativeToReach),
    }));
  }

  /** Rebuild the curve from the current 'leveling' config (call after updating that rule). */
  async regenerate(tx?: DBExecutor): Promise<void> {
    await this.exec(tx).execute(sql`select regenerate_level_definitions()`);
  }
}
