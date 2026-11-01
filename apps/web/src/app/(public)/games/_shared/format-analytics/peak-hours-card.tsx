import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

const CHART_CONFIG = { plays: { label: "Plays", color: "hsl(var(--primary))" } };

/** Plays by time of day. */
export function PeakHoursCard({ data }: { data: ProposedFormatAnalyticsDto["peakHours"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader title="Peak Activity Hours" icon={Clock} iconColor="text-primary" />
      <CardContent>
        <ChartContainer config={CHART_CONFIG} className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <XAxis
                dataKey="hour"
                stroke="hsl(var(--muted-foreground))"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="plays" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
