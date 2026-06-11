"use client";

import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react";

import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

import { ConversionFunnelChart } from "./conversion-funnel-chart";
import { MetricTile } from "./metric-tile";

// Trial-to-paid conversion by region (viewers vs subscribers).
const REGION_ROWS: RegionRow[] = [
  { code: "NA", label: "North America", values: { trialToPaid: 38, arpu: 14.8 } },
  { code: "EU", label: "Europe", values: { trialToPaid: 34, arpu: 15.0 } },
  { code: "APAC", label: "Asia-Pacific", values: { trialToPaid: 19, arpu: 5.2 } },
  { code: "LATAM", label: "Latin America", values: { trialToPaid: 16, arpu: 4.1 } },
  { code: "MEA", label: "Middle East & Africa", values: { trialToPaid: 14, arpu: 4.8 } },
];

// LTV by acquisition channel vs CAC.
const channels = [
  { channel: "Organic / viral", ltv: 84, cac: 6 },
  { channel: "Paid social", ltv: 61, cac: 22 },
  { channel: "Referral", ltv: 78, cac: 9 },
  { channel: "Influencer", ltv: 69, cac: 18 },
];

const pct = (n: number) => `${n}%`;
const money = (n: number) => `$${n.toFixed(2)}`;

export function MonetizationSection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="ARPU" value="$10.20" sub="per active user / mo" icon={DollarSign} accent="text-success" trend={{ direction: "up", label: "+4%" }} />
        <MetricTile label="ARPDAU" value="$0.34" sub="per daily active user" icon={DollarSign} accent="text-accent" pending="needs sessions" />
        <MetricTile label="Trial → paid" value="31%" sub="blended across regions" icon={TrendingUp} accent="text-primary" trend={{ direction: "up", label: "+2%" }} />
        <MetricTile label="LTV : CAC" value="4.6×" sub="blended (healthy > 3×)" icon={Wallet} accent="text-success" pending="needs CAC" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funnel */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Users className="text-primary h-4 w-4" /> Signup → first session → engaged → subscribed
          </p>
          <ConversionFunnelChart />
        </div>

        {/* LTV by channel + trial-to-paid by region */}
        <div className="space-y-4">
          <div className="border-border bg-card/50 rounded-lg border p-4">
            <p className="text-foreground mb-2 text-sm font-medium">
              LTV by acquisition channel <span className="text-muted-foreground text-xs">(vs CAC)</span>
              <span className="bg-muted/40 text-muted-foreground ml-2 rounded-full px-1.5 py-0.5 text-[10px]">needs CAC</span>
            </p>
            <div className="space-y-2">
              {channels.map((c) => (
                <div key={c.channel} className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground w-28 shrink-0">{c.channel}</span>
                  <div className="bg-muted/30 h-2.5 flex-1 overflow-hidden rounded-full">
                    <div className="bg-success h-full rounded-full" style={{ width: `${(c.ltv / 90) * 100}%` }} />
                  </div>
                  <span className="text-foreground w-20 shrink-0 text-right tabular-nums">
                    ${c.ltv} / ${c.cac}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-card/50 rounded-lg border p-4">
            <p className="text-foreground mb-2 text-sm font-medium">Trial → paid by region</p>
            <RegionalBreakdown
              shareKey="trialToPaid"
              columns={[
                { key: "trialToPaid", label: "Trial→Paid", format: pct },
                { key: "arpu", label: "ARPU", format: money },
              ]}
              rows={REGION_ROWS}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
