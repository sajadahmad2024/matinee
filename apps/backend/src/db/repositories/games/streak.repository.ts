import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { userStreaks, userStreakDays } from '@db/drizzle/schema';
import { and, desc, eq, gte, lt, sql } from 'drizzle-orm';

interface DayRow {
  d: string;
}

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  totalQualifiedDays: number;
  lastQualifiedDate: string | null;
  currentLevel: number;
  levelProgressDays: number;
  levelsCompleted: number;
}

export interface StreakDayRecord {
  day: string;
  level: number;
  watchSeconds: number;
  requiredSeconds: number;
  streakDay: number;
  pointsAwarded: number;
  levelCompleted: boolean;
  completionBonus: number;
}

export interface StreakBadgeRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  triggerKey: string;
  operator: string;
  threshold: number;
  earnedAt: string | null;
}

/** Metrics the badge engine (`user_metrics` trigger) evaluates for streak badges. */
export const STREAK_METRICS = ['streak_level_completed', 'watch_streak_days'] as const;

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
        currentLevel: userStreaks.currentLevel,
        levelProgressDays: userStreaks.levelProgressDays,
        levelsCompleted: userStreaks.levelsCompleted,
      })
      .from(userStreaks)
      .where(eq(userStreaks.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  /** Lock the user's streak row for the rest of the transaction (creates it if missing). */
  async lock(userId: string, tx: DBExecutor): Promise<StreakState> {
    await tx.insert(userStreaks).values({ userId }).onConflictDoNothing();
    const res = (await tx.execute(sql`
      select current_streak as "currentStreak", longest_streak as "longestStreak",
             total_qualified_days as "totalQualifiedDays", last_qualified_date::text as "lastQualifiedDate",
             current_level as "currentLevel", level_progress_days as "levelProgressDays",
             levels_completed as "levelsCompleted"
        from user_streaks where user_id = ${userId} for update`)) as unknown as { rows: StreakState[] };
    return res.rows[0]!;
  }

  async save(userId: string, s: StreakState, tx: DBExecutor): Promise<void> {
    await tx
      .update(userStreaks)
      .set({
        currentStreak: s.currentStreak,
        longestStreak: s.longestStreak,
        totalQualifiedDays: s.totalQualifiedDays,
        lastQualifiedDate: s.lastQualifiedDate,
        currentLevel: s.currentLevel,
        levelProgressDays: s.levelProgressDays,
        levelsCompleted: s.levelsCompleted,
        updatedAt: sql`now()`,
      })
      .where(eq(userStreaks.userId, userId));
  }

  /** Record a qualified day. Returns false if the day was already recorded (idempotent). */
  async insertDay(userId: string, d: StreakDayRecord, tx: DBExecutor): Promise<boolean> {
    const rows = await tx
      .insert(userStreakDays)
      .values({ userId, ...d })
      .onConflictDoNothing()
      .returning({ day: userStreakDays.day });
    return rows.length > 0;
  }

  async getDay(userId: string, day: string, tx?: DBExecutor): Promise<StreakDayRecord | null> {
    const rows = await this.exec(tx)
      .select()
      .from(userStreakDays)
      .where(and(eq(userStreakDays.userId, userId), eq(userStreakDays.day, day)))
      .limit(1);
    const r = rows[0];
    return r ? this.mapDay(r) : null;
  }

  private mapDay(r: typeof userStreakDays.$inferSelect): StreakDayRecord {
    return {
      day: r.day,
      level: r.level,
      watchSeconds: r.watchSeconds,
      requiredSeconds: r.requiredSeconds,
      streakDay: r.streakDay,
      pointsAwarded: r.pointsAwarded,
      levelCompleted: r.levelCompleted,
      completionBonus: r.completionBonus,
    };
  }

  /** Upsert a badge-engine metric (the `user_metrics` trigger awards matching badges). */
  async setMetric(userId: string, key: string, value: number, tx?: DBExecutor): Promise<void> {
    await this.exec(tx).execute(sql`
      insert into user_metrics (user_id, metric_key, value) values (${userId}, ${key}, ${value})
      on conflict (user_id, metric_key) do update set value = excluded.value, updated_at = now()
        where user_metrics.value <> excluded.value`);
  }

  /**
   * Qualified dates in [monthStart, monthEnd) for the calendar view — streak days, plus legacy
   * check-in days from the ledger (before watch-based streaks).
   */
  async qualifiedDaysInRange(userId: string, monthStart: string, monthEnd: string, tx?: DBExecutor): Promise<string[]> {
    const res = await this.exec(tx).execute(sql`
      select d from (
        select day::text as d from user_streak_days
         where user_id = ${userId} and day >= ${monthStart}::date and day < ${monthEnd}::date
        union
        select (created_at at time zone 'UTC')::date::text as d
          from ledger_transactions
         where user_id = ${userId} and source_type = 'daily_streak'
           and created_at >= ${monthStart}::date and created_at < ${monthEnd}::date
      ) x order by d`);
    return (res as unknown as { rows: DayRow[] }).rows.map((r) => r.d);
  }

  /** Calendar cells with the level each day was played at. */
  async calendar(userId: string, monthStart: string, monthEnd: string, tx?: DBExecutor): Promise<Array<{ date: string; level: number }>> {
    const rows = await this.exec(tx)
      .select({ date: userStreakDays.day, level: userStreakDays.level })
      .from(userStreakDays)
      .where(and(eq(userStreakDays.userId, userId), gte(userStreakDays.day, monthStart), lt(userStreakDays.day, monthEnd)))
      .orderBy(userStreakDays.day);
    return rows;
  }

  /** Activity log (newest first) with the streak badges unlocked on each day. */
  async activity(
    userId: string,
    page: number,
    limit: number,
    tx?: DBExecutor,
  ): Promise<{ items: Array<StreakDayRecord & { badges: string[] }>; total: number }> {
    const db = this.exec(tx);
    const [rows, count] = await Promise.all([
      db
        .select()
        .from(userStreakDays)
        .where(eq(userStreakDays.userId, userId))
        .orderBy(desc(userStreakDays.day))
        .limit(limit)
        .offset((page - 1) * limit),
      db.select({ n: sql<number>`count(*)::int` }).from(userStreakDays).where(eq(userStreakDays.userId, userId)),
    ]);
    const days = rows.map((r) => r.day);
    const badgeByDay = new Map<string, string[]>();
    if (days.length > 0) {
      const res = (await db.execute(sql`
        select (ub.earned_at at time zone 'UTC')::date::text as d, b.name
          from user_badges ub join badges b on b.id = ub.badge_id
         where ub.user_id = ${userId}
           and b.trigger_key in ('streak_level_completed', 'watch_streak_days')
           and (ub.earned_at at time zone 'UTC')::date in (${sql.join(days.map((d) => sql`${d}::date`), sql`, `)})
         order by ub.earned_at`)) as unknown as { rows: Array<{ d: string; name: string }> };
      for (const r of res.rows) {
        badgeByDay.set(r.d, [...(badgeByDay.get(r.d) ?? []), r.name]);
      }
    }
    return {
      items: rows.map((r) => ({ ...this.mapDay(r), badges: badgeByDay.get(r.day) ?? [] })),
      total: count[0]?.n ?? 0,
    };
  }

  /** Active streak badges with the user's earned timestamp (null = locked). */
  async streakBadges(userId: string, tx?: DBExecutor): Promise<StreakBadgeRow[]> {
    const res = (await this.exec(tx).execute(sql`
      select b.id, b.name, b.slug, b.description, b.trigger_key as "triggerKey", b.operator,
             b.threshold::float as threshold, ub.earned_at as "earnedAt"
        from badges b
        left join user_badges ub on ub.badge_id = b.id and ub.user_id = ${userId}
       where b.is_active and b.deleted_at is null
         and b.trigger_key in ('streak_level_completed', 'watch_streak_days')
       order by b.trigger_key desc, b.threshold asc`)) as unknown as { rows: StreakBadgeRow[] };
    return res.rows;
  }
}
