"use client";

import { Coins, Play, Target, TrendingUp } from "lucide-react";
import { Bar, BarChart, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { SectionHeading } from "@/components/custom/section-heading";

import { AnalyticsHeader } from "./analytics-header";
import { GlassCard } from "./glass-card";

// --- Mock Data ---

const velocityData = [
  { day: "Mon", started: 2400, completed: 1800 },
  { day: "Tue", started: 3200, completed: 2600 },
  { day: "Wed", started: 2800, completed: 2100 },
  { day: "Thu", started: 3600, completed: 2900 },
  { day: "Fri", started: 4200, completed: 3400 },
  { day: "Sat", started: 5100, completed: 4200 },
  { day: "Sun", started: 4800, completed: 3900 },
];

const winLossData = [
  { format: "Streak", wins: 72, losses: 28 },
  { format: "Quests", wins: 68, losses: 32 },
  { format: "Predict", wins: 45, losses: 55 },
];

const topGames = [
  { title: "Avengers Prediction", plays: 12500, participation: 78 },
  { title: "Batman Challenge", plays: 9800, participation: 72 },
  { title: "Dune Streak", plays: 8400, participation: 69 },
  { title: "Oppenheimer Quiz", plays: 7200, participation: 65 },
  { title: "Barbie Contest", plays: 6800, participation: 61 },
];

interface GameTrendsProps {
  timeRange?: string;
}

/** Trends & Economy — the former Overview charts, now scroll-reachable below the format rows. */
export function GameTrends({ timeRange = "7d" }: GameTrendsProps) {
  void timeRange; // mock — API scoping comes later

  return (
    <div className="space-y-6">
      <SectionHeading
        title="Trends & Economy"
        subtitle="Gameplay velocity, win/loss balance and the points economy across all formats"
        icon={TrendingUp}
      />

      {/* Row 1: Velocity & Win/Loss */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <AnalyticsHeader
            title="Gameplay Velocity"
            description="Sessions started vs completed"
            icon={TrendingUp}
            iconColor="text-accent"
          />
          <CardContent>
            <ChartContainer
              config={{
                started: { label: "Started", color: "hsl(var(--accent))" },
                completed: { label: "Completed", color: "hsl(var(--success))" },
              }}
              className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={velocityData}>
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
                  <Line
                    type="monotone"
                    dataKey="started"
                    stroke="hsl(var(--accent))"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="completed"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-4 flex justify-center gap-6">
              <div className="flex items-center gap-2">
                <div className="bg-accent h-3 w-3 rounded-full" />
                <span className="text-muted-foreground text-xs">Started</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-success h-3 w-3 rounded-full" />
                <span className="text-muted-foreground text-xs">Completed</span>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <AnalyticsHeader
            title="Win/Loss Ratio"
            description="Balance per format"
            icon={Target}
            iconColor="text-warning"
          />
          <CardContent>
            <ChartContainer
              config={{
                wins: { label: "Wins", color: "hsl(var(--success))" },
                losses: { label: "Losses", color: "hsl(var(--destructive))" },
              }}
              className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={winLossData} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="format"
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    width={50}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="wins"
                    fill="hsl(var(--success))"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </GlassCard>
      </div>

      {/* Row 2: Top Games & Economy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <GlassCard>
          <AnalyticsHeader
            title="Top 5 Games"
            description="Highest game participation"
            icon={Play}
            iconColor="text-accent"
          />
          <CardContent>
            <div className="space-y-3">
              {topGames.map((game, index) => (
                <div
                  key={game.title}
                  className="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-muted-foreground w-4 font-mono text-xs">
                      #{index + 1}
                    </span>
                    <span className="text-foreground max-w-[240px] truncate text-sm">
                      {game.title}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {game.participation}%
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        {/* Economy — both currencies, roles labeled */}
        <GlassCard>
          <AnalyticsHeader
            title="Economy"
            description="Both currencies this period"
            icon={Coins}
            iconColor="text-success"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Points Minted</span>
                <span className="text-success font-gaming text-2xl font-bold">890K</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Points Spent</span>
                <span className="text-warning font-gaming text-2xl font-bold">512K</span>
              </div>
              <div className="border-border/30 border-t pt-2">
                <p className="text-muted-foreground text-[11px]">
                  Points are the platform&apos;s only currency — spent on rewards and bidding.
                </p>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}
