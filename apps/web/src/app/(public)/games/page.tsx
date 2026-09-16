import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Award, Gamepad2, Globe, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MACRO_REGIONS, regionLabel } from "@/app/_libs/regions";
import {
  RegionBoxFilter,
  type RegionBoxMetric,
  type RegionBoxOption,
} from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { GameFormatsLibrary } from "./_components/game-formats-library";
import { GameTrends } from "./_components/game-trends";
import { MasterAnalytics } from "./_components/master-analytics";
import { TimeRangeSelector } from "./_components/time-range-selector";
import { REGION_FACTOR, normalizeRegion } from "./format/_components/analytics/region-scale";

// Types for search params
export type GameManagementSearchParams = {
  timeRange?: string;
  region?: string;
};

const REGION_BOXES: RegionBoxOption[] = [
  { code: "all", label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ code: r.code, label: r.label })),
];

const byRegion = (base: number) => ({
  all: base,
  ...Object.fromEntries(
    MACRO_REGIONS.map((r) => [r.code, Math.round(base * REGION_FACTOR[r.code])]),
  ),
});

// "Playing now" leads — Ryan: the dashboard's playing-games figure, per region.
const REGION_METRICS: RegionBoxMetric[] = [
  { key: "playing", label: "Playing now", hue: 217, values: byRegion(3847) },
  { key: "players", label: "Active players (7d)", hue: 142, values: byRegion(24400) },
  { key: "points", label: "Points minted", hue: 270, values: byRegion(890000) },
];

interface PageProps {
  searchParams: Promise<GameManagementSearchParams>;
}

/**
 * ONE scrollable surface (client rejected tab-first navigation): master analytics boxes →
 * game format rows → trends & economy. Badges / Leaderboards live on sub-routes.
 * Leveling was removed in spec-05 §2.2 — the platform does not level users up; lifetime
 * points are a backend badge trigger only.
 */
export default async function GameManagementPage({ searchParams }: PageProps) {
  const { timeRange = "7d", region: regionParam } = await searchParams;
  const region = normalizeRegion(regionParam);
  const scopeLabel = region === "all" ? undefined : regionLabel(region);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Game Management</h1>
          <p className="text-foreground-secondary mt-1">
            Manage game mechanics, progression, and achievements.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Suspense fallback={<div className="bg-muted h-10 w-[140px] animate-pulse rounded-md" />}>
            <TimeRangeSelector defaultValue={timeRange} />
          </Suspense>
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/games/badges" as Route}>
              <Award className="h-4 w-4" />
              Badges
            </Link>
          </Button>
        </div>
      </div>

      {/* Leaderboards get their own row above the analytics — the client reads them as a
          destination of their own, not as one more header button. */}
      <section className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
        <div className="flex items-center gap-3">
          <span className="bg-warning/10 flex h-9 w-9 items-center justify-center rounded-lg">
            <Trophy className="text-warning h-5 w-5" />
          </span>
          <div>
            <p className="text-foreground text-sm font-semibold">Leaderboards</p>
            <p className="text-muted-foreground text-xs">
              Which games are pulling players, and who is on top across the platform
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/games/leaderboards?subtab=instances" as Route}>
              <Gamepad2 className="h-4 w-4" />
              Top Games
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/games/leaderboards?subtab=hall-of-fame" as Route}>
              <Users className="h-4 w-4" />
              Top Players
            </Link>
          </Button>
        </div>
      </section>

      {/* Master analytics — 4 boxes across all games */}
      <MasterAnalytics timeRange={timeRange} region={region} regionLabel={scopeLabel} />

      {/* Regional lens — scopes the tiles above and the format rows below (spec-05 §2.1) */}
      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <SectionHeading
          title="Regional Activity"
          subtitle="Heat by players in game, active players, or points minted — click a region to scope"
          icon={Globe}
        />
        <Suspense
          fallback={<div className="bg-muted/10 h-[130px] w-full animate-pulse rounded-lg" />}>
          <RegionBoxFilter
            active={region}
            options={REGION_BOXES}
            allCode="all"
            metrics={REGION_METRICS}
          />
        </Suspense>
      </section>

      {/* Game format rows — Daily Streak, Weekly Quests, Shared Content, Predictive */}
      <GameFormatsLibrary region={region} />

      {/* Trends & Economy — scroll-reachable, no tab */}
      <Suspense
        fallback={<div className="bg-muted/20 h-[400px] w-full animate-pulse rounded-xl" />}>
        <GameTrends timeRange={timeRange} />
      </Suspense>
    </div>
  );
}
