"use client";

import { Gamepad2, Globe } from "lucide-react";
import { toast } from "sonner";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { MACRO_REGIONS } from "@/app/_libs/regions";
import {
  RegionBoxFilter,
  type RegionBoxMetric,
  type RegionBoxOption,
} from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { GlassCard } from "../../_components/glass-card";
import { type GameTypeSlug, getGameType } from "../../_config/game-types";
import { DailyActivityChart } from "./analytics/daily-activity-chart";
import { GameStatsCards } from "./analytics/game-stats-cards";
import { PeakHoursChart } from "./analytics/peak-hours-chart";
import { PerformanceSummaryCard } from "./analytics/performance-summary-card";
import { PlayerRetentionChart } from "./analytics/player-retention-chart";
import { REGION_FACTOR, normalizeRegion } from "./analytics/region-scale";
import { RewardDistributionCard } from "./analytics/reward-distribution-card";
import { FormatHeader } from "./format-header";
import { FormatTabs } from "./format-tabs";
import { DailyStreakSettings } from "./types/daily-streak";
import { PredictiveSettings } from "./types/predictive";
import { QuestsSettings } from "./types/quests";
import { SharedContentSettings } from "./types/shared-content";

interface FormatDetailsClientProps {
  id: string;
  tab: string;
  region?: string;
}

/** Per-type Settings view (former Gamification content is merged in; Analytics is shared). */
// Bidding lives in the Rewards module (see spec-03), not in games.
// Same bases the Analytics tiles scale, so the boxes agree with the tiles below them.
const BASE = { uniquePlayers: 45200, totalPlays: 128500, pointsMinted: 2400000 };

const REGION_BOXES: RegionBoxOption[] = [
  { code: "all", label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ code: r.code, label: r.label })),
];

const valuesBy = (base: number) => ({
  all: base,
  ...Object.fromEntries(
    MACRO_REGIONS.map((r) => [r.code, Math.round(base * REGION_FACTOR[r.code])]),
  ),
});

// Metric modes mirror the dashboard map's Activity / Points / Revenue, with matching hues.
const REGION_METRICS: RegionBoxMetric[] = [
  { key: "players", label: "Unique players", hue: 217, values: valuesBy(BASE.uniquePlayers) },
  { key: "plays", label: "Total plays", hue: 142, values: valuesBy(BASE.totalPlays) },
  { key: "points", label: "Points minted", hue: 270, values: valuesBy(BASE.pointsMinted) },
];

const TYPE_VIEWS: Record<GameTypeSlug, { Settings: React.ComponentType }> = {
  "daily-streak": { Settings: DailyStreakSettings },
  quests: { Settings: QuestsSettings },
  "shared-content": { Settings: SharedContentSettings },
  predictive: { Settings: PredictiveSettings },
};

export function FormatDetailsClient({ id, tab, region }: FormatDetailsClientProps) {
  const gameType = getGameType(id);
  const regionKey = normalizeRegion(region);

  if (!gameType) {
    return (
      <GlassCard>
        <CardHeader>
          <CardTitle>Unknown game type</CardTitle>
          <CardDescription>“{id}” is not a recognized game type.</CardDescription>
        </CardHeader>
      </GlassCard>
    );
  }

  const Icon = gameType.icon ?? Gamepad2;
  const { Settings } = TYPE_VIEWS[gameType.slug];

  return (
    <div className="space-y-6">
      <FormatHeader
        name={gameType.name}
        isNew={false}
        onSave={() => toast.success(`${gameType.name} settings saved`)}
        formatIcon={Icon}
      />

      <FormatTabs defaultTab={tab}>
        {{
          settings: <Settings />,
          analytics: (
            <div className="space-y-6">
              <section className="border-border bg-card space-y-3 rounded-xl border p-4">
                <SectionHeading
                  title="Territory-Specific Analytics"
                  subtitle="Heat by players, plays, or points minted — click a region to filter"
                  icon={Globe}
                />
                <RegionBoxFilter
                  active={regionKey}
                  options={REGION_BOXES}
                  allCode="all"
                  metrics={REGION_METRICS}
                />
              </section>
              <GameStatsCards region={regionKey} />
              <div className="grid gap-6 lg:grid-cols-2">
                <DailyActivityChart region={regionKey} />
                <PlayerRetentionChart region={regionKey} />
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <RewardDistributionCard region={regionKey} />
                <PeakHoursChart region={regionKey} />
                <PerformanceSummaryCard
                  activeGamesCount={gameType.activeInstances}
                  region={regionKey}
                />
              </div>
            </div>
          ),
        }}
      </FormatTabs>
    </div>
  );
}
