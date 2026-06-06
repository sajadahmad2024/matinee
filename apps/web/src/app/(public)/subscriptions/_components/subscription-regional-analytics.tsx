"use client";

import { DollarSign, Globe, TrendingDown, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

// Mock regional subscription metrics (derives from subscriptions ⋈ users.country_code later).
const REGION_ROWS: RegionRow[] = [
  {
    code: "NA",
    label: "North America",
    values: { subscribers: 1240, mrr: 18400, arpu: 14.8, churn: 3.1 },
    countries: [
      { name: "United States", values: { subscribers: 1010, mrr: 15200, arpu: 15.0, churn: 3.0 } },
      { name: "Canada", values: { subscribers: 230, mrr: 3200, arpu: 13.9, churn: 3.4 } },
    ],
  },
  {
    code: "EU",
    label: "Europe",
    values: { subscribers: 980, mrr: 14700, arpu: 15.0, churn: 2.8 },
    countries: [
      { name: "United Kingdom", values: { subscribers: 540, mrr: 8600, arpu: 15.9, churn: 2.6 } },
      { name: "Germany", values: { subscribers: 440, mrr: 6100, arpu: 13.9, churn: 3.0 } },
    ],
  },
  {
    code: "APAC",
    label: "Asia-Pacific",
    values: { subscribers: 2210, mrr: 11600, arpu: 5.2, churn: 4.6 },
    countries: [
      { name: "India", values: { subscribers: 1480, mrr: 5900, arpu: 4.0, churn: 5.2 } },
      { name: "Japan", values: { subscribers: 730, mrr: 5700, arpu: 7.8, churn: 3.6 } },
    ],
  },
  {
    code: "LATAM",
    label: "Latin America",
    values: { subscribers: 640, mrr: 2600, arpu: 4.1, churn: 5.1 },
    countries: [
      { name: "Brazil", values: { subscribers: 430, mrr: 1700, arpu: 4.0, churn: 5.3 } },
      { name: "Mexico", values: { subscribers: 210, mrr: 900, arpu: 4.3, churn: 4.7 } },
    ],
  },
  {
    code: "MEA",
    label: "Middle East & Africa",
    values: { subscribers: 310, mrr: 1500, arpu: 4.8, churn: 5.8 },
  },
];

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const money2 = (n: number) => `$${n.toFixed(2)}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

export function SubscriptionRegionalAnalytics() {
  const totalSubs = REGION_ROWS.reduce((s, r) => s + r.values.subscribers!, 0);
  const totalMrr = REGION_ROWS.reduce((s, r) => s + r.values.mrr!, 0);
  const arpu = totalMrr / totalSubs;
  const churn =
    REGION_ROWS.reduce((s, r) => s + r.values.churn! * r.values.subscribers!, 0) / totalSubs;

  return (
    <div className="space-y-6">
      {/* Global summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <GlobalTile icon={Users} label="Subscribers (global)" value={totalSubs.toLocaleString()} accent="text-primary" />
        <GlobalTile icon={DollarSign} label="MRR (global)" value={money(totalMrr)} accent="text-success" sub={`ARR ${money(totalMrr * 12)}`} />
        <GlobalTile icon={Globe} label="ARPU (global)" value={money2(arpu)} accent="text-accent" />
        <GlobalTile icon={TrendingDown} label="Blended churn" value={pct(churn)} accent="text-warning" />
      </div>

      {/* Regional breakdown */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Globe className="text-muted-foreground h-4 w-4" />
          <h3 className="text-foreground text-sm font-semibold">Subscriptions by region</h3>
          <span className="text-muted-foreground text-xs">click a region to drill into countries</span>
        </div>
        <RegionalBreakdown
          shareKey="mrr"
          columns={[
            { key: "subscribers", label: "Subscribers" },
            { key: "mrr", label: "MRR", format: money },
            { key: "arpu", label: "ARPU", format: money2 },
            { key: "churn", label: "Churn", format: pct },
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
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
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
        {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
      </CardContent>
    </Card>
  );
}
