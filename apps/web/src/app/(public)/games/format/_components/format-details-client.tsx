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
import { RewardDistributionCard } from "./analytics/reward-distribution-card";
import { FormatHeader } from "./format-header";
import { FormatTabs } from "./format-tabs";
import { BiddingGamification, BiddingSettings } from "./types/bidding";
import { DailyStreakGamification, DailyStreakSettings } from "./types/daily-streak";
import { PredictiveGamification, PredictiveSettings } from "./types/predictive";
import { QuestsGamification, QuestsSettings } from "./types/quests";
import { SharedContentGamification, SharedContentSettings } from "./types/shared-content";

interface FormatDetailsClientProps {
  id: string;
  tab: string;
}

/** Per-type Settings + Gamification views (Analytics is shared). */
const TYPE_VIEWS: Record<
  GameTypeSlug,
  { Settings: React.ComponentType; Gamification: React.ComponentType }
> = {
  "daily-streak": { Settings: DailyStreakSettings, Gamification: DailyStreakGamification },
  quests: { Settings: QuestsSettings, Gamification: QuestsGamification },
  "shared-content": { Settings: SharedContentSettings, Gamification: SharedContentGamification },
  predictive: { Settings: PredictiveSettings, Gamification: PredictiveGamification },
  bidding: { Settings: BiddingSettings, Gamification: BiddingGamification },
};

export function FormatDetailsClient({ id, tab }: FormatDetailsClientProps) {
  const gameType = getGameType(id);

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
  const { Settings, Gamification } = TYPE_VIEWS[gameType.slug];

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
          gamification: <Gamification />,
          analytics: (
            <div className="space-y-6">
              <GameStatsCards />
              <div className="grid gap-6 lg:grid-cols-2">
                <DailyActivityChart />
                <PlayerRetentionChart />
              </div>
              <div className="grid gap-6 lg:grid-cols-3">
                <RewardDistributionCard />
                <PeakHoursChart />
                <PerformanceSummaryCard activeGamesCount={gameType.activeInstances} />
              </div>
            </div>
          ),
        }}
      </FormatTabs>
    </div>
  );
}
