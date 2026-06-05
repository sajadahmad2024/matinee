"use client";

import { Info } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsHeader } from "../../../_components/analytics-header";
import { GlassCard } from "../../../_components/glass-card";

interface PerformanceSummaryCardProps {
  activeGamesCount: number;
}

export function PerformanceSummaryCard({ activeGamesCount }: PerformanceSummaryCardProps) {
  return (
    <GlassCard>
      <AnalyticsHeader title="Performance Summary" icon={Info} iconColor="text-accent" />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Avg. Session Duration</span>
            <span className="text-foreground font-medium">4m 32s</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Avg. Points per Game</span>
            <span className="text-foreground font-medium">45 pts</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Win Rate</span>
            <span className="text-foreground font-medium">68%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Repeat Players</span>
            <span className="text-success font-medium">72%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Active Games</span>
            <span className="text-accent font-medium">{activeGamesCount}</span>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
