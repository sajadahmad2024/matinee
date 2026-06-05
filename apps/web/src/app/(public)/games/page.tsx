import { Suspense } from "react";

import { BadgeManagement } from "./_components/badge-management";
import { GameAnalytics } from "./_components/game-analytics";
import { GameFormatsLibrary } from "./_components/game-formats-library";
import { GameTabs } from "./_components/game-tabs";
import { GlobalLeaderboards } from "./_components/global-leaderboards";
import { LevelingConfiguration } from "./_components/leveling-configuration";
import { TimeRangeSelector } from "./_components/time-range-selector";

// Types for search params
export type GameCenterSearchParams = {
  timeRange?: string;
  tab?: string;
};

interface PageProps {
  searchParams: Promise<GameCenterSearchParams>;
}

export default async function GameCenterPage({ searchParams }: PageProps) {
  const { timeRange = "7d", tab = "formats" } = await searchParams;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Game Center</h1>
          <p className="text-foreground-secondary mt-1">
            Manage game mechanics, progression, and achievements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="bg-muted h-10 w-[140px] animate-pulse rounded-md" />}>
            <TimeRangeSelector defaultValue={timeRange} />
          </Suspense>
        </div>
      </div>

      {/* Tabs Section */}
      <GameTabs defaultTab={tab}>
        {{
          formats: <GameFormatsLibrary />,
          leveling: <LevelingConfiguration />,
          badges: <BadgeManagement />,
          leaderboards: <GlobalLeaderboards />,
        }}
      </GameTabs>

      {/* Analytics Section */}
      <Suspense
        fallback={<div className="bg-muted/20 h-[400px] w-full animate-pulse rounded-xl" />}>
        <GameAnalytics timeRange={timeRange} />
      </Suspense>
    </div>
  );
}
