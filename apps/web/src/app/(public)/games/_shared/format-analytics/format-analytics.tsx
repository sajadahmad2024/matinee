"use client";

import { Globe } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { RegionBoxFilter, type RegionBoxMetric } from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { GAME_REGION_ALL, GAME_REGION_OPTIONS } from "../../_libs/game-config";
import type { GameRegion, GameRuleKey, ProposedFormatAnalyticsDto } from "../../_libs/game-types";
import { useGameFormatAnalytics } from "../../_libs/use-games";
import { DailyActivityCard } from "./daily-activity-card";
import { FormatStatCards } from "./format-stat-cards";
import { PeakHoursCard } from "./peak-hours-card";
import { PerformanceSummaryCard } from "./performance-summary-card";
import { PlayerRetentionCard } from "./player-retention-card";
import { RewardDistributionCard } from "./reward-distribution-card";

// Metric modes mirror the dashboard map's Activity / Points / Revenue, with matching hues.
const REGION_METRICS: {
  key: string;
  label: string;
  hue: number;
  field: keyof ProposedFormatAnalyticsDto["regional"];
}[] = [
  { key: "players", label: "Unique players", hue: 217, field: "uniquePlayers" },
  { key: "plays", label: "Total plays", hue: 142, field: "totalPlays" },
  { key: "points", label: "Points minted", hue: 270, field: "pointsMinted" },
];

interface FormatAnalyticsProps {
  ruleKey: GameRuleKey;
  region: GameRegion;
}

/** A format's Analytics tab: territory filter, headline stats and activity charts. */
export function FormatAnalytics({ ruleKey, region }: FormatAnalyticsProps) {
  const { formatAnalytics: data } = useGameFormatAnalytics({ ruleKey, region });

  if (!data) return <Skeleton className="bg-muted/20 h-[600px] w-full rounded-xl" />;

  const metrics: RegionBoxMetric[] = REGION_METRICS?.map(({ field, ...metric }) => ({
    ...metric,
    values: data.regional?.[field] ?? {},
  }));

  return (
    <div className="space-y-6">
      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <SectionHeading
          title="Territory-Specific Analytics"
          subtitle="Heat by players, plays, or points minted — click a region to filter"
          icon={Globe}
        />
        <RegionBoxFilter
          active={region}
          options={GAME_REGION_OPTIONS}
          allCode={GAME_REGION_ALL}
          metrics={metrics}
        />
      </section>
      <FormatStatCards stats={data} />
      <div className="grid gap-6 lg:grid-cols-2">
        <DailyActivityCard data={data.daily} />
        <PlayerRetentionCard data={data.retention} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <RewardDistributionCard tiers={data.rewardTiers} />
        <PeakHoursCard data={data.peakHours} />
        <PerformanceSummaryCard summary={data.summary} />
      </div>
    </div>
  );
}
