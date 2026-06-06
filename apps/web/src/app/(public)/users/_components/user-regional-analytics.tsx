"use client";

import { Globe, TrendingDown, UserPlus, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

// Mock per-region user metrics (derives from users.country_code later).
const REGION_ROWS: RegionRow[] = [
  {
    code: "NA",
    label: "North America",
    values: { users: 18400, newUsers: 1240, activePct: 64, churnPct: 4.2 },
    countries: [
      { name: "United States", values: { users: 14200, newUsers: 980, activePct: 66, churnPct: 4.0 } },
      { name: "Canada", values: { users: 4200, newUsers: 260, activePct: 60, churnPct: 4.8 } },
    ],
  },
  {
    code: "EU",
    label: "Europe",
    values: { users: 12100, newUsers: 870, activePct: 61, churnPct: 4.6 },
    countries: [
      { name: "United Kingdom", values: { users: 6400, newUsers: 470, activePct: 63, churnPct: 4.3 } },
      { name: "Germany", values: { users: 5700, newUsers: 400, activePct: 59, churnPct: 4.9 } },
    ],
  },
  {
    code: "APAC",
    label: "Asia-Pacific",
    values: { users: 22900, newUsers: 2310, activePct: 58, churnPct: 5.4 },
    countries: [
      { name: "India", values: { users: 11800, newUsers: 1480, activePct: 55, churnPct: 5.9 } },
      { name: "Japan", values: { users: 5100, newUsers: 420, activePct: 62, churnPct: 4.4 } },
      { name: "Australia", values: { users: 6000, newUsers: 410, activePct: 60, churnPct: 4.8 } },
    ],
  },
  {
    code: "LATAM",
    label: "Latin America",
    values: { users: 6300, newUsers: 540, activePct: 56, churnPct: 5.7 },
    countries: [
      { name: "Brazil", values: { users: 4300, newUsers: 380, activePct: 57, churnPct: 5.5 } },
      { name: "Mexico", values: { users: 2000, newUsers: 160, activePct: 54, churnPct: 6.1 } },
    ],
  },
  {
    code: "MEA",
    label: "Middle East & Africa",
    values: { users: 3100, newUsers: 290, activePct: 52, churnPct: 6.3 },
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
        <GlobalTile icon={Users} label="Users (global)" value={num(totalUsers)} accent="text-primary" />
        <GlobalTile icon={UserPlus} label="New this month" value={num(totalNew)} accent="text-success" />
        <GlobalTile icon={Globe} label="Active rate" value={pct(activePct)} accent="text-accent" />
        <GlobalTile icon={TrendingDown} label="Blended churn" value={pct(churnPct)} accent="text-warning" />
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

function GlobalTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <Card className="border-border/50 bg-card/50">
      <CardContent className="p-4">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Icon className={`h-4 w-4 ${accent}`} />
          {label}
        </div>
        <p className={`font-gaming mt-1 text-2xl font-bold ${accent}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
