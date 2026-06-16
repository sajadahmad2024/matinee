"use client";

import { Globe, TrendingDown, UserPlus, Users } from "lucide-react";

import { MetricTile } from "@/components/custom/metric-tile";
import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

// Mock per-region user metrics (derives from users.country_code later).
// Sums to the platform totals shown on the dashboard: 248,500 users · 24,817 new this period.
const REGION_ROWS: RegionRow[] = [
  {
    code: "NA",
    label: "North America",
    values: { users: 73000, newUsers: 7300, activePct: 64, churnPct: 4.2 },
    countries: [
      { name: "United States", values: { users: 58000, newUsers: 5800, activePct: 66, churnPct: 4.0 } },
      { name: "Canada", values: { users: 15000, newUsers: 1500, activePct: 60, churnPct: 4.8 } },
    ],
  },
  {
    code: "EU",
    label: "Europe",
    values: { users: 48000, newUsers: 4800, activePct: 61, churnPct: 4.6 },
    countries: [
      { name: "United Kingdom", values: { users: 26000, newUsers: 2600, activePct: 63, churnPct: 4.3 } },
      { name: "Germany", values: { users: 22000, newUsers: 2200, activePct: 59, churnPct: 4.9 } },
    ],
  },
  {
    code: "APAC",
    label: "Asia-Pacific",
    values: { users: 91000, newUsers: 9100, activePct: 58, churnPct: 5.4 },
    countries: [
      { name: "India", values: { users: 47000, newUsers: 5000, activePct: 55, churnPct: 5.9 } },
      { name: "Japan", values: { users: 21000, newUsers: 1900, activePct: 62, churnPct: 4.4 } },
      { name: "Australia", values: { users: 23000, newUsers: 2200, activePct: 60, churnPct: 4.8 } },
    ],
  },
  {
    code: "LATAM",
    label: "Latin America",
    values: { users: 25000, newUsers: 2500, activePct: 56, churnPct: 5.7 },
    countries: [
      { name: "Brazil", values: { users: 17000, newUsers: 1700, activePct: 57, churnPct: 5.5 } },
      { name: "Mexico", values: { users: 8000, newUsers: 800, activePct: 54, churnPct: 6.1 } },
    ],
  },
  {
    code: "MEA",
    label: "Middle East & Africa",
    values: { users: 11500, newUsers: 1117, activePct: 52, churnPct: 6.3 },
  },
];

const num = (n: number) => n.toLocaleString();
const pct = (n: number) => `${n.toFixed(n % 1 ? 1 : 0)}%`;

export function UserRegionalAnalytics() {
  const totalUsers = REGION_ROWS.reduce((s, r) => s + r.values.users!, 0);
  const totalNew = REGION_ROWS.reduce((s, r) => s + r.values.newUsers!, 0);
  const activePct =
    REGION_ROWS.reduce((s, r) => s + r.values.activePct! * r.values.users!, 0) / totalUsers;
  const churnPct =
    REGION_ROWS.reduce((s, r) => s + r.values.churnPct! * r.values.users!, 0) / totalUsers;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={Users} label="Users (global)" value={num(totalUsers)} accent="text-primary" />
        <MetricTile icon={UserPlus} label="New this month" value={num(totalNew)} accent="text-success" />
        <MetricTile icon={Globe} label="Active rate" value={pct(activePct)} accent="text-accent" />
        <MetricTile icon={TrendingDown} label="Blended churn" value={pct(churnPct)} accent="text-warning" />
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="text-muted-foreground h-4 w-4" />
          <h3 className="text-foreground text-sm font-semibold">Users by region</h3>
          <span className="text-muted-foreground text-xs">click a region to drill into countries</span>
        </div>
        <RegionalBreakdown
          shareKey="users"
          columns={[
            { key: "users", label: "Users", format: num },
            { key: "newUsers", label: "New", format: num },
            { key: "activePct", label: "Active", format: pct },
            { key: "churnPct", label: "Churn", format: pct },
          ]}
          rows={REGION_ROWS}
        />
      </div>
    </div>
  );
}
