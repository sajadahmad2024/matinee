import type { Route } from "next";
import Link from "next/link";

import { Gamepad2, Play, Settings, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { GAME_TYPES, type GameTypeDef } from "../_config/game-types";
import { GlassCard } from "./glass-card";

/**
 * The game-type control centre. Types are FIXED (backed by our DB); their rules are
 * configured per type via Settings / Gamification / Analytics. No "add type" — admins
 * create instances (quests, predictions, auctions…) inside a type.
 */
export function GameFormatsLibrary() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-foreground text-lg font-semibold">Game Types</h3>
        <p className="text-muted-foreground text-sm">
          Fixed game types with dynamic, configurable rules. Configure each via Settings ·
          Gamification · Analytics.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {GAME_TYPES.map((type) => (
          <GameTypeCard key={type.slug} type={type} />
        ))}
      </div>
    </div>
  );
}

function GameTypeCard({ type }: { type: GameTypeDef }) {
  const Icon = type.icon;
  return (
    <Link href={`/games/format/${type.slug}` as Route} className="group block">
      <GlassCard className="group-hover:border-accent/40 h-full transition-colors">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-accent/10 text-accent rounded-lg p-2">
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-base">{type.name}</CardTitle>
                <span className="text-muted-foreground text-xs">{type.tagline}</span>
              </div>
            </div>
            {type.autonomous ? (
              <Badge variant="secondary" className="gap-1 text-[10px]">
                <Sparkles className="h-3 w-3" /> Autonomous
              </Badge>
            ) : (
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground text-sm">{type.description}</p>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground-secondary">
                {type.activeInstances} {type.instanceNoun ? "Active" : "Enabled"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground-secondary">
                {(type.totalPlays / 1000).toFixed(1)}K Plays
              </span>
            </div>
          </div>

          <div className="border-border/30 border-t pt-3">
            <code className="text-muted-foreground font-mono text-[10px]">{type.dbMapping}</code>
          </div>
        </CardContent>
      </GlassCard>
    </Link>
  );
}
