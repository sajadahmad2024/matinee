import { Injectable } from '@nestjs/common';
import { DBService } from '@db/db.service';
import { ViewRepository } from '@db/repositories/engagement/view.repository';
import { StreakRepository, StreakState } from '@db/repositories/games/streak.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import {
  isStreakAlive,
  levelFor,
  planQualification,
  resolveLevels,
  StreakLevel,
  StreakRuleConfig,
} from './streak-levels';

const DAY_MS = 86_400_000;

const EMPTY_STATE: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  totalQualifiedDays: 0,
  lastQualifiedDate: null,
  currentLevel: 1,
  levelProgressDays: 0,
  levelsCompleted: 0,
};

/** Today's progress toward the streak (the "Today's Session" card + heartbeat echo). */
export interface StreakTodayView {
  date: string;
  watchSeconds: number;
  requiredSeconds: number;
  remainingSeconds: number;
  qualified: boolean;
}

export interface StreakEvaluation {
  qualified: boolean;
  alreadyQualified: boolean;
  currentStreak: number;
  level: number;
  awardedPoints: number;
  awardedXp: number;
  milestoneBonus: number;
  levelCompleted: boolean;
  completionBonus: number;
  today: StreakTodayView;
}

/**
 * Watch-based daily streak (Figma "Daily Streaks"): a day qualifies automatically once today's
 * credited watch time reaches the current level's minimum. 7 qualifying days complete a level.
 * Doc: apps/documentation/docs/backend/engagement/watch-tracking-and-streaks.md §3.
 */
@Injectable()
export class StreakService {
  constructor(
    private readonly streaks: StreakRepository,
    private readonly views: ViewRepository,
    private readonly rules: RewardRuleRepository,
    private readonly ledger: LedgerRepository,
    private readonly db: DBService,
  ) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private yesterday(): string {
    return new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
  }

  private async config(): Promise<{ cfg: StreakRuleConfig; levels: StreakLevel[] }> {
    const rule = await this.rules.getByKey('daily_streak');
    const cfg = (rule?.config ?? {}) as StreakRuleConfig;
    return { cfg, levels: resolveLevels(cfg) };
  }

  /** Resolve a 'YYYY-MM' (defaulting to the current month) to [start, end) date bounds. */
  private monthBounds(month?: string): { month: string; start: string; end: string } {
    const ym = month && /^\d{4}-\d{2}$/.test(month) ? month : this.today().slice(0, 7);
    const [y, m] = ym.split('-').map(Number) as [number, number];
    const start = `${ym}-01`;
    const nextY = m === 12 ? y + 1 : y;
    const nextM = m === 12 ? 1 : m + 1;
    const end = `${nextY}-${String(nextM).padStart(2, '0')}-01`;
    return { month: ym, start, end };
  }

  /** Level/progress as the user sees it — a broken streak shows 0 progress. */
  private effective(state: StreakState | null): StreakState {
    const s = state ?? EMPTY_STATE;
    if (isStreakAlive(s, this.today(), this.yesterday())) return s;
    return { ...s, currentStreak: 0, levelProgressDays: 0 };
  }

  private todayView(levels: StreakLevel[], state: StreakState, watchSeconds: number): StreakTodayView {
    const today = this.today();
    const qualified = state.lastQualifiedDate === today;
    const required = levelFor(levels, state.currentLevel).minWatchSeconds;
    return {
      date: today,
      watchSeconds,
      requiredSeconds: required,
      remainingSeconds: qualified ? 0 : Math.max(0, required - watchSeconds),
      qualified,
    };
  }

  async getStatus(userId: string, month?: string) {
    const bounds = this.monthBounds(month);
    const [state, { cfg, levels }, history, calendar, watchSeconds, badgeRows] = await Promise.all([
      this.streaks.get(userId),
      this.config(),
      this.streaks.qualifiedDaysInRange(userId, bounds.start, bounds.end),
      this.streaks.calendar(userId, bounds.start, bounds.end),
      this.views.todayWatchSeconds(userId),
      this.streaks.streakBadges(userId),
    ]);
    const s = this.effective(state);
    const lvl = levelFor(levels, s.currentLevel);
    const next = levels.find((l) => l.level === lvl.level + 1) ?? null;
    return {
      currentStreak: s.currentStreak,
      longestStreak: s.longestStreak,
      totalQualifiedDays: s.totalQualifiedDays,
      activeDays: s.totalQualifiedDays,
      lastQualifiedDate: s.lastQualifiedDate,
      qualifiedToday: s.lastQualifiedDate === this.today(),
      milestones: cfg.bonus_thresholds ?? {},
      level: {
        current: lvl.level,
        minWatchSeconds: lvl.minWatchSeconds,
        days: lvl.days,
        progressDays: s.levelProgressDays,
        remainingDays: Math.max(0, lvl.days - s.levelProgressDays),
        next: next ? { level: next.level, minWatchSeconds: next.minWatchSeconds } : null,
      },
      levels: levels.map((l) => ({
        level: l.level,
        minWatchSeconds: l.minWatchSeconds,
        days: l.days,
        pointsPerDay: l.pointsPerDay,
        completionBonus: l.completionBonus,
        status: l.level === lvl.level ? 'current' : l.level < lvl.level ? 'completed' : 'locked',
      })),
      today: this.todayView(levels, s, watchSeconds),
      month: bounds.month,
      history,
      calendar,
      badges: badgeRows.map((b) => {
        const metric = b.triggerKey === 'streak_level_completed' ? s.levelsCompleted : s.currentStreak;
        const target = Number(b.threshold);
        // For the level badge currently being played, show day progress within that level.
        const inLevel = b.triggerKey === 'streak_level_completed' && target === s.levelsCompleted + 1;
        const current = b.earnedAt ? target : inLevel ? s.levelProgressDays : Math.min(metric, target);
        const of = inLevel ? lvl.days : target;
        return {
          id: b.id,
          name: b.name,
          description: b.description,
          earned: b.earnedAt !== null,
          earnedAt: b.earnedAt,
          progress: {
            current: b.earnedAt ? of : current,
            target: of,
            percent: b.earnedAt ? 100 : of > 0 ? Math.round((current / of) * 100) : 0,
          },
        };
      }),
    };
  }

