"use client";

import { DollarSign, Globe, TrendingDown, Users } from "lucide-react";

import { MetricTile } from "@/components/custom/metric-tile";
import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

// Mock regional subscription metrics (derives from subscriptions ⋈ users.country_code later).
// Sums to the platform totals shown on the dashboard: 8,923 subscribers · $98.5K MRR.
const REGION_ROWS: RegionRow[] = [
  {
    code: "NA",
    label: "North America",
    values: { subscribers: 2600, mrr: 41000, arpu: 15.8, churn: 3.1 },
    countries: [
      { name: "United States", values: { subscribers: 2050, mrr: 33000, arpu: 16.1, churn: 3.0 } },
      { name: "Canada", values: { subscribers: 550, mrr: 8000, arpu: 14.5, churn: 3.4 } },
    ],
  },
  {
    code: "EU",
    label: "Europe",
    values: { subscribers: 2100, mrr: 31000, arpu: 14.8, churn: 2.8 },
    countries: [
      { name: "United Kingdom", values: { subscribers: 1150, mrr: 18000, arpu: 15.7, churn: 2.6 } },
      { name: "Germany", values: { subscribers: 950, mrr: 13000, arpu: 13.7, churn: 3.0 } },
    ],
  },
  {
    code: "APAC",
    label: "Asia-Pacific",
    values: { subscribers: 2900, mrr: 19500, arpu: 6.7, churn: 4.6 },
    countries: [
      { name: "India", values: { subscribers: 1900, mrr: 11500, arpu: 6.1, churn: 5.2 } },
      { name: "Japan", values: { subscribers: 1000, mrr: 8000, arpu: 8.0, churn: 3.6 } },
    ],
  },
  {
    code: "LATAM",
    label: "Latin America",
    values: { subscribers: 880, mrr: 4600, arpu: 5.2, churn: 5.1 },
    countries: [
      { name: "Brazil", values: { subscribers: 600, mrr: 3100, arpu: 5.2, churn: 5.3 } },
      { name: "Mexico", values: { subscribers: 280, mrr: 1500, arpu: 5.4, churn: 4.7 } },
    ],
  },
  {
    code: "MEA",
    label: "Middle East & Africa",
    values: { subscribers: 443, mrr: 2400, arpu: 5.4, churn: 5.8 },
  },
];

const money = (n: number) => `$${n.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
const money2 = (n: number) => `$${n.toFixed(2)}`;
const pct = (n: number) => `${n.toFixed(1)}%`;

export function SubscriptionRegionalAnalytics({ timeRange: _timeRange }: { timeRange?: string }) {
  const totalSubs = REGION_ROWS.reduce((s, r) => s + r.values.subscribers!, 0);
  const totalMrr = REGION_ROWS.reduce((s, r) => s + r.values.mrr!, 0);
  const arpu = totalMrr / totalSubs;
  const churn =
    REGION_ROWS.reduce((s, r) => s + r.values.churn! * r.values.subscribers!, 0) / totalSubs;

  return (
    <div className="space-y-6">
      {/* Global summary */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile icon={Users} label="Subscribers (global)" value={totalSubs.toLocaleString()} accent="text-primary" />
        <MetricTile icon={DollarSign} label="MRR (global)" value={money(totalMrr)} accent="text-success" sub={`ARR ${money(totalMrr * 12)}`} />
        <MetricTile icon={Globe} label="ARPU (global)" value={money2(arpu)} accent="text-accent" />
        <MetricTile icon={TrendingDown} label="Blended churn" value={pct(churn)} accent="text-warning" />
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
