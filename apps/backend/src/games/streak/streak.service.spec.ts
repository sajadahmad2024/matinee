import { DBService } from '@db/db.service';
import { ViewRepository } from '@db/repositories/engagement/view.repository';
import { StreakRepository, StreakState } from '@db/repositories/games/streak.repository';
import { LedgerRepository } from '@db/repositories/tokenomics/ledger.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import { StreakService } from './streak.service';

const today = () => new Date().toISOString().slice(0, 10);
const yesterday = () => new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);

function build(initial: StreakState | null, watch: number, bonus: Record<string, number> = {}) {
  const streaks = {
    get: jest.fn().mockResolvedValue(initial),
    lock: jest.fn().mockResolvedValue(initial ?? {
      currentStreak: 0, longestStreak: 0, totalQualifiedDays: 0, lastQualifiedDate: null,
      currentLevel: 1, levelProgressDays: 0, levelsCompleted: 0,
    }),
    insertDay: jest.fn().mockResolvedValue(true),
    save: jest.fn().mockResolvedValue(undefined),
    setMetric: jest.fn().mockResolvedValue(undefined),
  };
  const views = { todayWatchSeconds: jest.fn().mockResolvedValue(watch) };
  const rules = { getByKey: jest.fn().mockResolvedValue({ config: { bonus_thresholds: bonus } }) };
  const ledger = { append: jest.fn().mockResolvedValue({}) };
  const db = { transaction: jest.fn((fn: (tx: unknown) => unknown) => fn('tx')) };
  const svc = new StreakService(
    streaks as unknown as StreakRepository,
    views as unknown as ViewRepository,
    rules as unknown as RewardRuleRepository,
    ledger as unknown as LedgerRepository,
    db as unknown as DBService,
  );
  return { svc, streaks, ledger, db };
}

describe('StreakService.evaluate', () => {
  it('below requirement: no transaction, shows remaining', async () => {
    const { svc, db } = build(null, 600);
    const r = await svc.evaluate('u1');
    expect(r.qualified).toBe(false);
    expect(r.today).toMatchObject({ watchSeconds: 600, requiredSeconds: 1800, remainingSeconds: 1200 });
    expect(db.transaction).not.toHaveBeenCalled();
  });

  it('qualifies, credits day points/xp idempotently and updates badge metrics', async () => {
    const { svc, streaks, ledger } = build(null, 1900);
    const r = await svc.evaluate('u1');
    expect(r).toMatchObject({ qualified: true, alreadyQualified: false, currentStreak: 1, awardedPoints: 40, awardedXp: 5 });
    expect(streaks.insertDay).toHaveBeenCalledWith('u1', expect.objectContaining({ day: today(), level: 1, streakDay: 1 }), 'tx');
    expect(ledger.append).toHaveBeenCalledWith(expect.objectContaining({ amount: 40, idempotencyKey: `streak:u1:${today()}:points` }), 'tx');
    expect(streaks.setMetric).toHaveBeenCalledWith('u1', 'watch_streak_days', 1, 'tx');
  });

  it('completing a level pays the completion bonus and milestone', async () => {
    const s: StreakState = {
      currentStreak: 6, longestStreak: 6, totalQualifiedDays: 6, lastQualifiedDate: yesterday(),
      currentLevel: 1, levelProgressDays: 6, levelsCompleted: 0,
    };
    const { svc, ledger, streaks } = build(s, 1800, { '7': 50 });
    const r = await svc.evaluate('u1');
    expect(r).toMatchObject({ levelCompleted: true, completionBonus: 500, milestoneBonus: 50, currentStreak: 7 });
    expect(ledger.append).toHaveBeenCalledWith(expect.objectContaining({ amount: 500, idempotencyKey: `streak:u1:${today()}:level` }), 'tx');
    expect(streaks.setMetric).toHaveBeenCalledWith('u1', 'streak_level_completed', 1, 'tx');
  });

  it('already qualified today: no-op', async () => {
    const s: StreakState = {
      currentStreak: 3, longestStreak: 3, totalQualifiedDays: 3, lastQualifiedDate: today(),
      currentLevel: 1, levelProgressDays: 3, levelsCompleted: 0,
    };
    const { svc, ledger } = build(s, 9999);
    const r = await svc.checkIn('u1');
    expect(r).toMatchObject({ qualified: true, alreadyCheckedIn: true, awardedPoints: 0 });
    expect(ledger.append).not.toHaveBeenCalled();
  });

  it('lost race (day already inserted) awards nothing', async () => {
    const { svc, streaks, ledger } = build(null, 1900);
    streaks.insertDay.mockResolvedValueOnce(false);
    await svc.evaluate('u1');
    expect(ledger.append).not.toHaveBeenCalled();
    expect(streaks.save).not.toHaveBeenCalled();
  });
});
