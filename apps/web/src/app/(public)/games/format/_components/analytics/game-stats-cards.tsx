"use client";

import { Coins, Play, TrendingUp, Users } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { GlassCard } from "../../../_components/glass-card";

export function GameStatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-4">
      <GlassCard>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-accent/10 rounded-lg p-2">
              <Play className="text-accent h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Total Plays</p>
              <p className="font-gaming text-foreground text-2xl font-bold">128.5K</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
      <GlassCard>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/10 rounded-lg p-2">
              <Users className="text-success h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Unique Players</p>
              <p className="font-gaming text-foreground text-2xl font-bold">45.2K</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
      <GlassCard>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-warning/10 rounded-lg p-2">
              <Coins className="text-warning h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Points Minted</p>
              <p className="font-gaming text-foreground text-2xl font-bold">2.4M</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
      <GlassCard>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="bg-primary/10 rounded-lg p-2">
              <TrendingUp className="text-primary h-5 w-5" />
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Completion Rate</p>
              <p className="font-gaming text-foreground text-2xl font-bold">78.4%</p>
            </div>
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
