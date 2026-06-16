"use client";

import { Clock, DollarSign, TrendingDown, TrendingUp, Users, Video } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

import { Card, CardContent } from "@/components/ui/card";

import { AnalyticsCard } from "../../users/_components/analytics-card";

const mrrData = [
  { month: "Jul", newMRR: 45000, churnedMRR: 8000 },
  { month: "Aug", newMRR: 52000, churnedMRR: 9500 },
  { month: "Sep", newMRR: 58000, churnedMRR: 7800 },
  { month: "Oct", newMRR: 61000, churnedMRR: 11000 },
  { month: "Nov", newMRR: 72000, churnedMRR: 9200 },
  { month: "Dec", newMRR: 85000, churnedMRR: 12500 },
  { month: "Jan", newMRR: 94000, churnedMRR: 10800 },
];

const platformData = [
  { name: "Web", value: 45, color: "hsl(var(--primary))" },
  { name: "Android", value: 32, color: "hsl(var(--success))" },
  { name: "iOS", value: 23, color: "hsl(var(--warning))" },
];

const cohortData = [
  { cohort: "Jan '24", m1: 100, m2: 85, m3: 72, m4: 65, m5: 58, m6: 52 },
  { cohort: "Feb '24", m1: 100, m2: 82, m3: 68, m4: 61, m5: 55, m6: null },
  { cohort: "Mar '24", m1: 100, m2: 88, m3: 75, m4: 68, m5: null, m6: null },
  { cohort: "Apr '24", m1: 100, m2: 84, m3: 70, m4: null, m5: null, m6: null },
  { cohort: "May '24", m1: 100, m2: 86, m3: null, m4: null, m5: null, m6: null },
  { cohort: "Jun '24", m1: 100, m2: null, m3: null, m4: null, m5: null, m6: null },
];

const churnTimelineData = [
  { day: "Day 7", churns: 45 },
  { day: "Day 14", churns: 32 },
  { day: "Day 21", churns: 28 },
  { day: "Day 28", churns: 120 },
  { day: "Day 29", churns: 185 },
  { day: "Day 30", churns: 95 },
  { day: "Day 60", churns: 42 },
  { day: "Day 90", churns: 25 },
];

const cancellationReasons = [
  { name: "Too Expensive", value: 35, color: "hsl(var(--destructive))" },
  { name: "Not Enough Content", value: 28, color: "hsl(var(--warning))" },
  { name: "Technical Issues", value: 15, color: "hsl(var(--accent))" },
  { name: "Found Alternative", value: 12, color: "hsl(var(--muted))" },
  { name: "Other", value: 10, color: "hsl(var(--primary))" },
];

const closerContent = [
  { title: "Avengers: Endgame Trailer", conversions: 1245, rate: 8.2 },
  { title: "Spider-Man: No Way Home BTS", conversions: 982, rate: 7.5 },
  { title: "Batman: The Dark Knight", conversions: 876, rate: 6.9 },
  { title: "Squid Game S2 Teaser", conversions: 754, rate: 6.2 },
  { title: "Stranger Things Finale", conversions: 698, rate: 5.8 },
];

const timeToConvertData = [
  { days: "0-1", count: 450 },
  { days: "2-3", count: 380 },
  { days: "4-7", count: 520 },
  { days: "8-14", count: 340 },
  { days: "15-30", count: 280 },
  { days: "30+", count: 150 },
];

const engagementCorrelation = [
  { hoursWatched: 2, subscribed: 0, z: 150 },
  { hoursWatched: 5, subscribed: 0, z: 120 },
  { hoursWatched: 8, subscribed: 1, z: 80 },
  { hoursWatched: 12, subscribed: 1, z: 200 },
  { hoursWatched: 18, subscribed: 1, z: 350 },
  { hoursWatched: 25, subscribed: 1, z: 280 },
  { hoursWatched: 35, subscribed: 1, z: 420 },
  { hoursWatched: 3, subscribed: 0, z: 180 },
  { hoursWatched: 6, subscribed: 0, z: 90 },
  { hoursWatched: 10, subscribed: 1, z: 160 },
  { hoursWatched: 15, subscribed: 1, z: 240 },
  { hoursWatched: 22, subscribed: 1, z: 310 },
];

function getCohortColor(value: number | null): string {
  if (value === null) return "transparent";
  if (value >= 80) return "hsl(var(--success) / 0.8)";
  if (value >= 60) return "hsl(var(--success) / 0.5)";
  if (value >= 40) return "hsl(var(--warning) / 0.6)";
  return "hsl(var(--destructive) / 0.5)";
}

