import type * as React from "react";

import { AlertTriangle, Coins, FileText, Scale } from "lucide-react";

import {
  AdminContentInsightsControllerLicensesV1SortEnum as LicenseSort,
  type LicenseSummaryDto,
  AdminContentInsightsControllerLicensesV1RenewalStatusEnum as RenewalStatus,
} from "@/app/_libs/api/generated";
import type { CustomSelectOption } from "@/components/custom/custom-select";
import type { StatTile } from "@/components/custom/stat-tile";

import { EMPTY, formatCents } from "../../_shared/content-format";

/** Licensing & Rights section: copy, table labels / filters, and the summary → tiles mapping. */

export const LICENSING_COPY = {
  title: "Licensing & Rights",
  subtitle: "Cost, efficiency and expiry — full agreement table below",
  loadError: "Unable to load licensing",
  loadErrorFallback: "Please try again.",
  searchPlaceholder: "Search content / licensor…",
  empty: "No licence agreements yet.",
  noMatches: "No matching agreements.",
  rowHint: "click a row to open the video",
} as const;

export const LICENSING_TILE_COUNT = 4;
export const LICENSES_PAGE_SIZE = 20;
export const LICENSES_SEARCH_DEBOUNCE_MS = 300;

/** The Expiring tile turns red past this many licences expiring within 30 days. */
const EXPIRING_ALERT_THRESHOLD = 5;

// ─── Table ───────────────────────────────────────────────────────────────────

export const RENEWAL_LABELS: Record<RenewalStatus, string> = {
  [RenewalStatus.Renewing]: "Renewing",
  [RenewalStatus.InNegotiation]: "In negotiation",
  [RenewalStatus.Expiring]: "Expiring",
  [RenewalStatus.Lapsed]: "Lapsed",
  [RenewalStatus.AutoRenew]: "Auto-renew",
};

export const RENEWAL_TONES: Record<RenewalStatus, string> = {
  [RenewalStatus.Renewing]: "bg-success/15 text-success",
  [RenewalStatus.InNegotiation]: "bg-warning/15 text-warning",
  [RenewalStatus.Expiring]: "bg-destructive/15 text-destructive",
  [RenewalStatus.Lapsed]: "bg-muted text-muted-foreground",
  [RenewalStatus.AutoRenew]: "bg-primary/15 text-primary",
};

/** Renewal filter — "All renewal statuses" sends no filter. */
export const ALL_RENEWALS = "all";
export type RenewalFilter = RenewalStatus | typeof ALL_RENEWALS;

export const RENEWAL_FILTER_OPTIONS: CustomSelectOption<RenewalFilter>[] = [
  { value: ALL_RENEWALS, label: "All renewal statuses" },
  ...Object.values(RenewalStatus)?.map((value) => ({ value, label: RENEWAL_LABELS[value] })),
];

/** Values are the API's sort enum, so they pass straight through. */
export const LICENSE_SORT_OPTIONS: CustomSelectOption<LicenseSort>[] = [
  { value: LicenseSort.ExpiresAsc, label: "Expiring soonest" },
  { value: LicenseSort.RevenueDesc, label: "Highest revenue" },
  { value: LicenseSort.CostDesc, label: "Highest cost" },
  { value: LicenseSort.RoiDesc, label: "Best ROI" },
];

export const LICENSES_DEFAULT_SORT = LicenseSort.ExpiresAsc;

/** Days-left colour: red under 30, amber to 90, green beyond. */
export const daysLeftTone = (days: number) =>
  days < 30 ? "text-destructive" : days <= 90 ? "text-warning" : "text-success";

/** ROI colour: green at 2× and up, amber from 1×, red below. */
export const roiTone = (roi: number) =>
  roi >= 2 ? "text-success" : roi >= 1 ? "text-warning" : "text-destructive";

// ─── Summary → tiles ─────────────────────────────────────────────────────────

export type LicensingTile = React.ComponentProps<typeof StatTile>;

