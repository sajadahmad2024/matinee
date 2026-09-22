"use client";

import { DollarSign, TrendingUp, Users, Wallet } from "lucide-react";

import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

import { REGION_ANALYTICS, type MonetizationData } from "../constants";
import { ConversionFunnelChart } from "./conversion-funnel-chart";
import { MetricTile } from "./metric-tile";

// Cross-region comparison stays as a "vs other regions" footnote — it helps the operator
// rank the region they're looking at.
const REGION_ROWS: RegionRow[] = [
  { code: "NA", label: "North America", values: { trialToPaid: 38, arpu: 14.8 } },
  { code: "EU", label: "Europe", values: { trialToPaid: 34, arpu: 15.0 } },
  { code: "APAC", label: "Asia-Pacific", values: { trialToPaid: 19, arpu: 5.2 } },
  { code: "LATAM", label: "Latin America", values: { trialToPaid: 16, arpu: 4.1 } },
  { code: "MEA", label: "Middle East & Africa", values: { trialToPaid: 14, arpu: 4.8 } },
];

const pct = (n: number) => `${n}%`;
const money = (n: number) => `$${n.toFixed(2)}`;

// Monetization & funnel — ARPU/ARPDAU, trial-to-paid, LTV:CAC by channel, and the
// signup → first session → engaged → subscriber funnel with drop-offs.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface MonetizationSectionProps {
  data?: MonetizationData;
}

export function MonetizationSection({
  data = REGION_ANALYTICS["global"]!.monetization,
}: MonetizationSectionProps) {
  const channels = data.channels;
  const maxLtv = Math.max(...channels.map((c) => c.ltv)) * 1.1;
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="ARPU" value={`$${data.arpu.toFixed(2)}`} sub="MRR ÷ subscribers" icon={DollarSign} accent="text-success" trend={{ direction: "up", label: "+4%" }} />
        <MetricTile label="ARPDAU" value={`$${data.arpdau.toFixed(2)}`} sub="per daily active user" icon={DollarSign} accent="text-accent" pending="needs sessions" />
        <MetricTile label="Trial → paid" value={`${data.trialToPaidPct}%`} sub="viewers vs subscribers" icon={TrendingUp} accent="text-primary" trend={{ direction: "up", label: "+2%" }} />
        <MetricTile label="LTV : CAC" value={`${data.ltvCacRatio}×`} sub="blended (healthy > 3×)" icon={Wallet} accent="text-success" pending="needs CAC" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Funnel with drop-off at each step */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Users className="text-primary h-4 w-4" /> Signup → first session → engaged → subscribed
          </p>
          <ConversionFunnelChart funnel={data.funnel} />
        </div>

        {/* LTV by acquisition channel (vs CAC) + cross-region footnote */}
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
                    <div className="bg-success h-full rounded-full" style={{ width: `${(c.ltv / maxLtv) * 100}%` }} />
                  </div>
                  <span className="text-foreground w-24 shrink-0 text-right tabular-nums">
                    ${c.ltv} / ${c.cac} · {(c.ltv / c.cac).toFixed(1)}×
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="border-border bg-card/50 rounded-lg border p-4">
            <p className="text-foreground mb-2 text-sm font-medium">
              Trial → paid vs other regions
            </p>
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
