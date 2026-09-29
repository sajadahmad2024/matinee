// Ads Management (spec-07) — mock data + shared types. UI-only; nothing is persisted.

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

export type AdStatus = "scheduled" | "live" | "paused" | "ended";

export interface AdItem {
  id: string;
  name: string;
  advertiser: string;
  videoUrl?: string;
  durationSecs: number;
  ctaLabel: string;
  ctaUrl: string;
  frequency: number; // every N reels
  regions: "all" | MacroRegion[];
  startsAt: string; // local "YYYY-MM-DDTHH:MM"
  endsAt: string;
  status: AdStatus;
  stats: { impressions: number; completionRate: number; ctr: number };
}

export interface FeedRules {
  minGap: number;
  maxPerUserDay: number;
}

export const DEFAULT_FEED_RULES: FeedRules = { minGap: 5, maxPerUserDay: 15 };

export const CTA_LABELS = ["Learn more", "Shop now", "Install", "Watch now"];

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
    durationSecs: 15,
    ctaLabel: "Shop now",
    ctaUrl: "https://nike.com/airmax",
    frequency: 6,
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
    durationSecs: 20,
    ctaLabel: "Learn more",
    ctaUrl: "https://coca-cola.com/summer",
    frequency: 8,
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
    durationSecs: 30,
    ctaLabel: "Shop now",
    ctaUrl: "https://samsung.com/fold",
    frequency: 10,
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
    durationSecs: 25,
    ctaLabel: "Watch now",
    ctaUrl: "https://netflix.com/strangerworlds",
    frequency: 7,
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
    durationSecs: 12,
    ctaLabel: "Install",
    ctaUrl: "https://spotify.com/wrapped",
    frequency: 9,
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
    durationSecs: 15,
    ctaLabel: "Learn more",
    ctaUrl: "https://redbull.com/wings",
    frequency: 6,
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
    durationSecs: 22,
    ctaLabel: "Learn more",
    ctaUrl: "https://airbnb.com/autumn",
    frequency: 12,
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
    durationSecs: 15,
    ctaLabel: "Shop now",
    ctaUrl: "https://nike.com/school",
    frequency: 7,
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

/** Mock impressions per day over the flight so far (max 30 days), oldest first. */
export function dailyImpressions(ad: AdItem): { day: string; impressions: number }[] {
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
    return { day: fmtDay(d), impressions: Math.round(perDay * wobble) };
  });
}
