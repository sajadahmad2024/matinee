// Phase 1 only (spec-12 §4.1): an in-memory stand-in for the Game Management endpoints. Request and
// response shapes, status rules and error messages follow `apps/backend/src/games/**` and
// `tokenomics/rules/**`, so the screens behave as they will against the API.
// Seeded with the rows the screens showed before the refactor. Deleted in Phase 3 together with
// `use-games.ts`.
import { ApiError } from "@/app/_libs/api/api-error";
import { MACRO_REGIONS } from "@/app/_libs/regions";

import {
  type DailyStreakRuleConfig,
  GAME_RULE_KEYS,
  type GameLeaderboardPlayer,
  type GamePage,
  type GameRegion,
  type GameRuleKey,
  type GameTypesSummaryDto,
  type ProposedFormatAnalyticsDto,
  type ProposedGameWidgetDto,
  type ProposedGamesOverviewDto,
  type ProposedGamesRegionalActivityDto,
  type ProposedGamesTrendsDto,
  type ProposedLeaderboardInstanceDto,
  type QuestRuleConfig,
  type RegionValues,
  type RewardRuleDto,
  type SharedContentRuleConfig,
  type UpdateRewardRuleDto,
} from "./game-types";

const LATENCY_MS = 250;

const sleep = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS));
/** Callers get copies, so the query cache never shares objects with the store. */
const copy = <T>(value: T): T => structuredClone(value);

const notFound = (what: string) =>
  new ApiError({ statusCode: 404, message: `${what} not found`, error: "Not Found" });

const nowIso = () => new Date().toISOString();

function paginate<T>(rows: T[], page = 1, limit = 20): GamePage<T> {
  const start = (page - 1) * limit;
  return {
    items: rows.slice(start, start + limit),
    pagination: {
      pageNo: page,
      pageSize: limit,
      totalCount: rows.length,
      totalPages: Math.max(1, Math.ceil(rows.length / limit)),
    },
  };
}

// ─── Reward rules ────────────────────────────────────────────────────────────

const dailyStreakConfig: DailyStreakRuleConfig = {
  min_watch_seconds: 300,
  behaviours: [
    { key: "b1", label: "Watch 5+ min today", points: 10 },
    { key: "b2", label: "Complete 3 videos", points: 15 },
    { key: "b3", label: "Engagement actions (like / comment / share)", points: 5 },
    { key: "b4", label: "Daily app-open", points: 10 },
    { key: "b5", label: "Finish a series / playlist", points: 20 },
  ],
  bonus_by_run_length: { "7": 50, "30": 300 },
  eligibility_notification: true,
  progress_display: "popup",
};

const sharedContentConfig: SharedContentRuleConfig = {
  daily_share_cap: 3,
  dedupe_window_hours: 24,
  behaviours: [
    { key: "internal_share", label: "Internal share (to another user)", points: 3 },
    { key: "external_share", label: "External share (off-app)", points: 15 },
    { key: "referral_first_game", label: "Referral completed first game", points: 100 },
  ],
};

const questConfig: QuestRuleConfig = {
  require_all_default: true,
  default_window_weeks: 1,
  default_points: 100,
};

const seedRule = (ruleKey: GameRuleKey, name: string, config: object): RewardRuleDto => ({
  id: `rule-${ruleKey}`,
  ruleKey,
  name,
  description: null,
  isEnabled: true,
  config: { ...config },
  version: 1,
  updatedAt: "2026-09-01T12:00:00.000Z",
  pendingVersion: null,
  pendingEffectiveFrom: null,
});

const rules: RewardRuleDto[] = [
  seedRule(GAME_RULE_KEYS.dailyStreak, "Daily Streak", dailyStreakConfig),
  seedRule(GAME_RULE_KEYS.sharedContent, "Shared Content", sharedContentConfig),
  seedRule(GAME_RULE_KEYS.quest, "Weekly Quests", questConfig),
];

