import type * as React from "react";

import { Gamepad2, Heart, Target, Timer } from "lucide-react";

import type { ContentLibraryAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";
import type { StatTile } from "@/components/custom/stat-tile";

import { EMPTY, formatCents } from "../../_shared/content-format";
import { formatCount, formatDuration } from "../listing/listing-config";

/** Content Performance section: copy, the analytics → tiles / cards mapping, and formatters. */

export const PERFORMANCE_WINDOW_DAYS = 30;
export const PERFORMANCE_TILE_COUNT = 4;
/** Regions listed under Avg Watch Time, as in the design. */
const WATCH_TIME_REGIONS = ["NA", "EU", "APAC"] as const;

export const PERFORMANCE_COPY = {
  title: "Content Performance",
  subtitle: "Engagement funnel signals across the live library",
  loadError: "Unable to load performance",
  loadErrorFallback: "Please try again.",
  watchingNow: (n: number) => `${n?.toLocaleString()} watching now`,
} as const;

// ─── Formatters ──────────────────────────────────────────────────────────────

/** 38.94 → "38.9%" (the API's 0..100 percentages). */
export const formatPct = (pct?: number | null) =>
  pct == null ? EMPTY : `${Math.round(pct * 10) / 10}%`;

/** 0.124 → "12.4%" (the API's 0..1 ratios). */
export const formatRatioPct = (ratio?: number | null) =>
  ratio == null ? EMPTY : formatPct(ratio * 100);

/** Change between two windows in %, or `undefined` when the previous one is 0 / missing. */
export const changePct = (current?: number | null, previous?: number | null) =>
  current == null || !previous
    ? undefined
    : Math.round(((current - previous) / previous) * 1000) / 10;

/** "+4.2%" (`suffix` appended); `undefined` without a previous value to compare. */
export const formatChange = (change: number | undefined, suffix = "") =>
  change == null ? undefined : `${change >= 0 ? "+" : ""}${change}%${suffix}`;

/** Trend chip vs the previous 30 days; none when there's nothing to compare. */
const trendOf = (change: number | undefined, suffix = "") =>
  change == null
    ? undefined
    : {
        direction: (change >= 0 ? "up" : "down") as "up" | "down",
        label: formatChange(change, suffix) ?? "",
      };

// ─── Tiles ───────────────────────────────────────────────────────────────────

export type PerformanceTile = React.ComponentProps<typeof StatTile>;

/**
 * The four headline tiles: watch time, game conversion, hit rate, engagement — with trends vs
 * `previous`, and `daily` sparklines where the API has a daily series (not watch time).
 */
export const buildPerformanceTiles = (current: ContentLibraryAnalyticsDto): PerformanceTile[] => {
  const previous = current?.previous;
  const daily = current?.daily ?? [];
  const watchTimeIn = (region: string) =>
    current?.byRegion?.find((r) => r?.region === region)?.avgWatchSeconds;

  return [
    {
      label: "Avg Watch Time",
      value: formatDuration(current?.totals?.avgWatchSeconds),
      icon: Timer,
      accent: "primary",
      trend: trendOf(changePct(current?.totals?.avgWatchSeconds, previous?.avgWatchSeconds)),
      subStats: WATCH_TIME_REGIONS?.map((region) => ({
        label: region,
        value: formatDuration(watchTimeIn(region)),
      })),
    },
    {
      label: "Game Conversion",
      value: formatPct(current?.gameConversion?.percent),
      icon: Gamepad2,
      accent: "accent",
      trend: trendOf(
        changePct(current?.gameConversion?.percent, previous?.gameConversionPct),
        " vs last mo",
      ),
      sparkline: daily?.map((d) => d?.gameConversionPct ?? 0),
      subStats: [{ label: "Viewer → Player", value: formatPct(current?.gameConversion?.percent) }],
    },
    {
      label: "Hit Rate",
      value: formatPct(current?.hitRate?.percent),
      icon: Target,
      accent: "success",
      trend: trendOf(changePct(current?.hitRate?.percent, previous?.hitRatePct)),
      sparkline: daily?.map((d) => d?.hitRatePct ?? 0),
      subStats: [
        { label: "This month's uploads", value: formatPct(current?.hitRate?.percent) },
        {
          label: "Threshold",
          value: `>${formatCount(current?.hitRate?.threshold ?? 0)} views in ${PERFORMANCE_WINDOW_DAYS} days`,
        },
      ],
    },
    {
      label: "Avg Engagement Rate",
      value: formatPct(current?.totals?.engagementRate),
      icon: Heart,
      accent: "danger",
      trend: trendOf(changePct(current?.totals?.engagementRate, previous?.engagementRate)),
      sparkline: daily?.map((d) => d?.engagementRate ?? 0),
      subStats: [{ label: "(likes+comments+shares+saves) ÷ views", value: "all live" }],
    },
  ];
};

// ─── Analytics cards ─────────────────────────────────────────────────────────

export interface FinancialMetric {
  title: string;
  value: string;
  subValue?: string;
}

/**
 * Financial & Conversion card. Revenue is the window's total from every source — ads and subs
 * are per-event, licence / sponsorship pro-rated over the window by the API — with the design's
 * Ads / Subs split underneath.
 */
export const buildFinancialMetrics = (current: ContentLibraryAnalyticsDto): FinancialMetric[] => {
  const revenue = current?.revenueAttribution;
  const avgDuration = current?.totals?.avgDurationSeconds;
  return [
    {
      title: "Revenue Attribution",
      value: formatCents(
        (revenue?.adsRevenueCents ?? 0) +
          (revenue?.subsRevenueCents ?? 0) +
          (revenue?.licenseRevenueCents ?? 0) +
          (revenue?.sponsorshipRevenueCents ?? 0),
      ),
      subValue: `Ads ${formatCents(revenue?.adsRevenueCents ?? 0)} · Subs ${formatCents(revenue?.subsRevenueCents ?? 0)}`,
    },
    {
      title: "Game Conversion",
      value: formatPct(current?.gameConversion?.percent),
      subValue: "Viewer → Player",
    },
    {
      title: "BTS Upsell CTR",
      value: formatRatioPct(current?.btsUpsell?.ctr),
      subValue: formatChange(
        changePct(current?.btsUpsell?.ctr, current?.previous?.btsCtr),
        " vs last month",
      ),
    },
    {
      title: "Avg Watch Time",
      value: formatDuration(current?.totals?.avgWatchSeconds),
      // The library's mean video length — not windowed or region-scoped.
      subValue: avgDuration ? `of ${formatDuration(avgDuration)} avg duration` : undefined,
    },
  ];
};

export interface FunnelStage {
  stage: string;
  value: number;
}

/**
 * The design's engagement funnel — unique users per stage in the window. The API doesn't promise
 * each stage is smaller than the last (a game can start before 3 s of watching), so a stage can
 * read above 100% of impressions.
 */
export const buildFunnelStages = (current: ContentLibraryAnalyticsDto): FunnelStage[] => {
  const funnel = current?.funnel;
  return [
    { stage: "Impressions", value: funnel?.impressions ?? 0 },
    { stage: "3s View", value: funnel?.watched3s ?? 0 },
    { stage: "50% Watch", value: funnel?.watched50pct ?? 0 },
    { stage: "Game Start", value: funnel?.gameStarted ?? 0 },
    { stage: "Game Complete", value: funnel?.gameCompleted ?? 0 },
    { stage: "Shared", value: funnel?.shared ?? 0 },
  ];
};