/** Cost per stream is a fraction of a cent: 0.42¢ → "$0.0042". */
const formatCostPerStream = (cents?: number | null) =>
  cents == null ? EMPTY : `$${(cents / 100)?.toFixed(4)}`;

/** This month's cost vs last month's, from the API's monthly series; `undefined` without both. */
const monthlyCostChangePct = (summary: LicenseSummaryDto) => {
  const trend = summary?.monthlyCostTrend ?? [];
  const current = trend?.[trend.length - 1]?.costCents;
  const previous = trend?.[trend.length - 2]?.costCents;
  if (current == null || !previous) return undefined;
  return Math.round(((current - previous) / previous) * 1000) / 10;
};

/**
 * Cost per stream vs the previous period. Lower is better, so a fall is the good direction.
 * `undefined` without a previous value to compare.
 */
const costPerStreamTrend = (summary: LicenseSummaryDto) => {
  const current = summary?.costPerStreamCents;
  const previous = summary?.prevCostPerStreamCents;
  if (current == null || !previous) return undefined;
  const change = Math.round(((current - previous) / previous) * 1000) / 10;
  return {
    direction: (change >= 0 ? "up" : "down") as "up" | "down",
    label: `${change >= 0 ? "+" : ""}${change}%`,
    good: change <= 0,
  };
};

/**
 * The four licensing tiles from `GET /admin/content/licenses/summary`: licensed vs original,
 * monthly cost, cost per stream, and expiries.
 */
export const buildLicensingTiles = (summary: LicenseSummaryDto): LicensingTile[] => {
  const licensed = summary?.licensedCount ?? 0;
  const original = summary?.originalCount ?? 0;
  const total = licensed + original;
  const licensedPct = total ? Math.round((licensed / total) * 100) : 0;
  const expiring30 = summary?.expiringIn30 ?? 0;
  const expiringAlert = expiring30 > EXPIRING_ALERT_THRESHOLD;
  const costChange = monthlyCostChangePct(summary);

  return [
    {
      label: "Licensed Content",
      value: licensed?.toLocaleString(),
      icon: FileText,
      accent: "primary",
      subStats: [
        {
          label: "Licensed",
          value: `${licensed?.toLocaleString()} (${licensedPct}%)`,
          accent: "primary",
        },
        { label: "Original / owned", value: original?.toLocaleString(), accent: "accent" },
        { label: "Active agreements", value: `${summary?.activeAgreements ?? 0}` },
      ],
    },
    {
      label: "Active Licensing Cost",
      value: formatCents(summary?.monthlyCostCents),
      icon: Coins,
      accent: "warning",
      trend:
        costChange == null
          ? undefined
          : {
              direction: costChange >= 0 ? "up" : "down",
              label: `${costChange >= 0 ? "+" : ""}${costChange}% vs last mo`,
              good: costChange < 0, // lower cost is good
            },
      subStats: [
        { label: "Total cost", value: formatCents(summary?.totalCostCents) },
        {
          label: "Revenue generated",
          value: formatCents(summary?.totalRevenueCents),
          accent: "success",
        },
      ],
    },
    {
      label: "Cost Per Stream",
      value: formatCostPerStream(summary?.costPerStreamCents),
      icon: Scale,
      accent: "success",
      trend: costPerStreamTrend(summary),
      subStats: [{ label: "Licensing cost ÷ licensed views", value: "efficiency" }],
    },
    {
      label: "Expiring Licenses",
      value: expiring30,
      icon: AlertTriangle,
      accent: expiringAlert ? "danger" : "warning",
      trend: expiringAlert ? { direction: "up", label: "Alert", good: false } : undefined,
      subStats: [
        {
          label: "In 30 days",
          value: `${expiring30}`,
          accent: expiringAlert ? "danger" : "warning",
        },
        { label: "In 60 days", value: `${summary?.expiringIn60 ?? 0}` },
        { label: "In 90 days", value: `${summary?.expiringIn90 ?? 0}` },
      ],
    },
  ];
};
