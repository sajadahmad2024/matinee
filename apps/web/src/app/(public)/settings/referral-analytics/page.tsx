"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Coins,
  Send,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserPlus,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  AnalyticsDateFilter,
  useAnalyticsDateRange,
} from "../../content/analytics/[id]/_components/analytics-date-filter";

const METRICS = [
  { label: "Invites Sent", value: "8,420", change: "+14.2%", trend: "up", icon: Send },
  { label: "Successful Signups", value: "2,136", change: "+9.8%", trend: "up", icon: UserPlus },
  { label: "Conversion Rate", value: "25.4%", change: "-1.1%", trend: "down", icon: Target },
  { label: "Points Awarded", value: "1.07M", change: "+9.8%", trend: "up", icon: Coins },
] as const;

const trendData = Array.from({ length: 30 }, (_, i) => {
  const invites = Math.round(220 + i * 4 + Math.random() * 60);
  return {
    day: `Day ${i + 1}`,
    invites,
    signups: Math.round(invites * (0.22 + Math.random() * 0.08)),
  };
});

const topReferrers = [
  { name: "Aarav Sharma", handle: "@aarav", invites: 42, signups: 18, points: 9000 },
  { name: "Maria Santos", handle: "@msantos", invites: 38, signups: 15, points: 7500 },
  { name: "Ji-woo Park", handle: "@jiwoo", invites: 31, signups: 14, points: 7000 },
  { name: "Rina Wijaya", handle: "@rinaw", invites: 29, signups: 11, points: 5500 },
  { name: "James Carter", handle: "@jcarter", invites: 24, signups: 9, points: 4500 },
];

const tooltipStyle = {
  backgroundColor: "hsl(217, 33%, 14%)",
  border: "1px solid hsl(217, 33%, 22%)",
  borderRadius: "8px",
};

export default function ReferralAnalyticsPage() {
  const router = useRouter();
  const { label: timeRangeLabel } = useAnalyticsDateRange();

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/settings?tab=economy" as Route)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-gaming text-foreground text-2xl font-bold">Referral Analytics</h1>
            <p className="text-foreground-secondary text-sm">
              How the referral program is driving new signups
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-muted-foreground">Showing</span>
              <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
                {timeRangeLabel}
              </span>
            </div>
          </div>
        </div>
        <AnalyticsDateFilter />
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {METRICS.map((metric) => (
          <Card key={metric.label} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="mb-2 flex items-center justify-between">
                <metric.icon className="text-primary h-4 w-4" />
                <span
                  className={`flex items-center gap-0.5 text-xs font-medium ${
                    metric.trend === "up" ? "text-success" : "text-destructive"
                  }`}>
                  {metric.trend === "up" ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metric.change}
                </span>
              </div>
              <p className="font-gaming text-foreground text-2xl font-bold">{metric.value}</p>
              <p className="text-foreground-secondary mt-1 text-xs">{metric.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Invites vs Signups */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Invites vs Signups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="invitesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="signupsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(217, 33%, 22%)"
                    vertical={false}
                  />
                  <XAxis dataKey="day" stroke="hsl(215, 20%, 65%)" fontSize={11} interval={4} />
                  <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="invites"
                    name="Invites"
                    stroke="hsl(217, 91%, 60%)"
                    fill="url(#invitesGradient)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="signups"
                    name="Signups"
                    stroke="hsl(142, 76%, 45%)"
                    fill="url(#signupsGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Program Health */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Program Health
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { label: "Active Referrers", value: "1,284", hint: "Users who sent ≥1 invite" },
              { label: "Avg Invites / Referrer", value: "6.6", hint: "Across active referrers" },
              { label: "Hit Monthly Cap", value: "37", hint: "Users at max invites limit" },
              { label: "Pending Rewards", value: "214", hint: "Invited users not yet signed up" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="bg-background-tertiary flex items-center justify-between rounded-lg p-3">
                <div>
                  <p className="text-foreground text-sm font-medium">{stat.label}</p>
                  <p className="text-foreground-secondary text-xs">{stat.hint}</p>
                </div>
                <p className="font-gaming text-foreground text-xl font-bold">{stat.value}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Top Referrers */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="text-warning flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Top Referrers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {topReferrers.map((referrer, index) => (
              <div key={referrer.handle} className="flex items-center gap-3">
                <span className="text-foreground-secondary w-6 font-medium">#{index + 1}</span>
                <div className="flex-1">
                  <p className="text-foreground font-medium">{referrer.name}</p>
                  <p className="text-foreground-secondary text-xs">{referrer.handle}</p>
                </div>
                <span className="text-foreground-secondary hidden text-sm sm:inline">
                  {referrer.invites} invites
                </span>
                <span className="text-foreground text-sm">{referrer.signups} signups</span>
                <span className="text-success w-24 text-right text-sm">
                  {referrer.points.toLocaleString()} Pts
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
