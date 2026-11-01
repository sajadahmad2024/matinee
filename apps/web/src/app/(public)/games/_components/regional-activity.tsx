"use client";

import { Globe } from "lucide-react";

import { RegionBoxFilter, type RegionBoxMetric } from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { GAME_REGION_ALL, GAME_REGION_OPTIONS } from "../_libs/game-config";
import type { GameRegion, ProposedGamesRegionalActivityDto } from "../_libs/game-types";
import { useGamesRegionalActivity } from "../_libs/use-games";
import { RegionalActivitySkeleton } from "./games-skeletons";

// "Playing now" leads — Ryan: the dashboard's playing-games figure, per region.
const METRICS: {
  key: string;
  label: string;
  hue: number;
  field: keyof ProposedGamesRegionalActivityDto;
}[] = [
  { key: "playing", label: "Playing now", hue: 217, field: "playingNow" },
  { key: "players", label: "Active players (7d)", hue: 142, field: "activePlayers" },
  { key: "points", label: "Points minted", hue: 270, field: "pointsMinted" },
];

interface RegionalActivityProps {
  timeRange: string;
  region: GameRegion;
}

/** Regional lens — clicking a region scopes the tiles above and the format rows below. */
export function RegionalActivity({ timeRange, region }: RegionalActivityProps) {
  const { regionalActivity } = useGamesRegionalActivity({ timeRange });

  const metrics: RegionBoxMetric[] = METRICS?.map(({ field, ...metric }) => ({
    ...metric,
    values: regionalActivity?.[field] ?? {},
  }));

  return (
    <section className="border-border bg-card space-y-3 rounded-xl border p-4">
      <SectionHeading
        title="Regional Activity"
        subtitle="Heat by players in game, active players, or points minted — click a region to scope"
        icon={Globe}
      />
      {regionalActivity ? (
        <RegionBoxFilter
          active={region}
          options={GAME_REGION_OPTIONS}
          allCode={GAME_REGION_ALL}
          metrics={metrics}
        />
      ) : (
        <RegionalActivitySkeleton />
      )}
    </section>
  );
}
