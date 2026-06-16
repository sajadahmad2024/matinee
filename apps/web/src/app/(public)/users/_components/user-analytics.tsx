"use client";

import { AlertTriangle, Crown, Gamepad2, Target, TrendingUp, Users } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

import { AnalyticsHeader } from "../../games/_components/analytics-header";
import { GlassCard } from "../../games/_components/glass-card";

const funnelData = [
  { stage: "Visitors", value: 50000, percent: 100 },
  { stage: "Signups", value: 12500, percent: 25 },
  { stage: "1st Watch", value: 8750, percent: 17.5 },
  { stage: "1st Game", value: 4375, percent: 8.75 },
];

const engagementData = [
  { day: "Mon", dau: 12400, mau: 45000 },
  { day: "Tue", dau: 13200, mau: 45200 },
  { day: "Wed", dau: 11800, mau: 45400 },
  { day: "Thu", dau: 14600, mau: 45800 },
  { day: "Fri", dau: 15200, mau: 46000 },
  { day: "Sat", dau: 18100, mau: 46500 },
  { day: "Sun", dau: 16800, mau: 47000 },
];

const retentionData = [
  { cohort: "Jan W1", d1: 85, d7: 62, d30: 38 },
  { cohort: "Jan W2", d1: 82, d7: 58, d30: 35 },
  { cohort: "Jan W3", d1: 88, d7: 65, d30: 42 },
  { cohort: "Jan W4", d1: 84, d7: 60, d30: 40 },
];

const whales = [
  { name: "JohnDoe_VIP", revenue: 2450, avatar: "" },
  { name: "PremiumUser99", revenue: 1890, avatar: "" },
  { name: "MovieLover2024", revenue: 1654, avatar: "" },
  { name: "SuperFan_X", revenue: 1420, avatar: "" },
  { name: "EliteWatcher", revenue: 1280, avatar: "" },
];

const powerGamers = [
  { name: "GameMaster_Pro", games: 342, winRate: 78 },
  { name: "QuizChampion", games: 298, winRate: 72 },
  { name: "StreakKing", games: 276, winRate: 85 },
];

const churnRisk = [
  { name: "HighValue_User1", ltv: 890, lastActive: "18 days ago" },
  { name: "Premium_Player", ltv: 654, lastActive: "15 days ago" },
  { name: "LoyalFan_2023", ltv: 542, lastActive: "21 days ago" },
];

interface UserAnalyticsProps {
  timeRange?: string;
}

