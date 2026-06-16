"use client";

import { useEffect, useState } from "react";

import { Camera, Download } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";
import { MACRO_REGIONS, type MacroRegion, regionForCountry } from "@/app/_libs/regions";

interface CountryData {
  code: string;
  name: string;
  users: number;
  revenue: number;
  points: number; // points earned (gamification activity)
  intensity: number; // 0-1
}

// Users sum to ~248,500 and revenue to ~$98.5K MRR (consistent with the dashboard + regional views).
const countryData: CountryData[] = [
  { code: "US", name: "United States", users: 58000, revenue: 33000, points: 4200000, intensity: 0.9 },
  { code: "IN", name: "India", users: 47000, revenue: 11500, points: 6100000, intensity: 0.75 },
  { code: "GB", name: "United Kingdom", users: 26000, revenue: 18000, points: 720000, intensity: 0.55 },
  { code: "AU", name: "Australia", users: 23000, revenue: 6000, points: 640000, intensity: 0.45 },
  { code: "DE", name: "Germany", users: 22000, revenue: 13000, points: 510000, intensity: 0.4 },
  { code: "JP", name: "Japan", users: 21000, revenue: 8000, points: 2800000, intensity: 0.5 },
  { code: "KR", name: "South Korea", users: 12000, revenue: 3000, points: 2300000, intensity: 0.35 },
  { code: "ID", name: "Indonesia", users: 12000, revenue: 1800, points: 2600000, intensity: 0.3 },
  { code: "PH", name: "Philippines", users: 9000, revenue: 1500, points: 3100000, intensity: 0.28 },
  { code: "TH", name: "Thailand", users: 7500, revenue: 1000, points: 1700000, intensity: 0.22 },
  { code: "VN", name: "Vietnam", users: 6000, revenue: 800, points: 1500000, intensity: 0.18 },
  { code: "MY", name: "Malaysia", users: 5000, revenue: 900, points: 1100000, intensity: 0.15 },
];

type Level = "master" | "regional";
type Metric = "activity" | "points" | "revenue";

interface MapCell {
  code: string;
  name: string;
  value: number;
  intensity: number;
}

const METRICS: { key: Metric; label: string }[] = [
  { key: "activity", label: "Activity (users)" },
  { key: "points", label: "Points Economy" },
  { key: "revenue", label: "Revenue" },
];

const metricValue = (c: CountryData, m: Metric) =>
  m === "activity" ? c.users : m === "points" ? c.points : c.revenue;

const fmt = (v: number, m: Metric) =>
  m === "revenue"
    ? `$${(v / 1000).toFixed(1)}K`
    : v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : `${(v / 1000).toFixed(0)}K`;

interface HoverState {
  name: string;
  value: number;
  x: number;
  y: number;
}

export function GlobalActivityMap() {
  const [level, setLevel] = useState<Level>("master");
  const [metric, setMetric] = useState<Metric>("activity");
  const [hover, setHover] = useState<HoverState | null>(null);
  const [snapshotAt, setSnapshotAt] = useState<string>("—");

  // set on mount (avoid SSR hydration mismatch)
  useEffect(() => {
    setSnapshotAt(new Date().toLocaleString());
  }, []);

  const max = Math.max(...countryData.map((c) => metricValue(c, metric)));
  let cells: MapCell[];
  if (level === "master") {
    cells = countryData.map((c) => ({
      code: c.code,
      name: c.name,
      value: metricValue(c, metric),
      intensity: metricValue(c, metric) / max,
    }));
  } else {
    const byRegion = new Map<MacroRegion, number>();
    for (const c of countryData) {
      const r = regionForCountry(c.code);
      byRegion.set(r, (byRegion.get(r) ?? 0) + metricValue(c, metric));
    }
    const rMax = Math.max(...byRegion.values());
    cells = MACRO_REGIONS.filter((r) => byRegion.has(r.code)).map((r) => ({
      code: r.code,
      name: r.label,
      value: byRegion.get(r.code)!,
      intensity: byRegion.get(r.code)! / rMax,
    }));
  }

  const color = (intensity: number) => {
    const hue = metric === "points" ? 270 : metric === "revenue" ? 142 : 217;
    return `hsla(${hue}, 91%, 60%, ${0.3 + intensity * 0.7})`;
  };

  const exportCsv = () => {
    const header = `${level === "master" ? "country" : "region"},${metric}\n`;
    const rows = cells.map((c) => `${c.name},${c.value}`).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `global-activity-${level}-${metric}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-3">
      {/* Controls — Master/Regional, metric mode, snapshot, export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="bg-muted/30 inline-flex rounded-lg p-1">
          {(["master", "regional"] as Level[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLevel(l)}
              className={cn(
                "rounded-md px-3 py-1 text-sm capitalize transition-colors",
                level === l ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
              )}>
              {l}
            </button>
          ))}
        </div>
        <div className="bg-muted/30 inline-flex rounded-lg p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                metric === m.key ? "bg-background text-foreground" : "text-muted-foreground hover:text-foreground",
              )}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Camera className="h-3 w-3" /> Snapshot · {snapshotAt}
          </span>
          <Button variant="outline" size="sm" className="h-8 gap-1.5" onClick={exportCsv}>
            <Download className="h-3.5 w-3.5" /> Export
          </Button>
        </div>
      </div>

      <div className="relative min-h-[240px]">
        <div className={cn("grid gap-2 p-2", level === "master" ? "grid-cols-6" : "grid-cols-5")}>
          {cells.map((c) => (
            <div
              key={c.code}
              className="border-border hover:border-primary/50 relative cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: color(c.intensity) }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHover({ name: c.name, value: c.value, x: rect.left + rect.width / 2, y: rect.top - 10 });
              }}
              onMouseLeave={() => setHover(null)}>
              <div className="text-center">
                <span className="text-foreground text-xs font-bold">{c.code}</span>
                <div className="text-foreground-secondary mt-0.5 text-[10px]">{fmt(c.value, metric)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
          <span>Low</span>
          <div className="flex gap-0.5">
            {[0.2, 0.4, 0.6, 0.8, 1].map((i) => (
              <div key={i} className="h-3 w-5 rounded-sm" style={{ backgroundColor: color(i) }} />
            ))}
          </div>
          <span>High</span>
          <span className="ml-2">
            {level === "regional" ? "macro-regions" : "top countries"} ·{" "}
            {METRICS.find((m) => m.key === metric)?.label}
          </span>
        </div>
      </div>

      {hover && (
        <div
          className="glass-card animate-fade-in pointer-events-none fixed z-50 rounded-lg px-3 py-2 text-sm"
          style={{ left: hover.x, top: hover.y, transform: "translate(-50%, -100%)" }}>
          <p className="text-foreground font-semibold">{hover.name}</p>
          <p className="text-primary mt-1 text-xs">
            {fmt(hover.value, metric)} {METRICS.find((m) => m.key === metric)?.label}
          </p>
        </div>
      )}
    </div>
  );
}
