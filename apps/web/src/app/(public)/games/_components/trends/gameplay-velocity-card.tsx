import { TrendingUp } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedGamesTrendsDto } from "../../_libs/game-types";

const SERIES = [
  { key: "started", label: "Started", color: "hsl(var(--accent))", dot: "bg-accent" },
  { key: "completed", label: "Completed", color: "hsl(var(--success))", dot: "bg-success" },
] as const;

/** Sessions started vs completed per day. */
export function GameplayVelocityCard({ data }: { data: ProposedGamesTrendsDto["velocity"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader
        title="Gameplay Velocity"
        description="Sessions started vs completed"
        icon={TrendingUp}
        iconColor="text-accent"
      />
      <CardContent>
        <ChartContainer
          config={Object.fromEntries(
            SERIES?.map((s) => [s.key, { label: s.label, color: s.color }]),
          )}
          className="h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <XAxis
                dataKey="day"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(1)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {SERIES?.map((s) => (
                <Line
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  stroke={s.color}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 flex justify-center gap-6">
          {SERIES?.map((s) => (
            <div key={s.key} className="flex items-center gap-2">
              <div className={`${s.dot} h-3 w-3 rounded-full`} />
              <span className="text-muted-foreground text-xs">{s.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}
