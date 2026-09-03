"use client";

import { Coins, Gamepad2, Target, Users } from "lucide-react";

import { StatTile } from "@/components/custom/stat-tile";

import {
  REGION_FACTOR,
  type RegionKey,
  formatCompact,
  scaleCount,
  shiftRate,
} from "../format/_components/analytics/region-scale";

/**
 * Master analytics — the "3–4 boxes, master on all games" the client asked for.
 * ⚠️ Metric choice is a GeekyAnts proposal pending client sign-off (product-context §4.1).
 * Scoped by the master-page region grid (spec-05 §2.1).
 */
interface MasterAnalyticsProps {
  timeRange?: string;
  region?: RegionKey;
  /** Region display name, appended to tile labels when scoped. */
  regionLabel?: string;
}

// Global baselines — every regional figure is a deterministic scale of these.
const BASE = {
  activePlayers: 24400,
  pointsMinted: 890000,
  pointsSpent: 512000,
  participationPct: 68,
  completionPct: 78,
  byFormat: {
    "Daily Streak": 12800,
    "Weekly Quests": 8400,
    "Shared Content": 5200,
    Predictive: 6100,
  } as Record<string, number>,
};

export function MasterAnalytics({
  timeRange = "7d",
  region = "all",
  regionLabel,
}: MasterAnalyticsProps) {
  // Mock — replace with API data scoped to timeRange later.
  void timeRange;

  const suffix = regionLabel ? ` — ${regionLabel}` : "";
  const minted = scaleCount(BASE.pointsMinted, region);
  const spent = scaleCount(BASE.pointsSpent, region);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label={`Active Players (7d)${suffix}`}
        value={formatCompact(scaleCount(BASE.activePlayers, region))}
        icon={Users}
        accent="accent"
        trend={{ direction: "up", label: "+6.1%" }}
        sparkline={[18.2, 19.4, 20.1, 21.8, 22.6, 23.5, 24.4].map((v) => v * REGION_FACTOR[region])}
      />
      <StatTile
        label="Participation by Format"
        value={`${shiftRate(BASE.participationPct, region)}%`}
        icon={Gamepad2}
        accent="primary"
        subStats={Object.entries(BASE.byFormat).map(([label, value]) => ({
          label,
          value: formatCompact(scaleCount(value, region)),
        }))}
      />
      <StatTile
        label="Points Economy"
        value={`${formatCompact(minted)} minted`}
        icon={Coins}
        accent="warning"
        subStats={[
          { label: "Points spent", value: formatCompact(spent), accent: "success" },
          { label: "Net outstanding", value: `+${formatCompact(minted - spent)}` },
        ]}
      />
      <StatTile
        label="Completion Rate"
        value={`${shiftRate(BASE.completionPct, region)}%`}
        icon={Target}
        accent="success"
        trend={{ direction: "up", label: "+2.3%" }}
      />
    </div>
  );
}
