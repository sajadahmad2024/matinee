import type { MacroRegion } from "@/app/_libs/regions";

/** Region lens for per-format analytics: "all" or one of the 5 macro-regions. */
export type RegionKey = "all" | MacroRegion;

// Deterministic share of global activity per macro-region (APAC largest, MEA smallest —
// mirrors the dashboard's regional table). Mock-only until the API is wired.
export const REGION_FACTOR: Record<RegionKey, number> = {
  all: 1,
  APAC: 0.42,
  NA: 0.24,
  EU: 0.18,
  LATAM: 0.1,
  MEA: 0.06,
};

// Small per-region offset (in percentage points) so rates vary plausibly, not just counts.
const REGION_RATE_DELTA: Record<RegionKey, number> = {
  all: 0,
  APAC: 3,
  NA: 1,
  EU: -1,
  LATAM: -2,
  MEA: -4,
};

export function normalizeRegion(value?: string | null): RegionKey {
  const v = (value ?? "all").toUpperCase();
  return v === "NA" || v === "EU" || v === "APAC" || v === "LATAM" || v === "MEA"
    ? (v as MacroRegion)
    : "all";
}

export const scaleCount = (base: number, region: RegionKey): number =>
  Math.round(base * REGION_FACTOR[region]);

export const shiftRate = (base: number, region: RegionKey): number =>
  Math.min(100, Math.max(0, base + REGION_RATE_DELTA[region]));

/** Compact "12.5K" / "2.4M" formatting for scaled tile values. */
export function formatCompact(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}