const findRule = (ruleKey: string) => {
  const rule = rules.find((r) => r.ruleKey === ruleKey);
  if (!rule) throw notFound("Reward rule");
  return rule;
};

// ─── Widgets (proposed) ──────────────────────────────────────────────────────

const seedWidget = (gameKey: GameRuleKey, ctaLabel: string): ProposedGameWidgetDto => ({
  gameKey,
  bannerUrl: null,
  ctaLabel,
  style: "card",
  accent: "#7c3aed",
  visible: true,
});

const widgets: ProposedGameWidgetDto[] = [
  seedWidget(GAME_RULE_KEYS.dailyStreak, "Keep your streak"),
  seedWidget(GAME_RULE_KEYS.sharedContent, "Share & earn"),
];

const findWidget = (gameKey: GameRuleKey) => {
  const widget = widgets.find((w) => w.gameKey === gameKey);
  if (!widget) throw notFound("Widget");
  return widget;
};

// ─── Leaderboards ────────────────────────────────────────────────────────────

type LeaderboardPlayer = GameLeaderboardPlayer;

const player = (
  rank: number,
  username: string,
  totalWins: number,
  pointsBalance: number,
  gamesPlayed: number,
): LeaderboardPlayer => ({
  rank,
  userId: `USR_${String(rank).padStart(3, "0")}`,
  username,
  firstName: null,
  avatarUrl: null,
  pointsBalance,
  rankDelta: null,
  totalWins,
  gamesPlayed,
});

const leaderboardPlayers: LeaderboardPlayer[] = [
  player(1, "GameMaster_Pro", 156, 28000, 342),
  player(2, "QuizChampion", 143, 25900, 298),
  player(3, "StreakKing", 128, 23800, 276),
  player(4, "MovieBuff2024", 115, 21800, 254),
  player(5, "PredictorElite", 102, 19900, 231),
  player(6, "TrailerHunter", 98, 18400, 218),
  player(7, "CinemaGuru", 89, 16900, 195),
  player(8, "SpeedWatcher", 82, 15500, 187),
];

const leaderboardInstances: ProposedLeaderboardInstanceDto[] = [
  {
    id: "1",
    gameName: "Avengers Prediction",
    videoTitle: "Avengers: Endgame Trailer",
    format: "Predict",
    createdAt: "2024-01-15",
    totalPlayers: 4523,
    health: "healthy",
    trend: 8,
    topConcentration: 12,
  },
  {
    id: "2",
    gameName: "Batman Streak Challenge",
    videoTitle: "The Batman Returns",
    format: "Streak",
    createdAt: "2024-01-14",
    totalPlayers: 3245,
    health: "at-risk",
    trend: -3,
    topConcentration: 28,
  },
  {
    id: "3",
    gameName: "Marvel Watch Streak",
    videoTitle: "Marvel Phase 5 Recap",
    format: "Streak",
    createdAt: "2024-01-12",
    totalPlayers: 2890,
    health: "healthy",
    trend: 2,
    topConcentration: 15,
  },
  {
    id: "4",
    gameName: "Dune Prediction",
    videoTitle: "Dune: Part Two Preview",
    format: "Predict",
    createdAt: "2024-01-10",
    totalPlayers: 1987,
    health: "at-risk",
    trend: -6,
    topConcentration: 22,
  },
  {
    id: "5",
    gameName: "Weekly Watch Contest",
    videoTitle: "Best of 2024",
    format: "Contest",
    createdAt: "2024-01-08",
    totalPlayers: 5672,
    health: "stagnant",
    trend: 1,
    topConcentration: 61,
  },
];

// ─── Region scaling (mock-only) ──────────────────────────────────────────────
// Every regional figure is a deterministic share of the global one (APAC largest, MEA smallest —
// mirrors the dashboard's regional table). The API returns real per-region numbers instead.

