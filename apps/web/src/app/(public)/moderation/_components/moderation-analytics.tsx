"use client";

import { AlertTriangle, Clock, Shield, TrendingUp } from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AnalyticsCard } from "../../users/_components/analytics-card";
import { StatsCard } from "./stats-card";

const reportVolumeData = [
  { time: "00:00", reports: 12 },
  { time: "04:00", reports: 8 },
  { time: "08:00", reports: 25 },
  { time: "12:00", reports: 42 },
  { time: "16:00", reports: 38 },
  { time: "20:00", reports: 31 },
  { time: "Now", reports: 28 },
];

const violationBreakdown = [
  { name: "Hate Speech", value: 40, color: "hsl(var(--destructive))" },
  { name: "Spam", value: 25, color: "hsl(var(--warning))" },
  { name: "Harassment", value: 20, color: "hsl(var(--accent))" },
  { name: "Nudity", value: 10, color: "hsl(var(--primary))" },
  { name: "Other", value: 5, color: "hsl(var(--muted))" },
];

interface ModerationAnalyticsProps {
  pendingCount: number;
}

function getBacklogStatus(count: number) {
  if (count < 50)
    return {
      color: "text-success",
      bg: "bg-success/20",
      iconBg: "bg-success/20",
      iconColor: "text-success",
      label: "Healthy",
    };
  if (count < 100)
    return {
      color: "text-warning",
      bg: "bg-warning/20",
      iconBg: "bg-warning/20",
      iconColor: "text-warning",
      label: "Elevated",
    };
  return {
    color: "text-destructive",
    bg: "bg-destructive/20",
    iconBg: "bg-destructive/20",
    iconColor: "text-destructive",
    label: "Critical",
  };
}

export function ModerationAnalytics({ pendingCount }: ModerationAnalyticsProps) {
  const backlogStatus = getBacklogStatus(pendingCount);

  return (
    <div className="space-y-4">
      {/* Health KPIs */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <StatsCard
          label="Queue Backlog"
          value={pendingCount}
          subtitle={<span className={backlogStatus.color}>{backlogStatus.label}</span>}
          icon={AlertTriangle}
          className={backlogStatus.bg}
          iconContainerClassName={backlogStatus.iconBg}
          iconClassName={backlogStatus.iconColor}
        />

        <StatsCard
          label="Avg Resolution Time"
          value="4.2 min"
          subtitle={
            <div className="flex items-center gap-1">
              <TrendingUp className="text-success h-3 w-3" />
              <span className="text-success">-12% faster</span>
            </div>
          }
          icon={Clock}
          iconContainerClassName="bg-primary/20"
          iconClassName="text-primary"
        />

        <StatsCard
          label="Safety Score"
          value="94.2%"
          subtitle={<span className="text-muted-foreground">Safe content ratio</span>}
          icon={Shield}
          iconContainerClassName="bg-success/20"
          iconClassName="text-success"
        />

        <StatsCard
          label="Resolved Today"
          value="127"
          subtitle={<span className="text-muted-foreground">+23 from yesterday</span>}
          icon={TrendingUp}
          iconContainerClassName="bg-accent/20"
          iconClassName="text-accent"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Report Volume */}
        <AnalyticsCard title="Report Volume (24h)" className="lg:col-span-2">
          <div className="h-[160px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={reportVolumeData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                <XAxis
                  dataKey="time"
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
                <Line
                  type="monotone"
                  dataKey="reports"
                  name="Reports"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AnalyticsCard>

        {/* Violation Breakdown */}
        <AnalyticsCard title="Violation Breakdown">
          <div className="h-[120px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={violationBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={50}
                  paddingAngle={2}
                  dataKey="value">
                  {violationBreakdown.map((entry, index) => (
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
          <div className="mt-2 grid grid-cols-2 gap-1">
            {violationBreakdown.slice(0, 4).map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 text-xs">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-muted-foreground truncate">{item.name}</span>
                <span className="text-foreground font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </AnalyticsCard>
      </div>
    </div>
  );
}
