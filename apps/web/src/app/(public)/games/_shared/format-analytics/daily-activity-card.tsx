import { BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

const CHART_CONFIG = {
  plays: { label: "Total Plays", color: "hsl(var(--accent))" },
  completions: { label: "Completions", color: "hsl(var(--success))" },
  unique: { label: "Unique Users", color: "hsl(var(--primary))" },
};

/** Plays and completions per day. */
export function DailyActivityCard({ data }: { data: ProposedFormatAnalyticsDto["daily"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader title="Daily Activity" icon={BarChart3} />
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <XAxis
                dataKey="date"
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area
                type="monotone"
                dataKey="plays"
                stroke="hsl(var(--accent))"
                fill="hsl(var(--accent) / 0.2)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey="completions"
                stroke="hsl(var(--success))"
                fill="hsl(var(--success) / 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
