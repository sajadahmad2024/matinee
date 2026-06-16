import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { leaderboardMonthly, users } from '@db/drizzle/schema';
import { desc, eq, sql } from 'drizzle-orm';

export interface LeaderboardRow {
  rank: number;
  userId: string;
  username: string | null;
  firstName: string | null;
  avatarUrl: string | null;
  xpEarned: number;
}

export interface MyRank {
  rank: number;
  xpEarned: number;
}

/** Monthly XP leaderboard (`leaderboard_monthly`, accumulated by the ledger trigger). */
@Injectable()
export class LeaderboardRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Ranked page for a period (rank() is computed over the full month, then paginated). */
  async getRanked(
    periodMonth: string,
    page: number,
    limit: number,
    tx?: DBExecutor,
  ): Promise<{ items: LeaderboardRow[]; total: number }> {
    const db = this.exec(tx);
    const [rows, totalRes] = await Promise.all([
      db
        .select({
          rank: sql<number>`rank() over (order by ${leaderboardMonthly.xpEarned} desc)::int`,
          userId: leaderboardMonthly.userId,
          username: users.username,
          firstName: users.firstName,
          avatarUrl: users.avatarUrl,
          xpEarned: leaderboardMonthly.xpEarned,
        })
        .from(leaderboardMonthly)
        .innerJoin(users, eq(users.id, leaderboardMonthly.userId))
        .where(eq(leaderboardMonthly.periodMonth, periodMonth))
        .orderBy(desc(leaderboardMonthly.xpEarned))
        .limit(limit)
        .offset((page - 1) * limit),
      db
        .select({ n: sql<number>`count(*)::int` })
        .from(leaderboardMonthly)
        .where(eq(leaderboardMonthly.periodMonth, periodMonth)),
    ]);
    return { items: rows, total: totalRes[0]?.n ?? 0 };
  }

  /** A user's rank within a period (null if they earned no XP that month). */
  async getMyRank(periodMonth: string, userId: string, tx?: DBExecutor): Promise<MyRank | null> {
    const db = this.exec(tx);
    const ranked = db
      .select({
        userId: leaderboardMonthly.userId,
        xpEarned: leaderboardMonthly.xpEarned,
        rank: sql<number>`rank() over (order by ${leaderboardMonthly.xpEarned} desc)::int`.as('rank'),
      })
      .from(leaderboardMonthly)
      .where(eq(leaderboardMonthly.periodMonth, periodMonth))
      .as('ranked');
    const rows = await db
      .select({ rank: ranked.rank, xpEarned: ranked.xpEarned })
      .from(ranked)
      .where(eq(ranked.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }
}
