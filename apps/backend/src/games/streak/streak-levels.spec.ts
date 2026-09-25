import { StreakState } from '@db/repositories/games/streak.repository';
import { DEFAULT_STREAK_LEVELS, isStreakAlive, planQualification, resolveLevels } from './streak-levels';

const T = '2026-09-25';
const Y = '2026-09-24';
const state = (over: Partial<StreakState> = {}): StreakState => ({
  currentStreak: 0, longestStreak: 0, totalQualifiedDays: 0, lastQualifiedDate: null,
  currentLevel: 1, levelProgressDays: 0, levelsCompleted: 0, ...over,
});

describe('resolveLevels', () => {
  it('falls back to Figma defaults', () => {
    expect(resolveLevels({})).toEqual(DEFAULT_STREAK_LEVELS);
    expect(resolveLevels({ levels: [] }).map((l) => l.minWatchSeconds)).toEqual([1800, 2700, 3600, 5400]);
  });
  it('parses snake_case config, drops invalid, renumbers by order', () => {
    const levels = resolveLevels({
      levels: [
        { level: 2, min_watch_seconds: 600, days: 3, points_per_day: 20 },
        { level: 1, min_watch_seconds: 300, days: 2, points_per_day: 10, completion_bonus: 50 },
        { level: 3, min_watch_seconds: 'bad' },
      ],
    });
    expect(levels).toEqual([
      { level: 1, minWatchSeconds: 300, days: 2, pointsPerDay: 10, xpPerDay: 0, completionBonus: 50 },
      { level: 2, minWatchSeconds: 600, days: 3, pointsPerDay: 20, xpPerDay: 0, completionBonus: 0 },
    ]);
  });
});

describe('planQualification', () => {
  const levels = DEFAULT_STREAK_LEVELS;
  it('not enough watch time → null', () => {
    expect(planQualification(state(), levels, 1799, T, Y)).toBeNull();
  });
  it('already qualified today → null', () => {
    expect(planQualification(state({ lastQualifiedDate: T }), levels, 9999, T, Y)).toBeNull();
  });
  it('first day starts a streak', () => {
    const p = planQualification(state(), levels, 1800, T, Y)!;
    expect(p.next).toMatchObject({ currentStreak: 1, levelProgressDays: 1, lastQualifiedDate: T, totalQualifiedDays: 1 });
    expect(p.levelCompleted).toBe(false);
  });
  it('7th consecutive day completes the level and moves up', () => {
    const p = planQualification(state({ currentStreak: 6, longestStreak: 6, lastQualifiedDate: Y, levelProgressDays: 6 }), levels, 1800, T, Y)!;
    expect(p.levelCompleted).toBe(true);
    expect(p.next).toMatchObject({ currentStreak: 7, currentLevel: 2, levelProgressDays: 0, levelsCompleted: 1 });
  });
  it('level 2 needs 45 min', () => {
    expect(planQualification(state({ currentLevel: 2 }), levels, 2000, T, Y)).toBeNull();
  });
  it('missed day restarts streak and level progress but keeps the level', () => {
    const p = planQualification(
      state({ currentStreak: 10, longestStreak: 10, lastQualifiedDate: '2026-09-20', currentLevel: 2, levelProgressDays: 3 }),
      levels, 2700, T, Y,
    )!;
    expect(p.next).toMatchObject({ currentStreak: 1, longestStreak: 10, currentLevel: 2, levelProgressDays: 1 });
  });
  it('top level stays top after completing', () => {
    const p = planQualification(state({ currentLevel: 4, lastQualifiedDate: Y, currentStreak: 30, levelProgressDays: 6, levelsCompleted: 4 }), levels, 5400, T, Y)!;
    expect(p.next).toMatchObject({ currentLevel: 4, levelsCompleted: 5, levelProgressDays: 0 });
  });
  it('isStreakAlive', () => {
    expect(isStreakAlive(state({ lastQualifiedDate: Y }), T, Y)).toBe(true);
    expect(isStreakAlive(state({ lastQualifiedDate: '2026-09-01' }), T, Y)).toBe(false);
    expect(isStreakAlive(null, T, Y)).toBe(false);
  });
});
