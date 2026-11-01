"use client";

import { TrendingUp } from "lucide-react";

import { SectionHeading } from "@/components/custom/section-heading";

import { useGamesTrends } from "../_libs/use-games";
import { GameTrendsSkeleton } from "./games-skeletons";
import { EconomyCard } from "./trends/economy-card";
import { GameplayVelocityCard } from "./trends/gameplay-velocity-card";
import { TopGamesCard } from "./trends/top-games-card";
import { WinLossCard } from "./trends/win-loss-card";

/** Trends & Economy — the former Overview charts, scroll-reachable below the format rows. */
export function GameTrends({ timeRange }: { timeRange: string }) {
  const { trends } = useGamesTrends({ timeRange });

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Trends & Economy"
        subtitle="Gameplay velocity, win/loss balance and the points economy across all formats"
        icon={TrendingUp}
      />
      {trends ? (
        <>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <GameplayVelocityCard data={trends.velocity} />
            <WinLossCard data={trends.winLoss} />
          </div>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <TopGamesCard games={trends.topGames} />
            <EconomyCard pointsMinted={trends.pointsMinted} pointsSpent={trends.pointsSpent} />
          </div>
        </>
      ) : (
        <GameTrendsSkeleton />
      )}
    </div>
  );
}
