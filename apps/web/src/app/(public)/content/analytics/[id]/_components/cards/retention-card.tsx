import { TrendingUp } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { formatDuration } from "../../../../_components/listing/listing-config";
import { EMPTY } from "../../../../_shared/content-format";
import { CHART_TOOLTIP_STYLE, avgWatchStats, retentionSeries } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";
import { CardEmptyState } from "./card-empty-state";

interface RetentionCardProps {
  analytics?: ContentAnalyticsDto;
  /** The video's length — places the retention points on its timeline. */
  durationSeconds?: number | null;
}

/** Audience retention curve, plus % of the duration watched and the average watch time. */
export function RetentionCard({ analytics, durationSeconds }: RetentionCardProps) {
  const retentionData = retentionSeries(analytics, durationSeconds);
  const { avgWatch } = avgWatchStats(analytics);

  return (
    <AnalyticsCard
      title="Audience Retention"
      icon={TrendingUp}
      tone="text-success"
      className="lg:col-span-2">
      {!retentionData?.length && analytics && (
        <CardEmptyState
          icon={TrendingUp}
          title="No retention data yet"
          description={
            durationSeconds
              ? "The curve appears once viewers watch this video in the selected period."
              : "The curve appears once the video's duration is known."
          }
        />
      )}
      {!!retentionData?.length && (
        <div className="h-62.5">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={retentionData}>
              <defs>
                <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
              <XAxis
                dataKey="second"
                stroke="hsl(215, 20%, 65%)"
                fontSize={11}
                tickFormatter={(v) =>
                  `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, "0")}`
                }
              />
              <YAxis
                stroke="hsl(215, 20%, 65%)"
                fontSize={11}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={CHART_TOOLTIP_STYLE}
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Retention"]}
              />
              <Area
                type="monotone"
                dataKey="retention"
                stroke="hsl(142, 76%, 45%)"
                fill="url(#retentionGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="mt-4 flex items-center justify-center gap-8 text-sm">
        <div className="text-center">
          <p className="font-gaming text-foreground text-2xl font-bold">
            {analytics ? `${Math.round(analytics?.avgCompletion ?? 0)}%` : EMPTY}
          </p>
          <p className="text-foreground-secondary">of total duration watched</p>
        </div>
        <div className="text-center">
          <p className="font-gaming text-foreground text-2xl font-bold">
            {formatDuration(avgWatch)}
          </p>
          <p className="text-foreground-secondary">
            avg of {formatDuration(durationSeconds)} total
          </p>
        </div>
      </div>
    </AnalyticsCard>
  );
}
