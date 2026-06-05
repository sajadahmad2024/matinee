import type { Route } from "next";
import Link from "next/link";

import { Flame, Gamepad2, Play, Plus, Settings, Target, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { GlassCard } from "./glass-card";

// Types/Interfaces - Can be moved to a shared types file later
export interface GameFormatRewardConfig {
  topPlayers: number;
  bonusPoints: number;
}

export interface GameFormat {
  id: string;
  name: string;
  description: string;
  devId: string;
  iconType: "target" | "flame" | "trophy"; // Use strings for serializability
  activeInstances: number;
  totalPlays: number;
  defaultRewards: boolean;
  defaultRewardConfig?: GameFormatRewardConfig;
}

const ICON_MAP = {
  target: <Target className="h-6 w-6" />,
  flame: <Flame className="h-6 w-6" />,
  trophy: <Trophy className="h-6 w-6" />,
};

// Mock data (Simulating future API response)
const mockFormats: GameFormat[] = [
  {
    id: "1",
    name: "Predict Outcome",
    description: "Users predict what happens next in the video",
    devId: "game_predict_v1",
    iconType: "target",
    activeInstances: 45,
    totalPlays: 128500,
    defaultRewards: true,
    defaultRewardConfig: { topPlayers: 3, bonusPoints: 100 },
  },
  {
    id: "2",
    name: "Watch Streak",
    description: "Reward consecutive daily viewing",
    devId: "game_streak_v1",
    iconType: "flame",
    activeInstances: 32,
    totalPlays: 89200,
    defaultRewards: true,
    defaultRewardConfig: { topPlayers: 5, bonusPoints: 50 },
  },
  {
    id: "3",
    name: "Weekly Contest",
    description: "Compete weekly for top positions on the leaderboard",
    devId: "game_contest_v1",
    iconType: "trophy",
    activeInstances: 18,
    totalPlays: 45600,
    defaultRewards: false,
  },
];

export function GameFormatsLibrary() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Game Formats Library</h3>
          <p className="text-muted-foreground text-sm">
            Define core game types available to the system
          </p>
        </div>
        <Button asChild className="gap-2">
          <Link href={"/games/format/new" as Route}>
            <Plus className="h-4 w-4" />
            Add Game Format
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mockFormats.map((format) => (
          <GameFormatCard key={format.id} format={format} />
        ))}
      </div>
    </div>
  );
}

function GameFormatCard({ format }: { format: GameFormat }) {
  return (
    <GlassCard className="hover:border-accent/30 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 text-accent rounded-lg p-2">
              {ICON_MAP[format.iconType]}
            </div>
            <div>
              <CardTitle className="text-base">{format.name}</CardTitle>
              <code className="text-muted-foreground font-mono text-xs">{format.devId}</code>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
            <Link href={`/games/format/${format.id}` as Route}>
              <Settings className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{format.description}</p>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Gamepad2 className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground-secondary">{format.activeInstances} Active</span>
          </div>
          <div className="flex items-center gap-2">
            <Play className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground-secondary">
              {(format.totalPlays / 1000).toFixed(1)}K Plays
            </span>
          </div>
        </div>

        {format.defaultRewards && format.defaultRewardConfig && (
          <div className="border-border/30 border-t pt-3">
            <Badge variant="secondary" className="text-xs">
              Default: Top {format.defaultRewardConfig.topPlayers} →{" "}
              {format.defaultRewardConfig.bonusPoints} pts
            </Badge>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
