import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { wallets, levelDefinitions } from '@db/drizzle/schema';
import { and, eq, lte, sql } from 'drizzle-orm';

/** Wallet balances + derived leveling, as shown on the Profile / My-Earns screens. */
export interface WalletView {
  /** Spendable balance, surfaced as "Coins" in the UI (alias of pointsBalance). */
  coins: number;
  /** Spendable "Coins" in the app. */
  pointsBalance: number;
  /** Lifetime "Total Earnings" (cumulative coins earned). */
  pointsEarnedLifetime: number;
  pointsSpentLifetime: number;
  pointsPurchasedLifetime: number;
  /** XP drives the level/leaderboard. */
  xpTotal: number;
  level: number;
  /** Cumulative XP at the start of the current level (progress-bar floor). */
  currentLevelXp: number;
  /** Cumulative XP needed to reach the next level (null at max level). */
  nextLevelXp: number | null;
}

const EMPTY = {
  pointsBalance: 0,
  pointsEarnedLifetime: 0,
  pointsSpentLifetime: 0,
  pointsPurchasedLifetime: 0,
  xpTotal: 0,
};

@Injectable()
export class WalletRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Wallet view for a user. Users with no ledger activity have no wallet row yet → zeros. */
  async getByUserId(userId: string, tx?: DBExecutor): Promise<WalletView> {
    const db = this.exec(tx);
    const rows = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
    const w = rows[0];
    const balances = w
      ? {
          pointsBalance: w.pointsBalance,
          pointsEarnedLifetime: w.pointsEarnedLifetime,
          pointsSpentLifetime: w.pointsSpentLifetime,
          pointsPurchasedLifetime: w.pointsPurchasedLifetime,
          xpTotal: w.xpTotal,
        }
      : EMPTY;
    return { coins: balances.pointsBalance, ...balances, ...(await this.deriveLevel(balances.xpTotal, db)) };
  }

  /** level = highest level whose cumulative XP requirement is already met; plus next threshold. */
  private async deriveLevel(
    xp: number,
    db: DBExecutor,
  ): Promise<{ level: number; currentLevelXp: number; nextLevelXp: number | null }> {
    const currentRows = await db
      .select({ level: levelDefinitions.level, cumulative: levelDefinitions.cumulativeToReach })
      .from(levelDefinitions)
      .where(lte(levelDefinitions.cumulativeToReach, sql`${xp}`))
      .orderBy(sql`${levelDefinitions.level} desc`)
      .limit(1);
    const current = currentRows[0];
    const level = current?.level ?? 1;
    const currentLevelXp = Number(current?.cumulative ?? 0);

    const nextRows = await db
      .select({ cumulative: levelDefinitions.cumulativeToReach })
      .from(levelDefinitions)
      .where(and(eq(levelDefinitions.level, level + 1)))
      .limit(1);
    const nextLevelXp = nextRows[0] ? Number(nextRows[0].cumulative) : null;

    return { level, currentLevelXp, nextLevelXp };
  }
}
