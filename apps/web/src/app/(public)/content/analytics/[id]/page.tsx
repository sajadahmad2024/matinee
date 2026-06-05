"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Clock,
  Coins,
  Eye,
  Film,
  Gamepad2,
  Globe,
  Monitor,
  Share2,
  Smartphone,
  Tablet,
  ThumbsUp,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const retentionData = Array.from({ length: 100 }, (_, i) => ({
  second: i * 10,
  retention: Math.max(10, 100 - i * 0.8 - Math.random() * 10),
}));

const trafficSourceData = [
  { name: "Homepage", value: 35, color: "hsl(217, 91%, 60%)" },
  { name: "Notifications", value: 28, color: "hsl(142, 76%, 45%)" },
  { name: "Search", value: 22, color: "hsl(270, 91%, 65%)" },
  { name: "External Share", value: 15, color: "hsl(25, 95%, 53%)" },
];

const demographicsData = {
  age: [
    { range: "13-17", value: 8 },
    { range: "18-24", value: 32 },
    { range: "25-34", value: 35 },
    { range: "35-44", value: 15 },
    { range: "45+", value: 10 },
  ],
  gender: [
    { name: "Male", value: 58, color: "hsl(217, 91%, 60%)" },
    { name: "Female", value: 40, color: "hsl(330, 80%, 60%)" },
    { name: "Other", value: 2, color: "hsl(270, 91%, 65%)" },
  ],
  device: [
    { name: "Mobile", value: 62, icon: Smartphone },
    { name: "Desktop", value: 28, icon: Monitor },
    { name: "Tablet", value: 10, icon: Tablet },
  ],
};

const geoData = [
  { country: "India", views: 45200, revenue: 12400 },
  { country: "Philippines", views: 32100, revenue: 8900 },
  { country: "Indonesia", views: 28400, revenue: 6200 },
  { country: "USA", views: 18900, revenue: 15800 },
  { country: "South Korea", views: 15600, revenue: 9400 },
];