const REGION_FACTOR: Record<GameRegion, number> = {
  all: 1,
  APAC: 0.42,
  NA: 0.24,
  EU: 0.18,
  LATAM: 0.1,
  MEA: 0.06,
};

// Small per-region offset (percentage points) so rates vary plausibly, not just counts.
const REGION_RATE_DELTA: Record<GameRegion, number> = {
  all: 0,
  APAC: 3,
  NA: 1,
  EU: -1,
  LATAM: -2,
  MEA: -4,
};

const scaleCount = (base: number, region: GameRegion) => Math.round(base * REGION_FACTOR[region]);

const shiftRate = (base: number, region: GameRegion) =>
  Math.min(100, Math.max(0, base + REGION_RATE_DELTA[region]));

/** The global figure under `all`, each macro-region's share under its code. */
const byRegion = (base: number): RegionValues => ({
  all: base,
  ...(Object.fromEntries(MACRO_REGIONS.map((r) => [r.code, scaleCount(base, r.code)])) as Omit<
    RegionValues,
    "all"
  >),
});

// ─── Master page analytics ───────────────────────────────────────────────────

const OVERVIEW = {
  activePlayers: 24400,
  activePlayersTrendPct: 6.1,
  activePlayersSeries: [18.2, 19.4, 20.1, 21.8, 22.6, 23.5, 24.4],
  participationPct: 68,
  pointsMinted: 890000,
  pointsSpent: 512000,
  completionPct: 78,
  completionTrendPct: 2.3,
  formats: {
    [GAME_RULE_KEYS.dailyStreak]: { participants: 12800, activeCount: 1, plays: 128500 },
    [GAME_RULE_KEYS.quest]: { participants: 8400, activeCount: 5, plays: 45600 },
    [GAME_RULE_KEYS.sharedContent]: { participants: 5200, activeCount: 1, plays: 23400 },
    [GAME_RULE_KEYS.prediction]: { participants: 6100, activeCount: 5, plays: 89200 },
  },
};

const TRENDS: ProposedGamesTrendsDto = {
  velocity: [
    { day: "Mon", started: 2400, completed: 1800 },
    { day: "Tue", started: 3200, completed: 2600 },
    { day: "Wed", started: 2800, completed: 2100 },
    { day: "Thu", started: 3600, completed: 2900 },
    { day: "Fri", started: 4200, completed: 3400 },
    { day: "Sat", started: 5100, completed: 4200 },
    { day: "Sun", started: 4800, completed: 3900 },
  ],
  winLoss: [
    { format: "Streak", wins: 72, losses: 28 },
    { format: "Quests", wins: 68, losses: 32 },
    { format: "Predict", wins: 45, losses: 55 },
  ],
  topGames: [
    { title: "Avengers Prediction", plays: 12500, participationPct: 78 },
    { title: "Batman Challenge", plays: 9800, participationPct: 72 },
    { title: "Dune Streak", plays: 8400, participationPct: 69 },
    { title: "Oppenheimer Quiz", plays: 7200, participationPct: 65 },
    { title: "Barbie Contest", plays: 6800, participationPct: 61 },
  ],
  pointsMinted: 890000,
  pointsSpent: 512000,
};

