import { Suspense } from "react";

import type { Metadata } from "next";
import Link from "next/link";

import { Award } from "lucide-react";

import { Button } from "@/components/ui/button";

import { PageHeader } from "@/components/custom/page-header";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { GameFormatRows } from "./_components/game-format-rows";
import { GameTrends } from "./_components/game-trends";
import { RegionalActivitySkeleton } from "./_components/games-skeletons";
import { LeaderboardsEntryRow } from "./_components/leaderboards-entry-row";
import { MasterAnalytics } from "./_components/master-analytics";
import { RegionalActivity } from "./_components/regional-activity";
import { GAME_ROUTES, parseGameRegion } from "./_libs/game-config";

export const metadata: Metadata = {
  title: "Game Management",
  description: "Game formats, their analytics, badges and leaderboards.",
};

const DEFAULT_TIME_RANGE = "7d";

interface GameManagementPageProps {
  searchParams: Promise<{ timeRange?: string; region?: string }>;
}

/**
 * ONE scrollable surface (client rejected tab-first navigation): master analytics boxes →
 * regional lens → game format rows → trends & economy. Badges / Leaderboards live on sub-routes.
 * Leveling was removed in spec-05 §2.2 — the platform does not level users up.
 */
export default async function GameManagementPage({ searchParams }: GameManagementPageProps) {
  const { timeRange = DEFAULT_TIME_RANGE, region: regionParam } = await searchParams;
  const region = parseGameRegion(regionParam);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Game Management"
        subtitle="Manage game mechanics, progression, and achievements."
        className="sm:items-center"
        actions={
          <>
            <Suspense
              fallback={<div className="bg-muted h-10 w-[140px] animate-pulse rounded-md" />}>
              <TimeRangeSelector defaultValue={timeRange} />
            </Suspense>
            <Button asChild variant="outline" className="gap-2">
              <Link href={GAME_ROUTES.BADGES}>
                <Award className="h-4 w-4" />
                Badges
              </Link>
            </Button>
          </>
        }
      />

      <LeaderboardsEntryRow />

      <MasterAnalytics timeRange={timeRange} region={region} />

      {/* Regional lens — scopes the tiles above (spec-05 §2.1) */}
      <Suspense fallback={<RegionalActivitySkeleton />}>
        <RegionalActivity timeRange={timeRange} region={region} />
      </Suspense>

      <GameFormatRows />

      <GameTrends timeRange={timeRange} />
    </div>
  );
}
