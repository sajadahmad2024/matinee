"use client";

import { Clock } from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsHeader } from "../../../_components/analytics-header";
import { GlassCard } from "../../../_components/glass-card";

const timeOfDayData = [
  { hour: "6am", plays: 120 },
  { hour: "9am", plays: 450 },
  { hour: "12pm", plays: 780 },
  { hour: "3pm", plays: 920 },
  { hour: "6pm", plays: 1400 },
  { hour: "9pm", plays: 1850 },
  { hour: "12am", plays: 680 },
];

export function PeakHoursChart() {
  return (
    <GlassCard>
      <AnalyticsHeader title="Peak Activity Hours" icon={Clock} iconColor="text-primary" />
      <CardContent>
        <ChartContainer
          config={{
            plays: { label: "Plays", color: "hsl(var(--primary))" },
          }}
          className="h-[180px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={timeOfDayData}>
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
