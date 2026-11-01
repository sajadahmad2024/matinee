import { Clock, Eye, Gamepad2, ThumbsUp, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { formatCount, formatDuration } from "../../../_components/listing/listing-config";
import { formatPct } from "../../../_components/performance/performance-config";
import { EMPTY } from "../../../_shared/content-format";
import {
  avgWatchStats,
  formatSignedDuration,
  formatSignedPct,
  pointsChange,
} from "./video-analytics-config";

const trendOf = (change?: number) => ((change ?? 0) >= 0 ? "up" : "down");

/**
 * The four headline numbers for the window, each with its change vs the previous window: views
 * (%), avg watch time (seconds), engagement and game participation (percentage points).
 */
export function KeyMetricsStrip({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const period = analytics?.periodChange;
  const games = analytics?.games;
  const { avgWatch, avgWatchChange } = avgWatchStats(analytics);
  const engagementChange = pointsChange(analytics?.engagementRate, analytics?.prevEngagementRate);
  const participationChange = pointsChange(games?.participationPct, games?.prevParticipationPct);

  const metrics = [
    {
      label: "Total Views",
      value: analytics ? formatCount(period?.views ?? 0) : EMPTY,
      change: formatSignedPct(period?.viewsPct),
      trend: trendOf(period?.viewsPct),
      icon: Eye,
    },
    {
      label: "Avg Watch Time",
      value: formatDuration(avgWatch),
      change: formatSignedDuration(avgWatchChange),
      trend: trendOf(avgWatchChange),
      icon: Clock,
    },
    {
      label: "Engagement Rate",
      value: analytics ? formatPct(analytics?.engagementRate) : EMPTY,
      change: formatSignedPct(engagementChange),
      trend: trendOf(engagementChange),
      icon: ThumbsUp,
    },
    {
      label: "Game Participation",
      value: analytics ? formatPct(games?.participationPct) : EMPTY,
      change: formatSignedPct(participationChange),
      trend: trendOf(participationChange),
      icon: Gamepad2,
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {metrics?.map((metric) => (
        <Card key={metric.label} className="border-border bg-card">
          <CardContent className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <metric.icon className="text-primary h-4 w-4" />
              <span
                className={`flex items-center gap-0.5 text-xs font-medium ${
                  metric.trend === "up" ? "text-success" : "text-destructive"
                }`}>
                {metric.trend === "up" ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {metric.change}
              </span>
            </div>
            <p className="font-gaming text-foreground text-2xl font-bold">{metric.value}</p>
            <p className="text-foreground-secondary mt-1 text-xs">{metric.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