  async activity(userId: string, page: number, limit: number) {
    const { items, total } = await this.streaks.activity(userId, page, limit);
    return {
      items: items.map(({ day, ...rest }) => ({ date: day, ...rest })),
      pagination: { pageNo: page, pageSize: limit, totalCount: total, totalPages: Math.max(1, Math.ceil(total / limit)) },
    };
  }

  /**
   * Qualify today if the watch requirement is met — called on every credited heartbeat (via the
   * WatchProgress event) and by `POST /check-in`. Idempotent: one qualification per user per day.
   */
  async evaluate(userId: string, knownWatchSeconds?: number): Promise<StreakEvaluation> {
    const today = this.today();
    const yesterday = this.yesterday();
    const [{ cfg, levels }, watchSeconds] = await Promise.all([
      this.config(),
      knownWatchSeconds !== undefined ? Promise.resolve(knownWatchSeconds) : this.views.todayWatchSeconds(userId),
    ]);
    const current = await this.streaks.get(userId);
    const base = (s: StreakState, extra: Partial<StreakEvaluation> = {}): StreakEvaluation => ({
      qualified: s.lastQualifiedDate === today,
      alreadyQualified: s.lastQualifiedDate === today,
      currentStreak: this.effective(s).currentStreak,
      level: s.currentLevel,
      awardedPoints: 0,
      awardedXp: 0,
      milestoneBonus: 0,
      levelCompleted: false,
      completionBonus: 0,
      today: this.todayView(levels, this.effective(s), watchSeconds),
      ...extra,
    });

    // Fast path: nothing to do (already qualified, or not enough watch time yet).
    const pre = current ?? EMPTY_STATE;
    if (!planQualification(pre, levels, watchSeconds, today, yesterday)) {
      return base(pre);
    }

    return this.db.transaction(async (tx) => {
      const locked = await this.streaks.lock(userId, tx);
      const plan = planQualification(locked, levels, watchSeconds, today, yesterday);
      if (!plan) return base(locked);

      const points = plan.level.pointsPerDay;
      const xp = plan.level.xpPerDay;
      const milestoneBonus = cfg.bonus_thresholds?.[String(plan.streakDay)] ?? 0;
      const completionBonus = plan.levelCompleted ? plan.level.completionBonus : 0;

      const inserted = await this.streaks.insertDay(
        userId,
        {
          day: today,
          level: plan.level.level,
          watchSeconds,
          requiredSeconds: plan.level.minWatchSeconds,
          streakDay: plan.streakDay,
          pointsAwarded: points + milestoneBonus + completionBonus,
          levelCompleted: plan.levelCompleted,
          completionBonus,
        },
        tx,
      );
      if (!inserted) return base(locked);
      await this.streaks.save(userId, plan.next, tx);

      const key = `streak:${userId}:${today}`;
      const credit = (amount: number, currency: 'points' | 'xp', suffix: string, note: string) =>
        amount > 0
          ? this.ledger.append(
              { userId, currency, amount, direction: 'earn', sourceKind: 'earned', sourceType: 'daily_streak', idempotencyKey: `${key}:${suffix}`, note },
              tx,
            )
          : Promise.resolve();
      await credit(points, 'points', 'points', `Daily streak — Level ${plan.level.level}`);
      await credit(xp, 'xp', 'xp', `Daily streak — Level ${plan.level.level}`);
      await credit(milestoneBonus, 'points', 'milestone', `${plan.streakDay}-day streak bonus`);
      await credit(completionBonus, 'points', 'level', `Level ${plan.level.level} complete`);

      // Badge engine (user_metrics trigger awards matching badges inside this transaction).
      await this.streaks.setMetric(userId, 'watch_streak_days', plan.next.currentStreak, tx);
      await this.streaks.setMetric(userId, 'streak_level_completed', plan.next.levelsCompleted, tx);

      return base(plan.next, {
        qualified: true,
        alreadyQualified: false,
        currentStreak: plan.next.currentStreak,
        level: plan.level.level,
        awardedPoints: points,
        awardedXp: xp,
        milestoneBonus,
        levelCompleted: plan.levelCompleted,
        completionBonus,
      });
    });
  }

  /** `POST /check-in` — kept for app compatibility; now evaluates today's watch time. */
  async checkIn(userId: string) {
    const r = await this.evaluate(userId);
    return { ...r, alreadyCheckedIn: r.alreadyQualified };
  }
}
