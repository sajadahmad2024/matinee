"use client";

import {
  AlertTriangle,
  Coins,
  Gamepad2,
  Play,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsHeader } from "./analytics-header";
import { GlassCard } from "./glass-card";

// --- Health summary (status at a glance) ---
type HealthStat = {
  label: string;
  value: string;
  delta?: string;
  trend?: "up" | "down";
  tone: "success" | "warning" | "accent";
  icon: typeof Users;
};

const healthStats: HealthStat[] = [
  { label: "Active Players (7d)", value: "24.4K", delta: "+6.1%", trend: "up", tone: "accent", icon: Users },
  { label: "Completion Rate", value: "78%", delta: "+2.3%", trend: "up", tone: "success", icon: Target },
  { label: "Points Minted", value: "890K", delta: "healthy", tone: "success", icon: Coins },
  { label: "Formats Live", value: "5", delta: "1 needs attention", tone: "warning", icon: Gamepad2 },
];

const toneText: Record<HealthStat["tone"], string> = {
  success: "text-success",
  warning: "text-warning",
  accent: "text-accent",
};

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

const formatData = [
  { name: "Watch Streak", value: 40, color: "hsl(var(--accent))" },
  { name: "Weekly Contest", value: 35, color: "hsl(var(--success))" },
  { name: "Predict Outcome", value: 25, color: "hsl(var(--warning))" },
];

const winLossData = [
  { format: "Streak", wins: 72, losses: 28 },
  { format: "Contest", wins: 68, losses: 32 },
  { format: "Predict", wins: 45, losses: 55 },
];

const topGames = [
  { title: "Avengers Prediction", plays: 12500, participation: 78 },
  { title: "Batman Challenge", plays: 9800, participation: 72 },
  { title: "Dune Streak", plays: 8400, participation: 69 },
  { title: "Oppenheimer Quiz", plays: 7200, participation: 65 },
  { title: "Barbie Contest", plays: 6800, participation: 61 },
];

// --- Main Component ---

interface GameAnalyticsProps {
  timeRange?: string;
}

export function GameAnalytics({ timeRange = "7d" }: GameAnalyticsProps) {
  // In the future, this is where we would fetch data based on timeRange
  // const { data } = useQuery({ queryKey: ['game-analytics', timeRange], queryFn: () => fetchAnalytics(timeRange) });

  return (
    <div className="space-y-6">
      {/* Health summary — answers "how are the games doing?" at a glance */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {healthStats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs">{s.label}</span>
                  <Icon className={`h-4 w-4 ${toneText[s.tone]}`} />
                </div>
                <p className="text-foreground mt-2 text-2xl font-bold">{s.value}</p>
                {s.delta && (
                  <div className={`mt-1 flex items-center gap-1 text-xs ${toneText[s.tone]}`}>
                    {s.trend === "up" && <TrendingUp className="h-3 w-3" />}
                    {s.trend === "down" && <TrendingDown className="h-3 w-3" />}
                    <span>{s.delta}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Leaderboard Stagnation Alert — now actionable, not passive */}
      <Card className="border-warning/20 bg-warning/5">
        <CardContent className="py-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-warning h-5 w-5 shrink-0" />
              <div>
                <p className="text-foreground text-sm font-medium">
                  Leaderboard Stagnation Detected
                </p>
                <p className="text-muted-foreground text-xs">
                  Top 3 positions in Weekly Contest held by the same users for 4 consecutive weeks.
                </p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-2 sm:pl-4">
              <Button size="sm" variant="outline" className="cursor-pointer">
                View leaderboard
              </Button>
              <Button size="sm" className="cursor-pointer">
                Rebalance rewards
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Row 1: Velocity & Format Popularity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Gameplay Velocity */}
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

        {/* Format Popularity */}
        <GlassCard>
          <AnalyticsHeader
            title="Format Popularity"
            description="Distribution by game type"
            icon={Trophy}
            iconColor="text-warning"
          />
          <CardContent>
            <div className="flex items-center justify-between">
              <ChartContainer
                config={{
                  value: { label: "Percentage" },
                }}
                className="h-[200px] w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value">
                      {formatData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
              <div className="space-y-3">
                {formatData.map((format) => (
                  <div key={format.name} className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: format.color }}
                    />
                    <span className="text-foreground-secondary text-sm">{format.name}</span>
                    <span className="text-foreground text-sm font-semibold">{format.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      {/* Row 2: Top Trailers & Economy */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Top Games */}
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
                    <span className="text-foreground max-w-[140px] truncate text-sm">
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

        {/* Points Minted */}
        <GlassCard>
          <AnalyticsHeader
            title="Points Minted"
            description="Total distributed this period"
            icon={Coins}
            iconColor="text-success"
          />
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Total XP</span>
                <span className="text-accent font-gaming text-2xl font-bold">1.2M</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Reward Points</span>
                <span className="text-success font-gaming text-2xl font-bold">890K</span>
              </div>
              <div className="border-border/30 border-t pt-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Avg per Game</span>
                  <span className="text-foreground font-medium">45 XP</span>
                </div>
              </div>
            </div>
          </CardContent>
        </GlassCard>

        {/* Win/Loss Ratio */}
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
              className="h-[160px] w-full">
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
    </div>
  );
}
