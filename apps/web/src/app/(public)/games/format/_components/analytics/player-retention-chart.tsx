"use client";

import { Users } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsHeader } from "../../../_components/analytics-header";
import { GlassCard } from "../../../_components/glass-card";

const retentionData = [
  { day: "Day 1", rate: 100 },
  { day: "Day 3", rate: 72 },
  { day: "Day 7", rate: 58 },
  { day: "Day 14", rate: 42 },
  { day: "Day 30", rate: 28 },
];

export function PlayerRetentionChart() {
  return (
    <GlassCard>
      <AnalyticsHeader title="Player Retention" icon={Users} iconColor="text-success" />
      <CardContent>
        <ChartContainer
          config={{
            rate: { label: "Retention %", color: "hsl(var(--success))" },
          }}
          className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={retentionData}>
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
              <Bar dataKey="rate" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </GlassCard>
  );
}
