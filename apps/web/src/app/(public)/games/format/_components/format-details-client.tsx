"use client";

import { useState } from "react";

import { Gamepad2, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { FORMAT_CONFIGS, MOCK_GAME_INSTANCES } from "../constants";
import { DailyActivityChart } from "./analytics/daily-activity-chart";
import { GameStatsCards } from "./analytics/game-stats-cards";
import { PeakHoursChart } from "./analytics/peak-hours-chart";
import { PerformanceSummaryCard } from "./analytics/performance-summary-card";
import { PlayerRetentionChart } from "./analytics/player-retention-chart";
import { RewardDistributionCard } from "./analytics/reward-distribution-card";
import { FormatHeader } from "./format-header";
import { FormatTabs } from "./format-tabs";
import { CreateGameModal } from "./games/create-game-modal";
import { GameAnalyticsModal } from "./games/game-analytics-modal";
import { type GameInstance, GameInstancesList } from "./games/game-instances-list";
import { BasicInformationCard } from "./settings/basic-information-card";
import { LeaderboardRewardsCard } from "./settings/leaderboard-rewards-card";

interface FormatDetailsClientProps {
  id: string;
  tab: string;
}

export function FormatDetailsClient({ id, tab }: FormatDetailsClientProps) {
  const formatConfig = id ? FORMAT_CONFIGS[id] : null;
  const FormatIcon = formatConfig?.icon || Gamepad2;

  // --- Form State ---
  const [name, setName] = useState(formatConfig?.name || "");
  const [description, setDescription] = useState("Users predict what happens next in the video");
  const [devId, setDevId] = useState("game_predict_v1");
  const [enableDefaultRewards, setEnableDefaultRewards] = useState(true);
  const [topPlayersToReward, setTopPlayersToReward] = useState(3);
  const [bonusPoints, setBonusPoints] = useState(100);

  // --- Modal Visibility State ---
  const [createGameOpen, setCreateGameOpen] = useState(false);
  const [gameAnalyticsOpen, setGameAnalyticsOpen] = useState(false);
  const [selectedGame, setSelectedGame] = useState<GameInstance | null>(null);

  const handleOpenGameAnalytics = (game: GameInstance) => {
    setSelectedGame(game);
    setGameAnalyticsOpen(true);
  };

  return (
    <div className="space-y-6">
      <FormatHeader
        name={name}
        isNew={false}
        onSave={() => toast.success("Game format saved successfully")}
        formatIcon={FormatIcon}
      />

      <FormatTabs defaultTab={tab} gameCount={MOCK_GAME_INSTANCES.length}>
        {{
          settings: (
            <div className="grid gap-6 lg:grid-cols-2">
              <BasicInformationCard
                name={name}
                setName={setName}
                description={description}
                setDescription={setDescription}
                devId={devId}
                setDevId={setDevId}
              />
              <LeaderboardRewardsCard
                enableDefaultRewards={enableDefaultRewards}
                setEnableDefaultRewards={setEnableDefaultRewards}
                topPlayersToReward={topPlayersToReward}
                setTopPlayersToReward={setTopPlayersToReward}
                bonusPoints={bonusPoints}
                setBonusPoints={setBonusPoints}
              />
            </div>
          ),
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
                <PerformanceSummaryCard
                  activeGamesCount={MOCK_GAME_INSTANCES.filter((g) => g.status === "active").length}
                />
              </div>
            </div>
          ),
          games: (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-foreground text-lg font-semibold">Games Using This Format</h3>
                  <p className="text-muted-foreground text-sm">
                    {MOCK_GAME_INSTANCES.length} games created with{" "}
                    {formatConfig?.name || "this format"}
                  </p>
                </div>
                <Button onClick={() => setCreateGameOpen(true)} className="gap-2">
                  <Trophy className="h-4 w-4" />
                  Create Game
                </Button>
              </div>
              <GameInstancesList
                gameInstances={MOCK_GAME_INSTANCES}
                formatIcon={FormatIcon}
                onOpenAnalytics={handleOpenGameAnalytics}
                onViewVideo={() => {}}
              />
            </div>
          ),
        }}
      </FormatTabs>

      <CreateGameModal
        open={createGameOpen}
        onOpenChange={setCreateGameOpen}
        formatConfig={formatConfig}
        formatId={id}
        FormatIcon={FormatIcon}
      />

      <GameAnalyticsModal
        open={gameAnalyticsOpen}
        onOpenChange={setGameAnalyticsOpen}
        game={selectedGame}
      />
    </div>
  );
}
