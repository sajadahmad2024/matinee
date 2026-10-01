// Ads Management (spec-07) — mock data + shared types. UI-only; nothing is persisted.

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

export type AdStatus = "scheduled" | "live" | "paused" | "ended";

export interface AdItem {
  id: string;
  name: string;
  advertiser: string;
  caption: string; // shown under the ad in the feed, like a video description
  videoUrl?: string;
  durationSecs: number;
  ctaLabel: string;
  ctaUrl: string;
  regions: "all" | MacroRegion[];
  startsAt: string; // local "YYYY-MM-DDTHH:MM"
  endsAt: string;
  status: AdStatus;
  stats: { impressions: number; completionRate: number; ctr: number };
}

export const AD_CAPTION_MAX = 300;

export const CTA_LABELS = ["Learn more", "Shop now", "Install", "Watch now"];

// ── platform settings (spec-09) — rules that apply to every feed ad ─────────

export interface PlatformAdSettings {
  adsEnabled: boolean;
  firstAdAfter: number; // videos
  adEvery: number; // videos, ≥ 2
  maxAdsPerUserDay: number;
  newUserGraceDays: number; // 0 = off
}

export const DEFAULT_PLATFORM_SETTINGS: PlatformAdSettings = {
  adsEnabled: true,
  firstAdAfter: 3,
  adEvery: 5,
  maxAdsPerUserDay: 15,
  newUserGraceDays: 2,
};

export const AD_VIDEO_MAX_SECS = 60;

export const AD_STATUS_CONFIG: Record<AdStatus, { label: string; badge: string }> = {
  live: { label: "Live", badge: "border-success/40 bg-success/10 text-success" },
  scheduled: { label: "Scheduled", badge: "border-primary/40 bg-primary/10 text-primary" },
  paused: { label: "Paused", badge: "border-warning/40 bg-warning/10 text-warning" },
  ended: { label: "Ended", badge: "border-border bg-muted/20 text-muted-foreground" },
};

const noStats = { impressions: 0, completionRate: 0, ctr: 0 };

