"use client";

import { Gamepad2 } from "lucide-react";
import { toast } from "sonner";

import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { type GameTypeSlug, getGameType } from "../../_config/game-types";
import { GlassCard } from "../../_components/glass-card";
import { DailyActivityChart } from "./analytics/daily-activity-chart";
import { GameStatsCards } from "./analytics/game-stats-cards";
import { PeakHoursChart } from "./analytics/peak-hours-chart";
import { PerformanceSummaryCard } from "./analytics/performance-summary-card";
import { PlayerRetentionChart } from "./analytics/player-retention-chart";
import { normalizeRegion } from "./analytics/region-scale";
import { RewardDistributionCard } from "./analytics/reward-distribution-card";
import { FormatHeader } from "./format-header";
import { FormatTabs } from "./format-tabs";
import { RegionFilter } from "./region-filter";
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
              <div className="flex items-center justify-end gap-3">
                <span className="text-muted-foreground text-xs">
                  Territory-specific analytics
                </span>
                <RegionFilter defaultValue={regionKey} />
              </div>
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
