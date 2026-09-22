"use client";

import { useEffect, useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Camera } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { COUNTRY_DATA, type CountryData } from "../constants";

export type MapMetric = "activity" | "points" | "revenue";

interface MapCell {
  code: string;
  name: string;
  value: number;
  intensity: number;
}

const METRICS: { key: MapMetric; label: string }[] = [
  { key: "activity", label: "Activity (users)" },
  { key: "points", label: "Points Economy" },
  { key: "revenue", label: "Revenue" },
];

const metricValue = (c: CountryData, m: MapMetric) =>
  m === "activity" ? c.users : m === "points" ? c.points : c.revenue;

const fmt = (v: number, m: MapMetric) =>
  m === "revenue"
    ? `$${(v / 1000).toFixed(1)}K`
    : v >= 1_000_000
      ? `${(v / 1_000_000).toFixed(1)}M`
      : `${(v / 1000).toFixed(0)}K`;

/** Cells for a given metric — exported so the master Export can mirror the active view. */
export function mapCells(metric: MapMetric): MapCell[] {
  const max = Math.max(...COUNTRY_DATA.map((c) => metricValue(c, metric)));
  return COUNTRY_DATA.map((c) => ({
    code: c.code,
    name: c.name,
    value: metricValue(c, metric),
    intensity: metricValue(c, metric) / max,
  }));
}

export const MAP_METRIC_LABEL = (m: MapMetric) => METRICS.find((x) => x.key === m)?.label ?? m;

interface HoverState {
  name: string;
  value: number;
  x: number;
  y: number;
}

interface GlobalActivityMapProps {
  /** lets the master page export the values of the currently active metric */
  onMetricChange?: (metric: MapMetric) => void;
}

// The Master/Regional level switch was removed — the client could not tell what it did,
// and every cell already clicks through to that region's full analytics.
export function GlobalActivityMap({ onMetricChange }: GlobalActivityMapProps) {
  const [metric, setMetric] = useState<MapMetric>("activity");
  const [hover, setHover] = useState<HoverState | null>(null);
  const [snapshotAt, setSnapshotAt] = useState<string>("—");

  // set after mount (avoid SSR hydration mismatch; async so the effect body stays setState-free)
  useEffect(() => {
    const t = setTimeout(() => setSnapshotAt(new Date().toLocaleString()), 0);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    onMetricChange?.(metric);
  }, [metric, onMetricChange]);

  const cells = mapCells(metric);

  const color = (intensity: number) => {
    const hue = metric === "points" ? 270 : metric === "revenue" ? 142 : 217;
    return `hsla(${hue}, 91%, 60%, ${0.3 + intensity * 0.7})`;
  };

  return (
    <div className="space-y-3">
      {/* Controls — metric mode, snapshot */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="bg-muted/30 inline-flex rounded-lg p-1">
          {METRICS.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetric(m.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                metric === m.key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {m.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-muted-foreground flex items-center gap-1 text-[11px]">
            <Camera className="h-3 w-3" /> Snapshot · {snapshotAt}
          </span>
        </div>
      </div>

      <div className="relative min-h-[240px]">
        <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-6">
          {cells.map((c) => (
            <Link
              key={c.code}
              href={`/dashboard/region/${c.code}` as Route}
              className="border-border hover:border-primary/50 focus-visible:ring-primary relative cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none"
              style={{ backgroundColor: color(c.intensity) }}
              onMouseEnter={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                setHover({
                  name: c.name,
                  value: c.value,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 10,
                });
              }}
              onMouseLeave={() => setHover(null)}>
              <div className="text-center">
                <span className="text-foreground text-xs font-bold">{c.code}</span>
                <div className="text-foreground-secondary mt-0.5 text-[10px]">
                  {fmt(c.value, metric)}
                </div>
              </div>
            </Link>
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
            top countries · {METRICS.find((m) => m.key === metric)?.label}
          </span>
          <span className="text-primary ml-auto">Click a region for full analytics</span>
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
          <p className="text-muted-foreground mt-0.5 text-[11px]">View analytics →</p>
        </div>
      )}
    </div>
  );
}
