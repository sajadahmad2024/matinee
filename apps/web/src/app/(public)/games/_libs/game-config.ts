// Game Management config shared by every flow: routes, the four formats, region lens and labels.
// Values mirror the backend (`apps/backend/src/games/**`); no mock data lives here (spec-12 §1).
import type { Route } from "next";

import { Flame, type LucideIcon, Share2, Target, Trophy } from "lucide-react";

import { ADMIN_ROUTES } from "@/app/_libs/constants/routes";
import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";
import { withReturnTo } from "@/hooks/use-return-to";

import {
  type BadgeOperator,
  BadgeOperatorEnum,
  GAME_RULE_KEYS,
  type GameRegion,
  type GameRuleKey,
} from "./game-types";

// ─── Formats ─────────────────────────────────────────────────────────────────

/** The four fixed formats, in the client's row order (URL slugs). */
const GAME_FORMAT_SLUGS = ["daily-streak", "quests", "shared-content", "predictive"] as const;
type GameFormatSlug = (typeof GAME_FORMAT_SLUGS)[number];

export interface GameFormat {
  slug: GameFormatSlug;
  /** The format's `reward_rules` key: its config and its on/off switch. */
  ruleKey: GameRuleKey;
  name: string;
  description: string;
  /** What the player does to earn/spend. */
  tagline: string;
  icon: LucideIcon;
  /** Autonomous = the engine runs it from events; no admin-scheduled instances. */
  autonomous: boolean;
  /** The tables behind it, shown to operators for transparency. */
  dbMapping: string;
  /** What one admin-created entry is called (null for autonomous formats). */
  instanceNoun: string | null;
}

/**
 * Formats are FIXED (each is its own engine in the backend); their rules are configured per
 * format. Bidding lives in the Rewards module (spec-03), not in games.
 */
export const GAME_FORMATS: Record<GameFormatSlug, GameFormat> = {
  "daily-streak": {
    slug: "daily-streak",
    ruleKey: GAME_RULE_KEYS.dailyStreak,
    name: "Daily Streak",
    description: "Autonomous — time on app + engagement earns points every day.",
    tagline: "Time + Engagement = Points",
    icon: Flame,
    autonomous: true,
    dbMapping: "reward_rules['daily_streak'] · user_streaks",
    instanceNoun: null,
  },
  quests: {
    slug: "quests",
    ruleKey: GAME_RULE_KEYS.quest,
    name: "Weekly Quests",
    description: "Curated lists of videos to watch within a window for points.",
    tagline: "Watch the set, earn points",
    icon: Trophy,
    autonomous: false,
    dbMapping: "quests · quest_actions · quest_participations",
    instanceNoun: "Quest",
  },
  "shared-content": {
    slug: "shared-content",
    ruleKey: GAME_RULE_KEYS.sharedContent,
    name: "Shared Content",
    description: "Points for sharing content internally/externally + referrals.",
    tagline: "Share & refer = Points",
    icon: Share2,
    autonomous: false,
    dbMapping: "content_shares · referral_redemptions",
    instanceNoun: "Share Rule",
  },
  predictive: {
    slug: "predictive",
    ruleKey: GAME_RULE_KEYS.prediction,
    name: "Predictive",
    description: "Predict real-world outcomes; spend points to play, win a multiplier.",
    tagline: "Spend points, predict, multiply",
    icon: Target,
    autonomous: false,
    dbMapping: "predictions · prediction_options · prediction_entries",
    instanceNoun: "Prediction",
  },
};

/** The formats in the client's row order. */
export const GAME_FORMAT_LIST: GameFormat[] = GAME_FORMAT_SLUGS?.map((slug) => GAME_FORMATS[slug]);

// ─── Routes ──────────────────────────────────────────────────────────────────

export type FormatTab = "settings" | "analytics";
export type LeaderboardSubtab = "instances" | "hall-of-fame";

export const GAME_ROUTES = {
  LIST: ADMIN_ROUTES.GAMES as Route,
  BADGES: `${ADMIN_ROUTES.GAMES}/badges` as Route,
  leaderboards: (subtab?: LeaderboardSubtab) =>
    `${ADMIN_ROUTES.GAMES}/leaderboards${subtab ? `?subtab=${subtab}` : ""}` as Route,
  // `from`: the page (with its query) the format page goes back to
  format: (slug: GameFormatSlug, from?: string | null) =>
    withReturnTo(`${ADMIN_ROUTES.GAMES}/format/${slug}` as Route, from),
} as const;

// ─── Region lens (`?region=`) ────────────────────────────────────────────────

export const GAME_REGION_ALL = "all";

/** `?region=` → a macro-region code, or `"all"` for anything else. */
export function parseGameRegion(value?: string | null): GameRegion {
  const code = (value ?? GAME_REGION_ALL).toUpperCase();
  return MACRO_REGIONS?.some((r) => r.code === code) ? (code as MacroRegion) : GAME_REGION_ALL;
}

/** The region boxes: "All regions" + the five macro-regions. */
export const GAME_REGION_OPTIONS: { code: GameRegion; label: string }[] = [
  { code: GAME_REGION_ALL, label: "All regions" },
  ...MACRO_REGIONS?.map((r) => ({ code: r.code, label: r.label })),
];

// ─── Labels ──────────────────────────────────────────────────────────────────

/** Badge criteria operators as the badge cards and form show them. */
export const BADGE_OPERATOR_LABELS: Record<BadgeOperator, string> = {
  [BadgeOperatorEnum.Gt]: "Greater than",
  [BadgeOperatorEnum.Gte]: "Greater or equal",
  [BadgeOperatorEnum.Eq]: "Equals",
  [BadgeOperatorEnum.Lt]: "Less than",
  [BadgeOperatorEnum.Lte]: "Less or equal",
};

/** `+6.1%` / `-3%` for a trend chip. */
export const formatTrendPct = (pct: number) => `${pct >= 0 ? "+" : ""}${pct}%`;
