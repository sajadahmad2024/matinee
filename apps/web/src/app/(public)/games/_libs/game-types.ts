/**
 * Game Management types, re-exported from the generated SDK. Anything the SDK doesn't type yet is
 * declared here with its backend source; Phase 3 replaces each with the generated type once the
 * backend returns it (spec-12 §2).
 */
import {
  AdminPredictionControllerListV1StatusEnum,
  AdminQuestControllerListV1StatusEnum,
  type LeaderboardRowDto,
  type PredictionDetailDto,
  type PredictionDto,
  type QuestDetailDto,
  type QuestDto,
} from "@/app/_libs/api/generated";
import type { MacroRegion } from "@/app/_libs/regions";

export type {
  BadgeDto,
  BadgeSummaryDto,
  BadgeTriggerDto,
  CreateBadgeDto,
  CreatePredictionDto,
  CreateQuestDto,
  GameTypesSummaryDto,
  LeaderboardRowDto,
  PaginationDetailsDto,
  PredictionOptionDto,
  PredictionResolvePreviewResultDto,
  PredictionResolveResultDto,
  QuestActionDto,
  RewardRuleDto,
  UpdateBadgeDto,
  UpdatePredictionDto,
  UpdateQuestDto,
  UpdateRewardRuleDto,
} from "@/app/_libs/api/generated";
export {
  BadgeDtoAwardedByEnum as BadgeAwardedByEnum,
  BadgeDtoFamilyEnum as BadgeFamilyEnum,
  CreateBadgeDtoOperatorEnum as BadgeOperatorEnum,
  CreatePredictionDtoCadenceEnum as PredictionCadenceEnum,
  QuestActionDtoTypeEnum as QuestActionTypeEnum,
} from "@/app/_libs/api/generated";
export type {
  CreateBadgeDtoOperatorEnum as BadgeOperator,
  CreatePredictionDtoCadenceEnum as PredictionCadence,
} from "@/app/_libs/api/generated";

// ─── Statuses ────────────────────────────────────────────────────────────────
// The DTOs type `status` as `string` (spec-12 §2.1); the list endpoints' `status` filter carries
// the real enums, so those are the source of truth until the DTOs are fixed.

export const QuestStatusEnum = AdminQuestControllerListV1StatusEnum;
export type QuestStatus = AdminQuestControllerListV1StatusEnum;

export const PredictionStatusEnum = AdminPredictionControllerListV1StatusEnum;
export type PredictionStatus = AdminPredictionControllerListV1StatusEnum;

// ─── Reward rules ────────────────────────────────────────────────────────────

/** `reward_rules.rule_key` for each game's config (`src/db/seeds/003_tokenomics_and_games.sql`). */
export const GAME_RULE_KEYS = {
  dailyStreak: "daily_streak",
  sharedContent: "shared_content",
  quest: "quest",
  prediction: "prediction",
} as const;
export type GameRuleKey = (typeof GAME_RULE_KEYS)[keyof typeof GAME_RULE_KEYS];

/** One rewarded behaviour row (`shared_content.behaviours[]` in the seed). */
export interface RuleBehaviour {
  key: string;
  label: string;
  points: number;
}

/**
 * `reward_rules['daily_streak'].config` as the Settings tab edits it today. `bonus_by_run_length`
 * matches the backend; the other keys are the current UI's fields, kept until the levels-ladder
 * decision (spec-12 §7, Q1).
 */
export interface DailyStreakRuleConfig {
  /** Proposed: the backend uses `levels[].minutes_per_day` instead. */
  min_watch_seconds: number;
  /** Proposed shape: the backend's behaviours have `metric` + `target`. */
  behaviours: RuleBehaviour[];
  /** Run length (days) → bonus points. Matches `resolveConfig()` in `streak-engine.ts`. */
  bonus_by_run_length: Record<string, number>;
  /** Proposed: customer-app behaviour, no backend field. */
  eligibility_notification: boolean;
  /** Proposed: customer-app behaviour, no backend field. */
  progress_display: "popup" | "persistent-bar";
}

/** `reward_rules['shared_content'].config` — matches the seed (TRD §8.1). */
export interface SharedContentRuleConfig {
  daily_share_cap: number;
  dedupe_window_hours: number;
  behaviours: RuleBehaviour[];
}

/** `reward_rules['quest'].config` as the Settings tab reads and writes it (spec-12 §10.9). */
export interface QuestRuleConfig {
  /** Seeded key (`003_tokenomics_and_games.sql`). */
  default_points: number;
  /** Web-only defaults kept in the free-form config; the backend doesn't read them. */
  require_all_default: boolean;
  default_window_weeks: number;
}

/** `reward_rules['prediction'].config` as the Settings tab reads and writes it (spec-12 §10.10). */
export interface PredictionRuleConfig {
  /** Seeded keys (`003_tokenomics_and_games.sql`). */
  default_entry_cost: number;
  default_multiplier: number;
  default_points: number;
  /** Web-only default kept in the free-form config; the backend doesn't read it. */
  default_cadence: "monthly" | "quarterly";
}

// ─── Proposed fields (spec-12 §2.2) ──────────────────────────────────────────

/** Instance stats the list rows show; not on `QuestDto` / `PredictionDto`. */
export interface ProposedInstanceStats {
  participantCount: number;
  completedCount: number;
  pointsPaid: number;
}

