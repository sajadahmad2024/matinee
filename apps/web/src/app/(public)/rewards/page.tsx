import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Globe, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";
import {
  RegionBoxFilter,
  type RegionBoxMetric,
  type RegionBoxOption,
} from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { ExperiencesSection } from "./_components/experiences-section";
import { RewardsAnalytics } from "./_components/rewards-analytics";
import { UnlockContentSection } from "./_components/unlock-content-section";
import { rewardsAnalyticsForRegion } from "./constants";

export type RewardsSearchParams = {
  region?: string;
};

interface PageProps {
  searchParams: Promise<RewardsSearchParams>;
}

const REGION_CODES = new Set(["NA", "EU", "APAC", "LATAM", "MEA"]);

const REGION_BOXES: RegionBoxOption[] = [
  { code: "global", label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ code: r.code, label: r.label })),
];

const REGION_KEYS = ["global", ...MACRO_REGIONS.map((r) => r.code)] as const;

/** Per-region values for one rewards metric — same numbers the tiles below scale to. */
const valuesBy = (pick: (a: ReturnType<typeof rewardsAnalyticsForRegion>) => number) =>
  Object.fromEntries(
    REGION_KEYS.map((k) => [k, pick(rewardsAnalyticsForRegion(k as "global" | MacroRegion))]),
  );

// Metric modes mirror the dashboard map's Activity / Points / Revenue, with matching hues.
const REGION_METRICS: RegionBoxMetric[] = [
  { key: "bidders", label: "Active bidders", hue: 217, values: valuesBy((a) => a.activeBidders) },
  {
    key: "points",
    label: "Points redeemed",
    hue: 270,
    values: valuesBy((a) => a.pointsRedeemed),
  },
  {
    key: "topbid",
    label: "Top winning bid",
    hue: 142,
    values: valuesBy((a) => a.topWinningBid),
  },
];

// Single scrollable master page: analytics → regional lens → unlock content → experiences.
export default async function RewardsPage({ searchParams }: PageProps) {
  const { region: regionParam = "global" } = await searchParams;
  const region: "global" | MacroRegion = REGION_CODES.has(regionParam)
    ? (regionParam as MacroRegion)
    : "global";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Rewards</h1>
          <p className="text-foreground-secondary mt-1">
            Points-gated content and bidding for experiences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="gap-2">
            <Link href={"/rewards/experience/new" as Route}>
              <Plus className="h-4 w-4" />
              New Experience
            </Link>
          </Button>
        </div>
      </div>

      {/* Regional lens — the dashboard's activity-map UI, scoping everything below */}
      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <SectionHeading
          title="Regional Activity"
          subtitle="Heat by bidders, points redeemed, or top winning bid — click a region to filter"
          icon={Globe}
        />
        <Suspense
          fallback={<div className="bg-muted/10 h-[130px] w-full animate-pulse rounded-lg" />}>
          <RegionBoxFilter
            active={region}
            options={REGION_BOXES}
            allCode="global"
            metrics={REGION_METRICS}
          />
        </Suspense>
      </section>

      {/* Master analytics — 4 boxes (⚠️ metrics pending client sign-off) */}
      <RewardsAnalytics region={region} />

      {/* Section 1 — Unlock Content (configured in Content Management; tracked here) */}
      <UnlockContentSection region={region} />

      {/* Section 2 — Bidding for Experiences */}
      <ExperiencesSection region={region} />
    </div>
  );
}
