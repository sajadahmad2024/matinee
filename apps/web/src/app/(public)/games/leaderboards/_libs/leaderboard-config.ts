// Leaderboards config: tabs, health labels, format filters and the health thresholds.
import { Gamepad2, Trophy } from "lucide-react";

import type { CustomTabItem } from "@/components/custom/custom-tabs";

import type { LeaderboardSubtab } from "../../_libs/game-config";
import type { ProposedLeaderboardInstanceDto } from "../../_libs/game-types";

export const LEADERBOARD_TABS: CustomTabItem<LeaderboardSubtab>[] = [
  { value: "instances", label: "Top Games", icon: Gamepad2 },
  { value: "hall-of-fame", label: "Top Players", icon: Trophy },
];

type Health = ProposedLeaderboardInstanceDto["health"];
type InstanceFormat = ProposedLeaderboardInstanceDto["format"];

export const HEALTH_META: Record<Health, { label: string; cls: string }> = {
  healthy: { label: "Healthy", cls: "text-success bg-success/10" },
  "at-risk": { label: "At risk", cls: "text-warning bg-warning/10" },
  stagnant: { label: "Stagnant", cls: "text-destructive bg-destructive/10" },
};

/** Top-3 share at or above this is over-concentrated (the same few players keep winning). */
export const CONCENTRATION_LIMIT = 40;

const FORMAT_FILTER_ALL = "all";
export type LeaderboardFormatFilter = typeof FORMAT_FILTER_ALL | "streak" | "contest" | "predict";

const FORMAT_BY_FILTER: Record<Exclude<LeaderboardFormatFilter, "all">, InstanceFormat> = {
  streak: "Streak",
  contest: "Contest",
  predict: "Predict",
};

/** `?format=` → the instance format to filter on (`undefined` = all). */
export const instanceFormatFor = (filter: string): InstanceFormat | undefined =>
  FORMAT_BY_FILTER[filter as keyof typeof FORMAT_BY_FILTER];

export const parseFormatFilter = (value?: string | null): LeaderboardFormatFilter =>
  value && (value === FORMAT_FILTER_ALL || value in FORMAT_BY_FILTER)
    ? (value as LeaderboardFormatFilter)
    : FORMAT_FILTER_ALL;

/** The format filter, worded per tab. */
export const GAME_FORMAT_FILTERS: { value: LeaderboardFormatFilter; label: string }[] = [
  { value: "all", label: "All Formats" },
  { value: "streak", label: "Watch Streak" },
  { value: "contest", label: "Weekly Contest" },
  { value: "predict", label: "Predict Outcome" },
];

/** Top Players by format — no per-format player ranking on the backend yet (spec-12 §2.2). */
export const PLAYER_FORMAT_FILTERS: { value: LeaderboardFormatFilter; label: string }[] = [
  { value: "all", label: "All Formats" },
  { value: "streak", label: "Streak Champions" },
  { value: "contest", label: "Contest Winners" },
  { value: "predict", label: "Best Predictors" },
];