export default function VideoAnalyticsPage() {
  const router = useRouter();

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/content" as Route)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="font-gaming text-foreground text-2xl font-bold">Video Analytics</h1>
            <p className="text-foreground-secondary text-sm">
              K-Drama Romance: Episode 1 - Deep Performance Insights
            </p>
          </div>
        </div>
      </div>

      {/* Key Metrics Strip */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { label: "Total Views", value: "124.5K", change: "+12.4%", trend: "up", icon: Eye },
          { label: "Avg Watch Time", value: "18:42", change: "+2:15", trend: "up", icon: Clock },
          {
            label: "Engagement Rate",
            value: "8.2%",
            change: "+0.8%",
            trend: "up",
            icon: ThumbsUp,
          },
          {
            label: "Game Participation",
            value: "38.9%",
            change: "-2.1%",
            trend: "down",
            icon: Gamepad2,
          },
        ].map((metric) => (
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Audience Retention */}
        <Card className="border-border bg-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-success flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Audience Retention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={retentionData}>
                  <defs>
                    <linearGradient id="retentionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0.4} />
                      <stop offset="100%" stopColor="hsl(142, 76%, 45%)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="hsl(217, 33%, 22%)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="second"
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={11}
                    tickFormatter={(v) =>
                      `${Math.floor(v / 60)}:${(v % 60).toString().padStart(2, "0")}`
                    }
                  />
                  <YAxis
                    stroke="hsl(215, 20%, 65%)"
                    fontSize={11}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217, 33%, 14%)",
                      border: "1px solid hsl(217, 33%, 22%)",
                      borderRadius: "8px",
                    }}
                    formatter={(value: number) => [`${value.toFixed(1)}%`, "Retention"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="retention"
                    stroke="hsl(142, 76%, 45%)"
                    fill="url(#retentionGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 flex items-center justify-center gap-8 text-sm">
              <div className="text-center">
                <p className="font-gaming text-foreground text-2xl font-bold">78%</p>
                <p className="text-foreground-secondary">of total duration watched</p>
              </div>
              <div className="text-center">
                <p className="font-gaming text-foreground text-2xl font-bold">18:42</p>
                <p className="text-foreground-secondary">avg of 24:00 total</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Traffic Sources */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-accent flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Traffic Sources
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={trafficSourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value">
                    {trafficSourceData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(217, 33%, 14%)",
                      border: "1px solid hsl(217, 33%, 22%)",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {trafficSourceData.map((source) => (
                <div key={source.name} className="flex items-center gap-2 text-sm">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: source.color }} />
                  <span className="text-foreground-secondary">{source.name}</span>
                  <span className="text-foreground ml-auto font-medium">{source.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Demographics */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-primary flex items-center gap-2">
              <Users className="h-5 w-5" />
              Demographics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Age Distribution */}
            <div>
              <p className="text-foreground-secondary mb-2 text-xs font-medium">Age Range</p>
              <div className="space-y-2">
                {demographicsData.age.map((item) => (
                  <div key={item.range} className="flex items-center gap-2">
                    <span className="text-foreground-secondary w-12 text-xs">{item.range}</span>
                    <div className="bg-background h-4 flex-1 overflow-hidden rounded-full">
                      <div
                        className="from-primary to-accent h-full bg-gradient-to-r"
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="text-foreground w-8 text-right text-xs">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Device */}
            <div>
              <p className="text-foreground-secondary mb-2 text-xs font-medium">Device Type</p>
              <div className="flex gap-4">
                {demographicsData.device.map((device) => (
                  <div
                    key={device.name}
                    className="bg-background-tertiary flex-1 rounded-lg p-3 text-center">
                    <device.icon className="text-primary mx-auto mb-1 h-5 w-5" />
                    <p className="text-foreground text-lg font-bold">{device.value}%</p>
                    <p className="text-foreground-secondary text-xs">{device.name}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Geo Heatmap */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-info flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Geographic Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {geoData.map((country, index) => (
                <div key={country.country} className="flex items-center gap-3">
                  <span className="text-foreground-secondary w-6 font-medium">#{index + 1}</span>
                  <span className="text-foreground flex-1 font-medium">{country.country}</span>
                  <span className="text-foreground-secondary text-sm">
                    {(country.views / 1000).toFixed(1)}K views
                  </span>
                  <span className="text-success text-sm">
                    ${(country.revenue / 1000).toFixed(1)}K
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gamification Performance */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-warning flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Gamification Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-background-tertiary rounded-lg p-3 text-center">
                <p className="font-gaming text-foreground text-2xl font-bold">38.9%</p>
                <p className="text-foreground-secondary text-xs">Participation Rate</p>
              </div>
              <div className="bg-background-tertiary rounded-lg p-3 text-center">
                <p className="font-gaming text-foreground text-2xl font-bold">72.4%</p>
                <p className="text-foreground-secondary text-xs">Completion Rate</p>
              </div>
            </div>
            <div className="from-accent/20 to-accent/5 border-accent/20 rounded-lg border bg-gradient-to-br p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <Coins className="text-warning h-4 w-4" />
                  Points Distributed
                </span>
                <span className="font-gaming text-foreground text-lg font-bold">48,500</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-foreground flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="text-success h-4 w-4" />
                  XP Awarded
                </span>
                <span className="font-gaming text-foreground text-lg font-bold">125,000</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BTS Performance */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-featured flex items-center gap-2">
              <Film className="h-5 w-5" />
              Behind the Scenes Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-featured/20 bg-featured/10 flex items-center justify-between rounded-lg border p-4">
              <div>
                <p className="text-foreground-secondary text-sm">BTS Click-Through</p>
                <p className="font-gaming text-foreground text-3xl font-bold">12.4%</p>
              </div>
              <div className="text-right">
                <p className="text-foreground-secondary text-sm">Total BTS Views</p>
                <p className="font-gaming text-foreground text-3xl font-bold">15.4K</p>
              </div>
            </div>
            <p className="text-foreground-secondary text-sm">
              <span className="text-success font-medium">+2.1%</span> conversion improvement vs.
              last month
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
