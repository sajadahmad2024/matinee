import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { formatCount, formatDuration } from "../../../_components/listing/listing-config";
import { EMPTY, formatCents } from "../../../_shared/content-format";

/** Per-video analytics page: API → card values. The page's layout is unchanged from the design. */

// ─── Formatters ──────────────────────────────────────────────────────────────

/** 12.43 → "+12.4%"; the dash without a value. */
export const formatSignedPct = (pct?: number | null) =>
  pct == null ? EMPTY : `${pct >= 0 ? "+" : ""}${Math.round(pct * 10) / 10}%`;

/** +135 s → "+2:15", -40 → "-0:40". */
export const formatSignedDuration = (seconds?: number | null) =>
  seconds == null ? EMPTY : `${seconds >= 0 ? "+" : "-"}${formatDuration(Math.abs(seconds))}`;

/**
 * Change between two rates, in percentage points (8.2 vs 7.4 → +0.8) — how the design shows the
 * engagement / participation / BTS changes. `undefined` without both values.
 */
export const pointsChange = (current?: number | null, previous?: number | null) =>
  current == null || previous == null ? undefined : current - previous;

/** 1240000 cents → "$12.4K"; small amounts in full ("$480"). */
export const formatCompactCents = (cents?: number | null) => {
  const dollars = (cents ?? 0) / 100;
  return dollars >= 1000 ? `$${formatCount(Math.round(dollars))}` : formatCents(cents ?? 0);
};

/** Average watch time per view; `undefined` without views. */
export const watchPerView = (watchSeconds?: number | null, views?: number | null) =>
  views ? (watchSeconds ?? 0) / views : undefined;

/** The window's average watch time per view, and its change in seconds vs the previous window. */
export const avgWatchStats = (analytics?: ContentAnalyticsDto) => {
  const period = analytics?.periodChange;
  const avgWatch = watchPerView(period?.watchSeconds, period?.views);
  const prevAvgWatch = watchPerView(period?.prevWatchSeconds, period?.prevViews);
  return {
    avgWatch,
    avgWatchChange: avgWatch != null && prevAvgWatch != null ? avgWatch - prevAvgWatch : undefined,
  };
};

// ─── Cards ───────────────────────────────────────────────────────────────────

/** Recharts tooltip box, shared by the retention and traffic charts. */
export const CHART_TOOLTIP_STYLE = {
  backgroundColor: "hsl(217, 33%, 14%)",
  border: "1px solid hsl(217, 33%, 22%)",
  borderRadius: "8px",
};

const SOURCE_COLORS = [
  "hsl(217, 91%, 60%)",
  "hsl(142, 76%, 45%)",
  "hsl(270, 91%, 65%)",
  "hsl(25, 95%, 53%)",
  "hsl(330, 80%, 60%)",
  "hsl(45, 93%, 47%)",
];

const SOURCE_LABELS: Record<string, string> = {
  homepage: "Homepage",
  feed: "Feed",
  notifications: "Notifications",
  notification: "Notifications",
  search: "Search",
  share: "External Share",
  external: "External Share",
  direct: "Direct",
  unknown: "Other",
};

const titleCase = (value: string) =>
  value?.replace(/[_-]+/g, " ")?.replace(/\b\w/g, (c) => c.toUpperCase()) ?? value;

/** Traffic sources as % of the window's views, with the pie's colours. */
export const trafficSourceRows = (analytics?: ContentAnalyticsDto) => {
  const sources = analytics?.trafficSources ?? [];
  const total = sources?.reduce((sum, s) => sum + (s?.views ?? 0), 0) ?? 0;
  return sources?.map((s, i) => ({
    name: SOURCE_LABELS[s?.source] ?? titleCase(s?.source ?? ""),
    value: total ? Math.round(((s?.views ?? 0) / total) * 100) : 0,
    color: SOURCE_COLORS[i % SOURCE_COLORS.length]!,
  }));
};

/** Device split as % of all views — the API's own platforms (ios / android). */
export const deviceShares = (analytics?: ContentAnalyticsDto) => {
  const devices = analytics?.demographics?.device ?? [];
  const total = devices?.reduce((sum, d) => sum + (d?.views ?? 0), 0) ?? 0;
  const viewsOf = (...names: string[]) =>
    devices
      ?.filter((d) => names.includes(d?.device))
      ?.reduce((sum, d) => sum + (d?.views ?? 0), 0) ?? 0;
  const pct = (views: number) => (total ? Math.round((views / total) * 100) : 0);
  return {
    ios: pct(viewsOf("ios")),
    android: pct(viewsOf("android")),
  };
};

const countryNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : undefined;

/** Top 5 countries by views (ISO-2 → name), with each country's revenue in the window. */
export const geoRows = (analytics?: ContentAnalyticsDto) =>
  (analytics?.geo ?? [])
    ?.filter((g) => g?.countryCode && g?.countryCode !== "unknown")
    ?.slice(0, 5)
    ?.map((g) => {
      let country = g?.countryCode;
      try {
        country = countryNames?.of(g?.countryCode) ?? g?.countryCode;
      } catch {
        // an unrecognised code shows as-is
      }
      return {
        country,
        views: g?.views ?? 0,
        revenueCents: g?.revenueCents ?? 0,
      };
    });

/**
 * Retention points (0..100 % of the playhead) placed on the video's timeline in seconds, as the
 * chart's x-axis expects. Empty without a duration to place them on, or without views.
 */
export const retentionSeries = (
  analytics?: ContentAnalyticsDto,
  durationSeconds?: number | null,
) =>
  durationSeconds && analytics?.retention?.length
    ? analytics?.retention?.map((p) => ({
        second: Math.round(((p?.percent ?? 0) / 100) * durationSeconds),
        retention: (p?.ratio ?? 0) * 100,
      }))
    : [];

/**
 * Viewer age groups — always the API's five buckets in order, as % of viewers with a known date
 * of birth. `undefined` while none of the viewers has one (signup doesn't collect it yet).
 */
export const ageRows = (analytics?: ContentAnalyticsDto) => {
  const age = analytics?.demographics?.age ?? [];
  return age?.some((a) => (a?.pct ?? 0) > 0)
    ? age?.map((a) => ({ range: a?.range, value: Math.round(a?.pct ?? 0) }))
    : undefined;
};

/** Distinct quest completers ÷ participants. */
export const questCompletionRate = (analytics?: ContentAnalyticsDto) => {
  const participants = analytics?.games?.questParticipants ?? 0;
  return participants
    ? `${Math.round(((analytics?.games?.questCompletions ?? 0) / participants) * 1000) / 10}%`
    : "0%";
};

/** Views across this title's BTS / child videos. */
export const btsTotalViews = (analytics?: ContentAnalyticsDto) =>
  formatCount(analytics?.bts?.children?.reduce((sum, c) => sum + (c?.views ?? 0), 0) ?? 0);
