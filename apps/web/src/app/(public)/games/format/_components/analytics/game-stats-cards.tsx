"use client";

import { Coins, Play, TrendingUp, Users } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { GlassCard } from "../../../_components/glass-card";
import { formatCompact, scaleCount, shiftRate, type RegionKey } from "./region-scale";

// Global baseline (mock) — regional values are derived deterministically.
const BASE = { totalPlays: 128500, uniquePlayers: 45200, pointsMinted: 2400000, completionRate: 78.4 };

interface GameStatsCardsProps {
  region?: RegionKey;
}

export function GameStatsCards({ region = "all" }: GameStatsCardsProps) {
  const stats = [
    {
      label: "Total Plays",
      value: formatCompact(scaleCount(BASE.totalPlays, region)),
      icon: Play,
      wrap: "bg-accent/10",
      cls: "text-accent",
    },
    {
      label: "Unique Players",
      value: formatCompact(scaleCount(BASE.uniquePlayers, region)),
      icon: Users,
      wrap: "bg-success/10",
      cls: "text-success",
    },
    {
      label: "Points Minted",
      value: formatCompact(scaleCount(BASE.pointsMinted, region)),
      icon: Coins,
      wrap: "bg-warning/10",
      cls: "text-warning",
    },
    {
      label: "Completion Rate",
      value: `${shiftRate(BASE.completionRate, region).toFixed(1)}%`,
      icon: TrendingUp,
      wrap: "bg-primary/10",
      cls: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <GlassCard key={s.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={`${s.wrap} rounded-lg p-2`}>
                  <Icon className={`${s.cls} h-5 w-5`} />
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">{s.label}</p>
                  <p className="font-gaming text-foreground text-2xl font-bold">{s.value}</p>
                </div>
              </div>
            </CardContent>
          </GlassCard>
        );
      })}
    </div>
  );
}