/**
 * Returned by `GET /admin/quests` and `/:id` (the raw quest record) but not declared on `QuestDto`
 * (spec-12 §10.2). Drop once the backend declares them.
 */
export interface QuestRecordFields {
  unlockThresholdPoints?: number | null;
}

/**
 * Returned by `GET /admin/predictions` and `/:id` (the raw record) but not declared on
 * `PredictionDto` (spec-12 §10.10). Drop once the backend declares them.
 */
export interface PredictionRecordFields {
  cadence?: string | null;
  unlockThresholdPoints?: number | null;
  /** Minutes between the resolve preview and its confirm. */
  resolveHoldMinutes?: number;
}

export type GameQuest = QuestDto & QuestRecordFields;
export type GameQuestDetail = QuestDetailDto & QuestRecordFields;
export type GamePrediction = PredictionDto & PredictionRecordFields;
export type GamePredictionDetail = PredictionDetailDto & PredictionRecordFields;

/**
 * One row of an instance's results table, mapped from `GET /admin/quests/:id/participants` (and,
 * once the backend adds it, `GET /admin/predictions/:id/entries`).
 */
export interface InstanceParticipantRow {
  userId: string;
  /** Display name: username, else first + last name. */
  name: string;
  avatarUrl?: string | null;
  /** Prediction: the option picked. Quest: progress, e.g. "2/3 videos". */
  detail: string;
  result: "correct" | "incorrect" | "pending" | "in_progress" | "completed" | "claimed";
  points: number;
  /** ISO time of the row's latest step (entry, start, completion or claim). */
  at: string | null;
}

/** Proposed `GET/PATCH /admin/games/widgets/:gameKey` over `game_widget_configs`. */
export interface ProposedGameWidgetDto {
  gameKey: GameRuleKey;
  bannerUrl: string | null;
  ctaLabel: string;
  style: "card" | "hero" | "carousel";
  accent: string;
  visible: boolean;
}

/** Leaderboards "Top Games": proposed `GET /admin/games/leaderboard/instances`. */
export interface ProposedLeaderboardInstanceDto {
  id: string;
  gameName: string;
  videoTitle: string;
  format: "Predict" | "Streak" | "Contest";
  createdAt: string;
  totalPlayers: number;
  health: "healthy" | "at-risk" | "stagnant";
  /** Participation change vs previous period (%). */
  trend: number;
  /** Share of activity held by the top 3 players (%). */
  topConcentration: number;
}

/** Leaderboards "Top Players": `LeaderboardRowDto` plus the stats the table shows. */
export interface ProposedLeaderboardPlayerFields {
  totalWins: number;
  gamesPlayed: number;
}

export type GameLeaderboardPlayer = LeaderboardRowDto & ProposedLeaderboardPlayerFields;

/** Paginated list envelope payload, as the list endpoints return it. */
export interface GamePage<T> {
  items: T[];
  pagination: { pageNo: number; pageSize: number; totalCount: number; totalPages: number };
}

// ─── Master page analytics (proposed, spec-12 §2.2) ──────────────────────────
// `GET /admin/analytics/games` exists but is untyped and has no region or window; these are the
// shapes the master page needs.

/** `"all"` or a macro-region code — the `?region=` lens on the master and format pages. */
export type GameRegion = "all" | MacroRegion;

/** Master tiles + per-format row stats for one window and region. */
export interface ProposedGamesOverviewDto {
  activePlayers: number;
  activePlayersTrendPct: number;
  /** Daily active players across the window, oldest first. */
  activePlayersSeries: number[];
  /** % of active users who played at least one game. */
  participationPct: number;
  pointsMinted: number;
  pointsSpent: number;
  completionPct: number;
  completionTrendPct: number;
  /** Per format: participants, active instances and plays (keyed by rule key). */
  formats: Record<GameRuleKey, { participants: number; activeCount: number; plays: number }>;
}

/** One value per region box (`all` + each macro-region). */
export type RegionValues = Record<GameRegion, number>;

/** The master page's regional heat grid. */
export interface ProposedGamesRegionalActivityDto {
  playingNow: RegionValues;
  activePlayers: RegionValues;
  pointsMinted: RegionValues;
}

/** "Trends & Economy" below the format rows. */
export interface ProposedGamesTrendsDto {
  velocity: { day: string; started: number; completed: number }[];
  winLoss: { format: string; wins: number; losses: number }[];
  topGames: { title: string; plays: number; participationPct: number }[];
  pointsMinted: number;
  pointsSpent: number;
}

/** A format's Analytics tab for one region (proposed `GET /admin/games/:format/analytics`). */
export interface ProposedFormatAnalyticsDto {
  totalPlays: number;
  uniquePlayers: number;
  pointsMinted: number;
  completionRatePct: number;
  /** The tab's region heat grid. */
  regional: { uniquePlayers: RegionValues; totalPlays: RegionValues; pointsMinted: RegionValues };
  daily: { date: string; plays: number; completions: number; unique: number }[];
  /** Share of a day-1 cohort still playing on each day. */
  retention: { day: string; ratePct: number }[];
  rewardTiers: { tier: string; count: number }[];
  peakHours: { hour: string; plays: number }[];
  summary: {
    avgSessionSeconds: number;
    avgPointsPerGame: number;
    winRatePct: number;
    repeatPlayersPct: number;
    activeGames: number;
  };
}
