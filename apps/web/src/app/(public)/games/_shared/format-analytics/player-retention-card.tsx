import { Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

const CHART_CONFIG = { ratePct: { label: "Retention %", color: "hsl(var(--success))" } };

/** Share of a day-1 cohort still playing on later days. */
export function PlayerRetentionCard({ data }: { data: ProposedFormatAnalyticsDto["retention"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader title="Player Retention" icon={Users} iconColor="text-success" />
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="day"
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
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="ratePct" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
