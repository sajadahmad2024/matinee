"use client";

import { BarChart3 } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsHeader } from "../../../_components/analytics-header";
import { GlassCard } from "../../../_components/glass-card";

const dailyPlaysData = [
  { date: "Jan 15", plays: 2400, completions: 1800, unique: 1200 },
  { date: "Jan 16", plays: 3200, completions: 2600, unique: 1600 },
  { date: "Jan 17", plays: 2800, completions: 2100, unique: 1400 },
  { date: "Jan 18", plays: 3600, completions: 2900, unique: 1900 },
  { date: "Jan 19", plays: 4200, completions: 3400, unique: 2200 },
  { date: "Jan 20", plays: 5100, completions: 4200, unique: 2800 },
  { date: "Jan 21", plays: 4800, completions: 3900, unique: 2500 },
];

export function DailyActivityChart() {
  return (
    <GlassCard>
      <AnalyticsHeader title="Daily Activity" icon={BarChart3} />
      <CardContent>
        <ChartContainer
          config={{
            plays: { label: "Total Plays", color: "hsl(var(--accent))" },
            completions: { label: "Completions", color: "hsl(var(--success))" },
            unique: { label: "Unique Users", color: "hsl(var(--primary))" },
          }}
          className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailyPlaysData}>
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