const FORMAT_ANALYTICS = {
  totalPlays: 128500,
  uniquePlayers: 45200,
  pointsMinted: 2400000,
  completionRatePct: 78.4,
  daily: [
    { date: "Jan 15", plays: 2400, completions: 1800, unique: 1200 },
    { date: "Jan 16", plays: 3200, completions: 2600, unique: 1600 },
    { date: "Jan 17", plays: 2800, completions: 2100, unique: 1400 },
    { date: "Jan 18", plays: 3600, completions: 2900, unique: 1900 },
    { date: "Jan 19", plays: 4200, completions: 3400, unique: 2200 },
    { date: "Jan 20", plays: 5100, completions: 4200, unique: 2800 },
    { date: "Jan 21", plays: 4800, completions: 3900, unique: 2500 },
  ],
  retention: [
    { day: "Day 1", ratePct: 100 },
    { day: "Day 3", ratePct: 72 },
    { day: "Day 7", ratePct: 58 },
    { day: "Day 14", ratePct: 42 },
    { day: "Day 30", ratePct: 28 },
  ],
  rewardTiers: [
    { tier: "1st Place", count: 245 },
    { tier: "2nd Place", count: 245 },
    { tier: "3rd Place", count: 245 },
    { tier: "Top 10", count: 1715 },
    { tier: "Participation", count: 8540 },
  ],
  peakHours: [
    { hour: "6am", plays: 120 },
    { hour: "9am", plays: 450 },
    { hour: "12pm", plays: 780 },
    { hour: "3pm", plays: 920 },
    { hour: "6pm", plays: 1400 },
    { hour: "9pm", plays: 1850 },
    { hour: "12am", plays: 680 },
  ],
  summary: { avgSessionSeconds: 272, avgPointsPerGame: 45, winRatePct: 68, repeatPlayersPct: 72 },
};

// ─── API ─────────────────────────────────────────────────────────────────────

export interface GameListParams<S extends string> {
  page?: number;
  limit?: number;
  status?: S;
}

