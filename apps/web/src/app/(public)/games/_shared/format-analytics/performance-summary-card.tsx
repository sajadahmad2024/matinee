import { Info } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

/** 272 → "4m 32s". */
const formatDuration = (seconds: number) => `${Math.floor(seconds / 60)}m ${seconds % 60}s`;

/** Session, points, win-rate and repeat-player figures for the format. */
export function PerformanceSummaryCard({
  summary,
}: {
  summary: ProposedFormatAnalyticsDto["summary"];
}) {
  const rows = [
    { label: "Avg. Session Duration", value: formatDuration(summary.avgSessionSeconds) },
    { label: "Avg. Points per Game", value: `${summary.avgPointsPerGame} pts` },
    { label: "Win Rate", value: `${summary.winRatePct}%` },
    { label: "Repeat Players", value: `${summary.repeatPlayersPct}%`, cls: "text-success" },
    { label: "Active Games", value: String(summary.activeGames), cls: "text-accent" },
  ];

  return (
    <GlassCard>
      <AnalyticsCardHeader title="Performance Summary" icon={Info} iconColor="text-accent" />
      <CardContent>
        <div className="space-y-4">
          {rows?.map(({ label, value, cls = "text-foreground" }) => (
            <div key={label} className="flex items-center justify-between">
              <span className="text-muted-foreground text-sm">{label}</span>
              <span className={`${cls} font-medium`}>{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}