export const MOCK_ADS: AdItem[] = [
  {
    id: "ad-001",
    name: "Air Max Day — Run Free",
    advertiser: "Nike",
    caption: "Air Max Day is here. Lighter, faster, made to run free. 🏃",
    durationSecs: 15,
    ctaLabel: "Shop now",
    ctaUrl: "https://nike.com/airmax",
    regions: ["NA", "EU"],
    startsAt: "2026-09-15T00:00",
    endsAt: "2026-10-15T23:59",
    status: "live",
    stats: { impressions: 1_184_320, completionRate: 38, ctr: 1.4 },
  },
  {
    id: "ad-002",
    name: "Coke Summer Refresh",
    advertiser: "Coca-Cola",
    caption: "Summer tastes better ice-cold. Grab a Coke and refresh your day.",
    durationSecs: 20,
    ctaLabel: "Learn more",
    ctaUrl: "https://coca-cola.com/summer",
    regions: ["NA"],
    startsAt: "2026-09-10T00:00",
    endsAt: "2026-10-02T23:59",
    status: "live",
    stats: { impressions: 1_020_400, completionRate: 54, ctr: 0.9 },
  },
  {
    id: "ad-003",
    name: "Galaxy Fold — Unfold More",
    advertiser: "Samsung",
    caption: "Unfold more. The new Galaxy Fold, built for how you watch.",
    durationSecs: 30,
    ctaLabel: "Shop now",
    ctaUrl: "https://samsung.com/fold",
    regions: ["APAC"],
    startsAt: "2026-09-20T00:00",
    endsAt: "2026-10-20T23:59",
    status: "live",
    stats: { impressions: 640_780, completionRate: 47, ctr: 2.1 },
  },
  {
    id: "ad-004",
    name: "Stranger Worlds S5 Teaser",
    advertiser: "Netflix",
    caption: "The Upside Down is calling. Stranger Worlds S5 — streaming soon.",
    durationSecs: 25,
    ctaLabel: "Watch now",
    ctaUrl: "https://netflix.com/strangerworlds",
    regions: "all",
    startsAt: "2026-09-25T00:00",
    endsAt: "2026-10-10T23:59",
    status: "live",
    stats: { impressions: 890_150, completionRate: 66, ctr: 3.2 },
  },
  {
    id: "ad-005",
    name: "Wrapped Early Access",
    advertiser: "Spotify",
    caption: "Your year in music, early. Get Wrapped before anyone else.",
    durationSecs: 12,
    ctaLabel: "Install",
    ctaUrl: "https://spotify.com/wrapped",
    regions: ["EU", "LATAM"],
    startsAt: "2026-10-03T00:00",
    endsAt: "2026-10-31T23:59",
    status: "scheduled",
    stats: noStats,
  },
  {
    id: "ad-006",
    name: "Wings Energy Drop",
    advertiser: "Red Bull",
    caption: "New flavour, same wings. Try the Wings Energy Drop today.",
    durationSecs: 15,
    ctaLabel: "Learn more",
    ctaUrl: "https://redbull.com/wings",
    regions: ["NA"],
    startsAt: "2026-10-03T00:00",
    endsAt: "2026-10-18T23:59",
    status: "scheduled",
    stats: noStats,
  },
  {
    id: "ad-007",
    name: "Stay Anywhere — Autumn",
    advertiser: "Airbnb",
    caption: "Cosy cabins, city lofts, lakeside stays. Find your autumn escape.",
    durationSecs: 22,
    ctaLabel: "Learn more",
    ctaUrl: "https://airbnb.com/autumn",
    regions: ["EU"],
    startsAt: "2026-09-01T00:00",
    endsAt: "2026-10-12T23:59",
    status: "paused",
    stats: { impressions: 312_400, completionRate: 42, ctr: 0.7 },
  },
  {
    id: "ad-008",
    name: "Back to School Kicks",
    advertiser: "Nike",
    caption: "Fresh kicks for a fresh term. Shop Back to School now.",
    durationSecs: 15,
    ctaLabel: "Shop now",
    ctaUrl: "https://nike.com/school",
    regions: ["NA", "EU"],
    startsAt: "2026-08-10T00:00",
    endsAt: "2026-09-10T23:59",
    status: "ended",
    stats: { impressions: 1_812_900, completionRate: 51, ctr: 1.8 },
  },
];

export const getAdById = (id: string) => MOCK_ADS.find((a) => a.id === id);

// ── formatting ────────────────────────────────────────────────────────────

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const fmtDay = (d: Date) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;

export function fmtDateRange(startsAt: string, endsAt: string): string {
  return `${fmtDay(new Date(startsAt))} – ${fmtDay(new Date(endsAt))}`;
}

