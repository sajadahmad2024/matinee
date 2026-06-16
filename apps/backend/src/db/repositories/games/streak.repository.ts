import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { userStreaks } from '@db/drizzle/schema';
import { eq, sql } from 'drizzle-orm';

interface DayRow {
  d: string;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  totalQualifiedDays: number;
  lastQualifiedDate: string | null;
}

@Injectable()
export class StreakRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  async get(userId: string, tx?: DBExecutor): Promise<StreakState | null> {
    const rows = await this.exec(tx)
      .select({
        currentStreak: userStreaks.currentStreak,
        longestStreak: userStreaks.longestStreak,
        totalQualifiedDays: userStreaks.totalQualifiedDays,
        lastQualifiedDate: userStreaks.lastQualifiedDate,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  /**
   * Distinct qualified dates in [monthStart, monthEnd) for the calendar view.
   * Sourced from the ledger (the per-day record of check-ins; user_streaks holds only the
   * rolling state). monthStart/monthEnd are 'YYYY-MM-DD' boundaries.
   */
  async qualifiedDaysInRange(userId: string, monthStart: string, monthEnd: string, tx?: DBExecutor): Promise<string[]> {
    const res = await this.exec(tx).execute(sql`
      select distinct (created_at at time zone 'UTC')::date::text as d
      from ledger_transactions
      where user_id = ${userId}
        and source_type = 'daily_streak'
        and created_at >= ${monthStart}
        and created_at < ${monthEnd}
      order by d`);
    return ((res as unknown as { rows: DayRow[] }).rows).map((r) => r.d);
  }

  /** Record today's qualifying day with the computed streak values. */
  async checkIn(userId: string, current: number, longest: number, today: string, tx?: DBExecutor): Promise<void> {
    await this.exec(tx)
      .insert(userStreaks)
      .values({ userId, currentStreak: current, longestStreak: longest, totalQualifiedDays: 1, lastQualifiedDate: today })
      .onConflictDoUpdate({
        target: userStreaks.userId,
        set: {
          currentStreak: current,
          longestStreak: longest,
          totalQualifiedDays: sql`${userStreaks.totalQualifiedDays} + 1`,
          lastQualifiedDate: today,
          updatedAt: sql`now()`,
        },
      });
  }
}