export const gameMockApi = {
  // Master page analytics (proposed) ────────────────────────────────────────
  // Window (`timeRange`) scoping is not modelled: every range returns the same figures.

  /** Master tiles + per-format row stats for a region. */
  async overview(region: GameRegion): Promise<ProposedGamesOverviewDto> {
    await sleep();
    const factor = REGION_FACTOR[region];
    const formats = Object.fromEntries(
      Object.entries(OVERVIEW.formats).map(([key, f]) => [
        key,
        {
          participants: scaleCount(f.participants, region),
          // instance config is global — only activity is regional
          activeCount: f.activeCount,
          plays: scaleCount(f.plays, region),
        },
      ]),
    ) as ProposedGamesOverviewDto["formats"];
    return {
      activePlayers: scaleCount(OVERVIEW.activePlayers, region),
      activePlayersTrendPct: OVERVIEW.activePlayersTrendPct,
      activePlayersSeries: OVERVIEW.activePlayersSeries.map((v) => v * factor),
      participationPct: shiftRate(OVERVIEW.participationPct, region),
      pointsMinted: scaleCount(OVERVIEW.pointsMinted, region),
      pointsSpent: scaleCount(OVERVIEW.pointsSpent, region),
      completionPct: shiftRate(OVERVIEW.completionPct, region),
      completionTrendPct: OVERVIEW.completionTrendPct,
      formats,
    };
  },

  /** The regional heat grid: playing now, active players and points minted per region. */
  async regionalActivity(): Promise<ProposedGamesRegionalActivityDto> {
    await sleep();
    return {
      playingNow: byRegion(3847),
      activePlayers: byRegion(OVERVIEW.activePlayers),
      pointsMinted: byRegion(OVERVIEW.pointsMinted),
    };
  },

  /** Trends & Economy across all formats. */
  async trends(): Promise<ProposedGamesTrendsDto> {
    await sleep();
    return copy(TRENDS);
  },

  /**
   * A format's Analytics tab. Every format returns the same mock figures (only `activeGames`
   * differs); the region scales them like the master page.
   */
  async formatAnalytics(
    ruleKey: GameRuleKey,
    region: GameRegion,
  ): Promise<ProposedFormatAnalyticsDto> {
    await sleep();
    const a = FORMAT_ANALYTICS;
    return {
      totalPlays: scaleCount(a.totalPlays, region),
      uniquePlayers: scaleCount(a.uniquePlayers, region),
      pointsMinted: scaleCount(a.pointsMinted, region),
      completionRatePct: shiftRate(a.completionRatePct, region),
      regional: {
        uniquePlayers: byRegion(a.uniquePlayers),
        totalPlays: byRegion(a.totalPlays),
        pointsMinted: byRegion(a.pointsMinted),
      },
      daily: a.daily.map((d) => ({
        date: d.date,
        plays: scaleCount(d.plays, region),
        completions: scaleCount(d.completions, region),
        unique: scaleCount(d.unique, region),
      })),
      // Day 1 is always 100%; later cohorts drift by region.
      retention: a.retention.map((d, i) => ({
        day: d.day,
        ratePct: i === 0 ? d.ratePct : shiftRate(d.ratePct, region),
      })),
      rewardTiers: a.rewardTiers.map((t) => ({ tier: t.tier, count: scaleCount(t.count, region) })),
      peakHours: a.peakHours.map((h) => ({ hour: h.hour, plays: scaleCount(h.plays, region) })),
      summary: {
        avgSessionSeconds: a.summary.avgSessionSeconds,
        avgPointsPerGame: a.summary.avgPointsPerGame,
        winRatePct: shiftRate(a.summary.winRatePct, region),
        repeatPlayersPct: shiftRate(a.summary.repeatPlayersPct, region),
        // instance config is global — not regional
        activeGames: OVERVIEW.formats[ruleKey].activeCount,
      },
    };
  },

  // Formats library ─────────────────────────────────────────────────────────

  /** `GET /admin/games/types`. */
  async typesSummary(): Promise<GameTypesSummaryDto> {
    await sleep();
    return {
      // quests and predictions are on the API now (spec-12 §10.2, §10.10); these stay until the master page moves too
      quest_total: 5,
      quest_active: 1,
      prediction_total: 3,
      prediction_active: 1,
      auction_total: 0,
      auction_active: 0,
      daily_streak_total: 1,
      shared_content_total: 1,
    };
  },

  // Reward rules ────────────────────────────────────────────────────────────

  /** `GET /admin/rewards/rules/:ruleKey`. */
  async getRule(ruleKey: GameRuleKey): Promise<RewardRuleDto> {
    await sleep();
    return copy(findRule(ruleKey));
  },

  /** `PATCH /admin/rewards/rules/:ruleKey` — saves a new version (immediate unless `effectiveFrom`). */
  async updateRule(ruleKey: GameRuleKey, dto: UpdateRewardRuleDto): Promise<RewardRuleDto> {
    await sleep();
    const rule = findRule(ruleKey);
    Object.assign(rule, {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.isEnabled !== undefined ? { isEnabled: dto.isEnabled } : {}),
      ...(dto.config ? { config: { ...rule.config, ...dto.config } } : {}),
      version: rule.version + 1,
      updatedAt: nowIso(),
    });
    return copy(rule);
  },

  // Widgets (proposed) ──────────────────────────────────────────────────────

  async getWidget(gameKey: GameRuleKey): Promise<ProposedGameWidgetDto> {
    await sleep();
    return copy(findWidget(gameKey));
  },

  async updateWidget(
    gameKey: GameRuleKey,
    patch: Partial<Omit<ProposedGameWidgetDto, "gameKey">>,
  ): Promise<ProposedGameWidgetDto> {
    await sleep();
    const widget = findWidget(gameKey);
    Object.assign(widget, patch);
    return copy(widget);
  },

  // Leaderboards ────────────────────────────────────────────────────────────

  /** `GET /admin/leaderboard` (+ the proposed per-player stats). */
  async leaderboardPlayers(
    params: { page?: number; limit?: number } = {},
  ): Promise<GamePage<LeaderboardPlayer>> {
    await sleep();
    return copy(paginate(leaderboardPlayers, params.page, params.limit));
  },

  /** Proposed `GET /admin/games/leaderboard/instances?format=`. */
  async leaderboardInstances(
    format?: ProposedLeaderboardInstanceDto["format"],
  ): Promise<ProposedLeaderboardInstanceDto[]> {
    await sleep();
    return copy(
      format ? leaderboardInstances.filter((i) => i.format === format) : leaderboardInstances,
    );
  },
};
