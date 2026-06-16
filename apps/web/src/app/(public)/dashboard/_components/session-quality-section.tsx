"use client";

import { Activity, Clock, Eye, LogIn, Moon, Smartphone } from "lucide-react";

import { RegionalBreakdown, type RegionRow } from "@/components/custom/regional-breakdown";

import { MetricTile } from "./metric-tile";

// Passive viewership vs viewership WITH active gamification — whole + per region.
const REGION_ROWS: RegionRow[] = [
  { code: "NA", label: "North America", values: { viewers: 18400, gamified: 11200 } },
  { code: "EU", label: "Europe", values: { viewers: 12100, gamified: 6900 } },
  { code: "APAC", label: "Asia-Pacific", values: { viewers: 22900, gamified: 15800 } },
  { code: "LATAM", label: "Latin America", values: { viewers: 6300, gamified: 3400 } },
  { code: "MEA", label: "Middle East & Africa", values: { viewers: 3100, gamified: 1500 } },
];

// Time-of-day usage heatmap (relative intensity 0-1 per 3h block).
const hours = ["00", "03", "06", "09", "12", "15", "18", "21"];
const heat = [0.2, 0.1, 0.15, 0.4, 0.55, 0.6, 0.85, 1.0];

export function SessionQualitySection() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Session length (avg)" value="24:38" sub="median 18:10 per user" icon={Clock} accent="text-primary" pending="needs sessions" />
        <MetricTile label="Doomscroll depth (p90)" value="32" sub="deepest 10% of sessions" icon={Smartphone} accent="text-accent" pending="needs sessions" />
        <MetricTile label="BG ↔ FG transitions" value="3.1" sub="avg app switches / session" icon={LogIn} accent="text-warning" pending="needs sessions" />
        <MetricTile label="Peak usage" value="9 PM" sub="local time, all regions" icon={Moon} accent="text-featured" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Viewership: passive vs gamified, whole + region */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-2 flex items-center gap-1.5 text-sm font-medium">
            <Eye className="text-primary h-4 w-4" /> Viewership vs active gamification (by region)
          </p>
          <RegionalBreakdown
            shareKey="viewers"
            columns={[
              { key: "viewers", label: "Viewers" },
              { key: "gamified", label: "Gamified" },
            ]}
            rows={REGION_ROWS}
          />
        </div>

        {/* Time-of-day heatmap */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Activity className="text-accent h-4 w-4" /> Time-of-day usage
          </p>
          <div className="flex items-end gap-1.5">
            {hours.map((h, i) => (
              <div key={h} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="w-full rounded-sm"
                  style={{ height: `${20 + heat[i]! * 90}px`, backgroundColor: `hsla(217, 91%, 60%, ${0.3 + heat[i]! * 0.7})` }}
                />
                <span className="text-muted-foreground text-[10px]">{h}</span>
              </div>
            ))}
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">Evenings (6–9 PM) drive most sessions.</p>
        </div>
      </div>
    </div>
  );
}
