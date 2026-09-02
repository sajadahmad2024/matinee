import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Award, TrendingUp, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GameFormatsLibrary } from "./_components/game-formats-library";
import { GameTrends } from "./_components/game-trends";
import { MasterAnalytics } from "./_components/master-analytics";
import { TimeRangeSelector } from "./_components/time-range-selector";

// Types for search params
export type GameManagementSearchParams = {
  timeRange?: string;
};

interface PageProps {
  searchParams: Promise<GameManagementSearchParams>;
}

/**
 * ONE scrollable surface (client rejected tab-first navigation): master analytics boxes →
 * game format rows → trends & economy. Badges / Leaderboards / Leveling live on sub-routes.
 */
export default async function GameManagementPage({ searchParams }: PageProps) {
  const { timeRange = "7d" } = await searchParams;

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
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/games/leaderboards" as Route}>
              <Trophy className="h-4 w-4" />
              Leaderboards
            </Link>
          </Button>
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/games/leveling" as Route}>
              <TrendingUp className="h-4 w-4" />
              Leveling
            </Link>
          </Button>
        </div>
      </div>

      {/* Master analytics — 4 boxes across all games */}
      <MasterAnalytics timeRange={timeRange} />

      {/* Game format rows — Daily Streak, Weekly Quests, Shared Content, Predictive */}
      <GameFormatsLibrary />

      {/* Trends & Economy — scroll-reachable, no tab */}
      <Suspense fallback={<div className="bg-muted/20 h-[400px] w-full animate-pulse rounded-xl" />}>
        <GameTrends timeRange={timeRange} />
      </Suspense>
    </div>
  );
}
