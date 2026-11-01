import type * as React from "react";

import { differenceInCalendarDays, endOfMonth } from "date-fns";
import { CalendarClock, CalendarX2, GitPullRequestArrow, Library } from "lucide-react";

import type { ContentStatsDto } from "@/app/_libs/hooks/api/use-admin-content";
import type { StatTile } from "@/components/custom/stat-tile";

import { EMPTY } from "../../_shared/content-format";

/** Content Inventory section: copy, value formatters and the stats → tiles mapping. */

export const INVENTORY_COPY = {
  title: "Content Inventory",
  subtitle: "The current state of your library",
  loadError: "Unable to load inventory",
  loadErrorFallback: "Please try again.",
} as const;

export const INVENTORY_TILE_COUNT = 4;

export type InventoryTile = React.ComponentProps<typeof StatTile>;

// ─── Formatters ──────────────────────────────────────────────────────────────

/** Days left in the current month, today included. */
const daysRemainingInMonth = () => differenceInCalendarDays(endOfMonth(new Date()), new Date()) + 1;

/** 5.5 → "5.5 h", 76.8 → "3.2 days". */
const formatPublishTime = (hours?: number | null) => {
  if (hours == null) return EMPTY;
  return hours < 48 ? `${hours?.toFixed(1)} h` : `${(hours / 24)?.toFixed(1)} days`;
};

/** "+12.5%" / "-4%". */
const formatChangePct = (pct: number) => `${pct >= 0 ? "+" : ""}${pct}%`;

/** 30 of 1,847 → "1.6%"; "0%" for an empty library. */
const formatShare = (part: number, whole: number) =>
  whole ? `${((part / whole) * 100)?.toFixed(1)}%` : "0%";

// ─── Stats → tiles ───────────────────────────────────────────────────────────

/**
 * The four inventory tiles from `GET /admin/content/stats`: what's live, what came in, what's about
 * to expire, and the pipeline.
 */
export const buildInventoryTiles = (stats: ContentStatsDto): InventoryTile[] => {
  const activeLibrary = stats?.activeLibrary ?? 0;
  const addedThisMonth = stats?.addedThisMonth ?? 0;
  const expiringThisMonth = stats?.expiringThisMonth ?? 0;
  const pipeline = stats?.pipeline;
  const pipelineTotal =
    (pipeline?.draft ?? 0) + (pipeline?.inReview ?? 0) + (pipeline?.scheduled ?? 0);
  // More coming off than going up — the library is shrinking.
  const netShrinking = expiringThisMonth > addedThisMonth;
  const last30Change = stats?.addedLast30dChangePct;

  return [
    {
      label: "Active Library",
      value: activeLibrary?.toLocaleString(),
      icon: Library,
      accent: "primary",
      trend: { direction: "up", label: `+${addedThisMonth} this mo` },
      subStats: [{ label: "All titles", value: (stats?.total ?? 0)?.toLocaleString() }],
    },
    {
      // TODO(BE): no monthly upload target in the API yet — shown without a goal / progress bar.
      label: "Uploaded This Month",
      value: addedThisMonth?.toLocaleString(),
      icon: CalendarClock,
      accent: "success",
      trend:
        last30Change == null
          ? undefined
          : {
              direction: last30Change > 0 ? "up" : last30Change < 0 ? "down" : "flat",
              label: `${formatChangePct(last30Change)} vs prior 30 days`,
              good: last30Change >= 0,
            },
      subStats: [
        { label: "Last 30 days", value: `${stats?.addedLast30d ?? 0}`, accent: "accent" },
        { label: "Days remaining", value: `${daysRemainingInMonth()}` },
      ],
    },
    {
      label: "Expiring This Month",
      value: expiringThisMonth,
      icon: CalendarX2,
      accent: netShrinking ? "danger" : "warning",
      trend: {
        direction: netShrinking ? "down" : "up",
        label: netShrinking ? "Net shrinking" : "Covered by uploads",
        good: !netShrinking,
      },
      subStats: [
        { label: "Next month", value: `${stats?.expiringNextMonth ?? 0}`, accent: "warning" },
        {
          label: `of ${activeLibrary?.toLocaleString()} live`,
          value: formatShare(expiringThisMonth, activeLibrary),
        },
      ],
    },
    {
      label: "Pipeline",
      value: pipelineTotal,
      icon: GitPullRequestArrow,
      accent: "warning",
      subStats: [
        { label: "Draft", value: `${pipeline?.draft ?? 0}` },
        { label: "In review", value: `${pipeline?.inReview ?? 0}`, accent: "warning" },
        { label: "Scheduled", value: `${pipeline?.scheduled ?? 0}`, accent: "primary" },
        { label: "Avg time to publish", value: formatPublishTime(stats?.avgTimeToPublishHours) },
      ],
    },
  ];
};