export function UserAnalytics({ timeRange = "7d" }: UserAnalyticsProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _timeRange = timeRange; // Intentionally kept for future data fetching

  const dauMauRatio = (
    (engagementData[engagementData.length - 1].dau /
      engagementData[engagementData.length - 1].mau) *
    100
  ).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Row 1: Funnel & Engagement */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Acquisition Funnel */}
        <GlassCard>
          <AnalyticsHeader
            title="Acquisition Funnel"
            description="User journey conversion rates"
            icon={TrendingUp}
            iconColor="text-accent"
          />
          <CardContent className="space-y-3 pt-4">
            {funnelData.map((stage) => (
              <div key={stage.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground-secondary">{stage.stage}</span>
                  <span className="text-foreground font-mono">{stage.value.toLocaleString()}</span>
                </div>
                <div className="bg-muted/30 h-2 overflow-hidden rounded-full">
                  <div
                    className="from-accent to-accent/60 h-full rounded-full bg-gradient-to-r transition-all"
                    style={{ width: `${stage.percent}%` }}
                  />
                </div>
                <p className="text-muted-foreground text-right text-xs">{stage.percent}%</p>
              </div>
            ))}
          </CardContent>
        </GlassCard>

        {/* DAU vs MAU */}
        <GlassCard>
          <div className="flex items-start justify-between">
            <AnalyticsHeader
              title="Engagement (DAU/MAU)"
              description="Daily vs Monthly active users"
              icon={Users}
              iconColor="text-success"
            />
            <div className="pt-6 pr-6">
              <Badge variant="outline" className="text-accent">
                {dauMauRatio}% Stickiness
              </Badge>
            </div>
          </div>
          <CardContent>
            <ChartContainer
              config={{
                dau: { label: "DAU", color: "hsl(var(--accent))" },
                mau: { label: "MAU", color: "hsl(var(--muted-foreground))" },
              }}
              className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={engagementData}>
                  <defs>
                    <linearGradient id="dauGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
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
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area
                    type="monotone"
                    dataKey="dau"
                    stroke="hsl(var(--accent))"
                    fill="url(#dauGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </GlassCard>
      </div>

      {/* Row 2: Retention Cohorts */}
      <GlassCard>
        <AnalyticsHeader
          title="Retention Cohorts"
          description="Return rates by cohort week"
          icon={Target}
          iconColor="text-warning"
        /> 
        <CardContent className="pt-2">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border/50 border-b">
                  <th className="text-muted-foreground px-3 py-2 text-left text-xs font-medium">
                    Cohort
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-center text-xs font-medium">
                    Day 1
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-center text-xs font-medium">
                    Day 7
                  </th>
                  <th className="text-muted-foreground px-3 py-2 text-center text-xs font-medium">
                    Day 30
                  </th>
                </tr>
              </thead>
              <tbody>
                {retentionData.map((row) => (
                  <tr key={row.cohort} className="border-border/30 border-b">
                    <td className="text-foreground-secondary px-3 py-3 text-sm">{row.cohort}</td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-block rounded px-3 py-1 font-mono text-xs"
                        style={{
                          backgroundColor: `hsl(var(--success) / ${row.d1 / 100})`,
                          color: row.d1 > 50 ? "white" : "inherit",
                        }}>
                        {row.d1}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-block rounded px-3 py-1 font-mono text-xs"
                        style={{
                          backgroundColor: `hsl(var(--success) / ${row.d7 / 100})`,
                          color: row.d7 > 50 ? "white" : "inherit",
                        }}>
                        {row.d7}%
                      </span>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className="inline-block rounded px-3 py-1 font-mono text-xs"
                        style={{
                          backgroundColor: `hsl(var(--success) / ${row.d30 / 100})`,
                          color: row.d30 > 50 ? "white" : "inherit",
                        }}>
                        {row.d30}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </GlassCard>

      {/* Row 3: Segmentation Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Whales */}
        <GlassCard>
          <AnalyticsHeader
            title="Top Spenders"
            description="Highest revenue users"
            icon={Crown}
            iconColor="text-warning"
          />
          <CardContent className="pt-2">
            <div className="space-y-3">
              {whales.map((user, index) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4 font-mono text-xs">
                      #{index + 1}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="bg-accent/10 text-accent text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground max-w-[100px] truncate text-sm">
                      {user.name}
                    </span>
                  </div>
                  <span className="text-success font-mono text-sm">${user.revenue}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        {/* Power Gamers */}
        <GlassCard>
          <AnalyticsHeader
            title="Power Gamers"
            description="Highest participation"
            icon={Gamepad2}
            iconColor="text-accent"
          />
          <CardContent className="pt-2">
            <div className="space-y-3">
              {powerGamers.map((user, index) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4 font-mono text-xs">
                      #{index + 1}
                    </span>
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-accent/10 text-accent text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-foreground max-w-[100px] truncate text-sm">
                      {user.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-foreground font-mono text-sm">{user.games}</span>
                    <span className="text-muted-foreground ml-1 text-xs">games</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>

        {/* Churn Risk */}
        <GlassCard className="bg-destructive/5 border-destructive/20">
          <AnalyticsHeader
            title="Churn Risk"
            description="High-value users at risk"
            icon={AlertTriangle}
            iconColor="text-destructive"
          />
          <CardContent className="pt-2">
            <div className="space-y-3">
              {churnRisk.map((user) => (
                <div key={user.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                        {user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="text-foreground block max-w-[100px] truncate text-sm">
                        {user.name}
                      </span>
                      <span className="text-destructive text-xs">{user.lastActive}</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ${user.ltv} LTV
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </GlassCard>
      </div>
    </div>
  );
}
