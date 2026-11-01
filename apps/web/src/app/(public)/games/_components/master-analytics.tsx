"use client";

import { Coins, Gamepad2, Target, Users } from "lucide-react";

import { regionLabel } from "@/app/_libs/regions";
import { formatCount } from "@/app/_libs/utils/format";
import { StatTile } from "@/components/custom/stat-tile";

import { GAME_FORMAT_LIST, GAME_REGION_ALL, formatTrendPct } from "../_libs/game-config";
import type { GameRegion } from "../_libs/game-types";
import { useGamesOverview } from "../_libs/use-games";
import { MasterAnalyticsSkeleton } from "./games-skeletons";

interface MasterAnalyticsProps {
  timeRange: string;
  region: GameRegion;
}

const trendOf = (pct: number) => ({
  direction: pct >= 0 ? ("up" as const) : ("down" as const),
  label: formatTrendPct(pct),
});

/**
 * Master analytics — the "3–4 boxes, master on all games" the client asked for, scoped by the
 * region grid (spec-05 §2.1).
 * ⚠️ Metric choice is a GeekyAnts proposal pending client sign-off (product-context §4.1).
 */
export function MasterAnalytics({ timeRange, region }: MasterAnalyticsProps) {
  const { overview } = useGamesOverview({ timeRange, region });
  if (!overview) return <MasterAnalyticsSkeleton />;

  const suffix = region === GAME_REGION_ALL ? "" : ` — ${regionLabel(region)}`;
  const { pointsMinted, pointsSpent } = overview;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label={`Active Players (7d)${suffix}`}
        value={formatCount(overview.activePlayers)}
        icon={Users}
        accent="accent"
        trend={trendOf(overview.activePlayersTrendPct)}
        sparkline={overview.activePlayersSeries}
      />
      <StatTile
        label="Participation by Format"
        value={`${overview.participationPct}%`}
        icon={Gamepad2}
        accent="primary"
        subStats={GAME_FORMAT_LIST?.map((format) => ({
          label: format.name,
          value: formatCount(overview.formats?.[format.ruleKey]?.participants),
        }))}
      />
      <StatTile
        label="Points Economy"
        value={`${formatCount(pointsMinted)} minted`}
        icon={Coins}
        accent="warning"
        subStats={[
          { label: "Points spent", value: formatCount(pointsSpent), accent: "success" },
          { label: "Net outstanding", value: `+${formatCount(pointsMinted - pointsSpent)}` },
        ]}
      />
      <StatTile
        label="Completion Rate"
        value={`${overview.completionPct}%`}
        icon={Target}
        accent="success"
        trend={trendOf(overview.completionTrendPct)}
      />
    </div>
  );
}