export function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${Math.round(n / 1_000)}K`;
  return n.toLocaleString();
}

export function regionsLabel(regions: AdItem["regions"]): string {
  if (regions === "all") return "All regions";
  return regions.map((r) => MACRO_REGIONS.find((m) => m.code === r)?.label ?? r).join(", ");
}

export interface AdAudience {
  uniqueReach: number;
  /** share of reached users by times seen (%), sums to 100 */
  frequency: { label: string; share: number }[];
  /** users who saw it 3+ times (%) — a sign of ad fatigue */
  seen3Plus: number;
  byRegion: { region: MacroRegion; impressions: number; share: number; ctr: number }[];
}

// relative audience size per macro-region (mock)
const REGION_WEIGHT: Record<MacroRegion, number> = { NA: 38, EU: 27, APAC: 19, LATAM: 10, MEA: 6 };

/** Mock audience breakdown for one ad, derived deterministically from its id and stats. */
export function adAudience(ad: AdItem): AdAudience {
  const seed = Number(ad.id.replace(/\D/g, "")) || 1;
  const avgFrequency = 1.2 + ((seed * 7) % 6) / 10; // 1.2 – 1.7
  const uniqueReach = Math.round(ad.stats.impressions / avgFrequency);

  // more repeat views as average frequency rises
  const twice = Math.round(14 + (avgFrequency - 1.2) * 20);
  const three = Math.round(5 + (avgFrequency - 1.2) * 10);
  const fourPlus = Math.round(2 + (avgFrequency - 1.2) * 8);
  const once = 100 - twice - three - fourPlus;

  const codes = ad.regions === "all" ? MACRO_REGIONS.map((r) => r.code) : ad.regions;
  const totalWeight = codes.reduce((sum, c) => sum + REGION_WEIGHT[c], 0);
  const byRegion = codes
    .map((region, i) => {
      const share = (REGION_WEIGHT[region] / totalWeight) * 100;
      return {
        region,
        impressions: Math.round((ad.stats.impressions * share) / 100),
        share: Math.round(share),
        ctr: Math.max(0.1, ad.stats.ctr + (((seed + i) % 5) - 2) * 0.2),
      };
    })
    .sort((a, b) => b.impressions - a.impressions);

  return {
    uniqueReach,
    frequency: [
      { label: "Seen once", share: once },
      { label: "Seen twice", share: twice },
      { label: "Seen 3 times", share: three },
      { label: "Seen 4+ times", share: fourPlus },
    ],
    seen3Plus: three + fourPlus,
    byRegion,
  };
}

export interface DailyImpressions {
  day: string; // chart label, e.g. "Sep 3"
  date: string; // YYYY-MM-DD
  impressions: number;
}

const isoDay = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * CSV export rows: one row per date with the tile metrics as columns. Mock — the per-day
 * reach/clicks/rates are derived from the period totals with a small deterministic wobble.
 */
export function dailyStatsCsv(
  daily: DailyImpressions[],
  totals: { impressions: number; uniqueReach: number; ctr: number; completionRate: number },
): (string | number)[][] {
  const reachRatio = totals.impressions ? totals.uniqueReach / totals.impressions : 0;
  return [
    ["Date", "Impressions", "Unique reach", "Clicks", "CTR %", "Completion rate %"],
    ...daily.map((d, i) => {
      const ctr = Math.max(0, totals.ctr + Math.sin(i * 2.1) * 0.2);
      const completion = Math.max(0, totals.completionRate + Math.sin(i * 1.4) * 2);
      return [
        d.date,
        d.impressions,
        Math.round(d.impressions * reachRatio),
        Math.round((d.impressions * ctr) / 100),
        ctr.toFixed(1),
        completion.toFixed(1),
      ];
    }),
  ];
}

/** Mock impressions per day over the flight so far (max 30 days), oldest first. */
export function dailyImpressions(ad: AdItem): DailyImpressions[] {
  const start = new Date(ad.startsAt);
  const end = new Date(ad.endsAt);
  const last = end < new Date() ? end : new Date();
  const dayOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.max(1, Math.min(30, Math.round((dayOf(last) - dayOf(start)) / 86_400_000) + 1));
  const perDay = ad.stats.impressions / days;
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(last.getFullYear(), last.getMonth(), last.getDate() - (days - 1 - i));
    // gentle deterministic wobble so the mock line isn't flat
    const wobble = 0.85 + 0.3 * Math.abs(Math.sin((i + ad.id.length) * 1.7));
    return { day: fmtDay(d), date: isoDay(d), impressions: Math.round(perDay * wobble) };
  });
}

// ── platform stats (spec-09) — mock, feed ads only ────────────────────────

/** Mock platform-wide numbers the ads data can't derive (reach, regions). */
export const MOCK_PLATFORM_STATS = {
  uniqueReach: 1_890_000,
  byRegion: [
    { region: "NA", share: 38, ctr: 1.6 },
    { region: "EU", share: 27, ctr: 1.4 },
    { region: "APAC", share: 19, ctr: 2.0 },
    { region: "LATAM", share: 10, ctr: 1.7 },
    { region: "MEA", share: 6, ctr: 1.2 },
  ] satisfies { region: MacroRegion; share: number; ctr: number }[],
};

/** Mock platform impressions per day for the last `days` days, oldest first. */
export function dailyPlatformImpressions(days = 30): DailyImpressions[] {
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - (days - 1 - i));
    const wobble = 0.75 + 0.5 * Math.abs(Math.sin(i * 1.3));
    return { day: fmtDay(d), date: isoDay(d), impressions: Math.round(160_000 * wobble) };
  });
}