export function SubscriptionAnalytics({ timeRange: _timeRange }: { timeRange?: string }) {
  return (
    <div className="space-y-6">
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Current MRR</p>
                <p className="text-foreground text-2xl font-bold">$94,200</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="text-success h-3 w-3" />
                  <span className="text-success text-xs">+12.4%</span>
                </div>
              </div>
              <div className="bg-success/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <DollarSign className="text-success h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Avg LTV</p>
                <p className="text-foreground text-2xl font-bold">$186</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingUp className="text-success h-3 w-3" />
                  <span className="text-success text-xs">+8.2%</span>
                </div>
              </div>
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Users className="text-primary h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Churn Rate</p>
                <p className="text-foreground text-2xl font-bold">4.2%</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingDown className="text-success h-3 w-3" />
                  <span className="text-success text-xs">-0.8%</span>
                </div>
              </div>
              <div className="bg-warning/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <TrendingDown className="text-warning h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-xs">Avg Time to Convert</p>
                <p className="text-foreground text-2xl font-bold">5.2 days</p>
                <div className="mt-1 flex items-center gap-1">
                  <TrendingDown className="text-success h-3 w-3" />
                  <span className="text-success text-xs">-1.2 days</span>
                </div>
              </div>
              <div className="bg-accent/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Clock className="text-accent h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Financial Health Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AnalyticsCard title="MRR Growth (New vs Churned)" className="lg:col-span-2">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mrrData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="month"
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
                  tickFormatter={(v) => `$${v / 1000}K`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`$${value.toLocaleString()}`, ""]}
                />
                <Line
                  type="monotone"
                  dataKey="newMRR"
                  name="New MRR"
                  stroke="hsl(var(--success))"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="churnedMRR"
                  name="Churned MRR"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Revenue by Platform">
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value">
                  {platformData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number) => [`${value}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex justify-center gap-4">
            {platformData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground text-xs">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      {/* Retention & Churn Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AnalyticsCard title="Retention Cohort Analysis" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-2 py-2 text-left font-medium">Cohort</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M1</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M2</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M3</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M4</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M5</th>
                  <th className="text-muted-foreground px-2 py-2 text-center font-medium">M6</th>
                </tr>
              </thead>
              <tbody>
                {cohortData.map((row) => (
                  <tr key={row.cohort} className="border-border/50 border-b">
                    <td className="text-foreground px-2 py-2 font-medium">{row.cohort}</td>
                    {[row.m1, row.m2, row.m3, row.m4, row.m5, row.m6].map((val, i) => (
                      <td key={i} className="px-2 py-2 text-center">
                        <div
                          className="inline-block rounded px-2 py-1 text-xs font-medium"
                          style={{
                            backgroundColor: getCohortColor(val),
                            color: val !== null ? "hsl(var(--foreground))" : "transparent",
                          }}>
                          {val !== null ? `${val}%` : "-"}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Cancellation Reasons">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cancellationReasons}
                  cx="50%"
                  cy="50%"
                  outerRadius={65}
                  dataKey="value"
                  label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                  labelLine={false}>
                  {cancellationReasons.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 space-y-1">
            {cancellationReasons.slice(0, 3).map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>

      {/* Churn Timeline */}
      <AnalyticsCard title="Churn Timeline (When Users Cancel)">
        <div className="h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={churnTimelineData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
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
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar
                dataKey="churns"
                name="Cancellations"
                fill="hsl(var(--destructive))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-muted-foreground mt-2 text-center text-xs">
          ⚠️ Spike at Day 29 indicates trial period cancellations
        </p>
      </AnalyticsCard>

      {/* Conversion Attribution Section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <AnalyticsCard title='"The Closer" Content' icon={Video} iconClassName="text-primary">
          <div className="space-y-2">
            {closerContent.map((item, i) => (
              <div
                key={i}
                className="border-border/30 flex items-center justify-between border-b py-1.5 last:border-0">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-4 text-xs">{i + 1}.</span>
                  <span className="text-foreground max-w-[140px] truncate text-xs">
                    {item.title}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-success text-xs font-medium">{item.conversions}</span>
                  <span className="text-muted-foreground ml-1 text-xs">({item.rate}%)</span>
                </div>
              </div>
            ))}
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Time to Convert">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeToConvertData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="days"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Bar
                  dataKey="count"
                  name="Users"
                  fill="hsl(var(--primary))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        <AnalyticsCard title="Engagement vs Subscription">
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  type="number"
                  dataKey="hoursWatched"
                  name="Hours Watched"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  type="number"
                  dataKey="subscribed"
                  name="Subscribed"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={11}
                  tickLine={false}
                  domain={[-0.5, 1.5]}
                  tickFormatter={(v) => (v === 1 ? "Yes" : v === 0 ? "No" : "")}
                />
                <ZAxis type="number" dataKey="z" range={[40, 200]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                  formatter={(value: number, name: string) => {
                    if (name === "Subscribed") return [value === 1 ? "Yes" : "No", name];
                    return [value, name];
                  }}
                />
                <Scatter name="Users" data={engagementCorrelation} fill="hsl(var(--primary))" />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Users with 10+ hours watched are 3x more likely to subscribe
          </p>
        </AnalyticsCard>
      </div>
    </div>
  );
}
