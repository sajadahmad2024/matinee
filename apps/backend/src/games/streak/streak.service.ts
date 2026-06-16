import { Injectable } from '@nestjs/common';
import { StreakRepository } from '@db/repositories/games/streak.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';

interface StreakConfig {
  behaviors?: Array<{ key: string; points?: number; xp?: number }>;
  bonus_thresholds?: Record<string, number>;
}

const DAY_MS = 86_400_000;

@Injectable()
export class StreakService {
  constructor(
    private readonly streaks: StreakRepository,
    private readonly rules: RewardRuleRepository,
    private readonly ledger: LedgerRepository,
  ) {}

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }
  private yesterday(): string {
    return new Date(Date.now() - DAY_MS).toISOString().slice(0, 10);
  }

  private async config(): Promise<StreakConfig> {
    const rule = await this.rules.getByKey('daily_streak');
    return (rule?.config ?? {}) as StreakConfig;
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

  async getStatus(userId: string, month?: string) {
    const bounds = this.monthBounds(month);
    const [state, cfg, history] = await Promise.all([
      this.streaks.get(userId),
      this.config(),
      this.streaks.qualifiedDaysInRange(userId, bounds.start, bounds.end),
    ]);
    const today = this.today();
    return {
      currentStreak: state?.currentStreak ?? 0,
      longestStreak: state?.longestStreak ?? 0,
      totalQualifiedDays: state?.totalQualifiedDays ?? 0,
      lastQualifiedDate: state?.lastQualifiedDate ?? null,
      qualifiedToday: state?.lastQualifiedDate === today,
      milestones: cfg.bonus_thresholds ?? {},
      // Calendar: the days the user qualified within `month` (🔥 markers)
      month: bounds.month,
      history,
    };
  }

  /** Daily check-in — extends or resets the streak, awards the daily reward + any milestone bonus. */
  async checkIn(userId: string) {
    const state = await this.streaks.get(userId);
    const today = this.today();
    if (state?.lastQualifiedDate === today) {
      return { currentStreak: state.currentStreak, alreadyCheckedIn: true, awardedPoints: 0, awardedXp: 0, milestoneBonus: 0 };
    }
    const current = state && state.lastQualifiedDate === this.yesterday() ? state.currentStreak + 1 : 1;
    const longest = Math.max(state?.longestStreak ?? 0, current);
    await this.streaks.checkIn(userId, current, longest, today);

    const cfg = await this.config();
    const daily = cfg.behaviors?.find((b) => b.key === 'daily_open');
    const points = daily?.points ?? 10;
    const xp = daily?.xp ?? 5;
    const base = `streak:${userId}:${today}`;
    if (points > 0) {
      await this.ledger.append({ userId, currency: 'points', amount: points, direction: 'earn', sourceKind: 'earned', sourceType: 'daily_streak', idempotencyKey: `${base}:points`, note: 'Daily streak' });
    }
    if (xp > 0) {
      await this.ledger.append({ userId, currency: 'xp', amount: xp, direction: 'earn', sourceKind: 'earned', sourceType: 'daily_streak', idempotencyKey: `${base}:xp`, note: 'Daily streak' });
    }
    const milestoneBonus = cfg.bonus_thresholds?.[String(current)] ?? 0;
    if (milestoneBonus > 0) {
      await this.ledger.append({ userId, currency: 'points', amount: milestoneBonus, direction: 'earn', sourceKind: 'earned', sourceType: 'daily_streak', idempotencyKey: `streak-bonus:${userId}:${current}`, note: `${current}-day streak bonus` });
    }
    return { currentStreak: current, alreadyCheckedIn: false, awardedPoints: points, awardedXp: xp, milestoneBonus };
  }
}
