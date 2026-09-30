import { StreakState } from '@db/repositories/games/streak.repository';

/** One level of the watch-based daily streak (Figma "Level Track"). */
export interface StreakLevel {
  level: number;
  minWatchSeconds: number;
  days: number;
  pointsPerDay: number;
  xpPerDay: number;
  completionBonus: number;
}

/** Defaults when `reward_rules['daily_streak'].config.levels` is absent (Figma: 30/45/60/90 min). */
export const DEFAULT_STREAK_LEVELS: StreakLevel[] = [
  { level: 1, minWatchSeconds: 1800, days: 7, pointsPerDay: 40, xpPerDay: 5, completionBonus: 500 },
  { level: 2, minWatchSeconds: 2700, days: 7, pointsPerDay: 100, xpPerDay: 8, completionBonus: 500 },
  { level: 3, minWatchSeconds: 3600, days: 7, pointsPerDay: 150, xpPerDay: 10, completionBonus: 500 },
  { level: 4, minWatchSeconds: 5400, days: 7, pointsPerDay: 200, xpPerDay: 12, completionBonus: 1000 },
];

export interface StreakRuleConfig {
  levels?: unknown;
  bonus_thresholds?: Record<string, number>;
}

const posInt = (v: unknown, fallback: number, min = 0): number => {
  const n = typeof v === 'number' ? v : Number(v);
  return Number.isFinite(n) && n >= min ? Math.floor(n) : fallback;
};

/**
 * Parse admin-configured levels (snake_case JSON). Invalid entries are dropped; an empty or
 * missing list falls back to the defaults. Levels are renumbered 1..n in requirement order.
 */
export function resolveLevels(cfg: StreakRuleConfig | null | undefined): StreakLevel[] {
  const raw = Array.isArray(cfg?.levels) ? (cfg!.levels as Array<Record<string, unknown>>) : [];
  const parsed = raw
    .filter((l) => l && typeof l === 'object' && posInt(l['min_watch_seconds'], -1, 1) > 0)
    .map((l, i) => ({
      level: posInt(l['level'], i + 1, 1),
      minWatchSeconds: posInt(l['min_watch_seconds'], 1800, 1),
      days: posInt(l['days'], 7, 1),
      pointsPerDay: posInt(l['points_per_day'], 0),
      xpPerDay: posInt(l['xp_per_day'], 0),
      completionBonus: posInt(l['completion_bonus'], 0),
    }))
    .sort((a, b) => a.level - b.level);
  const levels = parsed.length > 0 ? parsed : DEFAULT_STREAK_LEVELS;
  return levels.map((l, i) => ({ ...l, level: i + 1 }));
}

export function levelFor(levels: StreakLevel[], level: number): StreakLevel {
  return levels.find((l) => l.level === level) ?? levels[Math.min(Math.max(level, 1), levels.length) - 1]!;
}

export interface QualificationPlan {
  level: StreakLevel;
  next: StreakState;
  streakDay: number;
  levelCompleted: boolean;
}

/**
 * Pure streak transition for a day with `watchSeconds` of credited watch time. Returns null when
 * the day doesn't qualify (already qualified today, or below the current level's requirement).
 * Missed day → streak restarts at 1 and level progress resets; the level is kept.
 */
export function planQualification(
  state: StreakState,
  levels: StreakLevel[],
  watchSeconds: number,
  today: string,
  yesterday: string,
): QualificationPlan | null {
  if (state.lastQualifiedDate === today) return null;
  const level = levelFor(levels, state.currentLevel);
  if (watchSeconds < level.minWatchSeconds) return null;

  const continuing = state.lastQualifiedDate === yesterday;
  const currentStreak = continuing ? state.currentStreak + 1 : 1;
  let progress = (continuing ? state.levelProgressDays : 0) + 1;
  let currentLevel = level.level;
  let levelsCompleted = state.levelsCompleted;
  const levelCompleted = progress >= level.days;
  if (levelCompleted) {
    levelsCompleted += 1;
    currentLevel = Math.min(level.level + 1, levels.length);
    progress = 0;
  }
  return {
    level,
    streakDay: currentStreak,
    levelCompleted,
    next: {
      currentStreak,
      longestStreak: Math.max(state.longestStreak, currentStreak),
      totalQualifiedDays: state.totalQualifiedDays + 1,
      lastQualifiedDate: today,
      currentLevel,
      levelProgressDays: progress,
      levelsCompleted,
    },
  };
}

/** Streak as shown to the user: a streak whose last day is before yesterday is broken (0). */
export function isStreakAlive(state: StreakState | null, today: string, yesterday: string): boolean {
  return !!state && (state.lastQualifiedDate === today || state.lastQualifiedDate === yesterday);
}
