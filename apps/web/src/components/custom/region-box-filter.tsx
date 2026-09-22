"use client";

import { useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { cn } from "@/app/_libs/utils/cn";

export interface RegionBoxMetric {
  key: string;
  /** Toggle + legend label, e.g. "Active bidders". */
  label: string;
  /** Hue of the heat ramp — mirrors the dashboard map (217 activity, 270 points, 142 revenue). */
  hue?: number;
  /** Value per region code, including the "all" sentinel. */
  values: Record<string, number>;
  format?: (n: number) => string;
}

export interface RegionBoxOption {
  /** "all" / "global" sentinel, or a macro-region code (NA, EU, APAC, LATAM, MEA). */
  code: string;
  /** Full name — shown in the hover tooltip, as on the dashboard map. */
  label: string;
}

interface RegionBoxFilterProps {
  /** Currently selected code. */
  active: string;
  options: RegionBoxOption[];
  /** The code that means "everything" — selecting it clears ?region= from the URL. */
  allCode: string;
  metrics: RegionBoxMetric[];
  className?: string;
}

interface HoverState {
  name: string;
  value: number;
  x: number;
  y: number;
}

const compact = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
};

/**
 * Region lens using the dashboard global-activity-map treatment — same metric toggle,
 * heat cells, Low→High legend and hover tooltip — but selecting a cell filters the page
 * (?region=) instead of navigating. Shared by Games format analytics and Rewards.
 */
export function RegionBoxFilter({
  active,
  options,
  allCode,
  metrics,
  className,
}: RegionBoxFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [metricKey, setMetricKey] = useState(metrics[0]!.key);
  const [hover, setHover] = useState<HoverState | null>(null);

  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0]!;
  const fmt = metric.format ?? compact;

  const select = (code: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (code === allCode) {
      params.delete("region");
    } else {
      params.set("region", code);
    }
    const qs = params.toString();
    router.push((qs ? `${pathname}?${qs}` : pathname) as Route, { scroll: false });
  };

  // Same ramp as the dashboard map.
  const color = (intensity: number) =>
    `hsla(${metric.hue ?? 217}, 91%, 60%, ${0.3 + intensity * 0.7})`;

  // Heat is relative to the busiest single region — the "all" total would flatten it.
  const peak = Math.max(
    ...options.filter((o) => o.code !== allCode).map((o) => metric.values[o.code] ?? 0),
    1,
  );

  return (
    <div className={cn("space-y-3", className)}>
      {/* Metric mode — the dashboard map's control row */}
      {metrics.length > 1 && (
        <div className="bg-muted/30 inline-flex rounded-lg p-1">
          {metrics.map((m) => (
            <button
              key={m.key}
              type="button"
              onClick={() => setMetricKey(m.key)}
              className={cn(
                "rounded-md px-3 py-1 text-xs transition-colors",
                metricKey === m.key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {m.label}
            </button>
          ))}
        </div>
      )}

      <div className="relative">
        <div className="grid grid-cols-3 gap-2 p-2 sm:grid-cols-6">
          {options.map((o) => {
            const value = metric.values[o.code] ?? 0;
            const isActive = o.code === active;
            const isAll = o.code === allCode;
            return (
              <button
                key={o.code}
                type="button"
                aria-pressed={isActive}
                onClick={() => select(o.code)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHover({
                    name: o.label,
                    value,
                    x: rect.left + rect.width / 2,
                    y: rect.top - 10,
                  });
                }}
                onMouseLeave={() => setHover(null)}
                className={cn(
                  "border-border hover:border-primary/50 focus-visible:ring-primary relative cursor-pointer rounded-lg border p-3 transition-all duration-200 hover:scale-105 focus-visible:ring-2 focus-visible:outline-none",
                  // "All" is a reset, not a territory — a heat fill would make it permanently
                  // the brightest cell and read as selected.
                  isAll && "bg-muted/40",
                  isActive && "border-primary shadow-glow-sm shadow-primary/10 scale-105",
                )}
                style={isAll ? undefined : { backgroundColor: color(value / peak) }}>
                <div className="text-center">
                  <span className="text-foreground text-xs font-bold">
                    {isAll ? "ALL" : o.code}
                  </span>
                  <div className="text-foreground-secondary mt-0.5 text-[10px]">{fmt(value)}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="text-muted-foreground mt-2 flex items-center gap-2 text-xs">
          <span>Low</span>
          <div className="flex gap-0.5">
            {[0.2, 0.4, 0.6, 0.8, 1].map((i) => (
              <div key={i} className="h-3 w-5 rounded-sm" style={{ backgroundColor: color(i) }} />
            ))}
          </div>
          <span>High</span>
          <span className="ml-2">macro-regions · {metric.label}</span>
          <span className="text-primary ml-auto">Click a region to filter</span>
        </div>
      </div>

      {hover && (
        <div
          className="glass-card animate-fade-in pointer-events-none fixed z-50 rounded-lg px-3 py-2 text-sm"
          style={{ left: hover.x, top: hover.y, transform: "translate(-50%, -100%)" }}>
          <p className="text-foreground font-semibold">{hover.name}</p>
          <p className="text-primary mt-1 text-xs">
            {fmt(hover.value)} {metric.label.toLowerCase()}
          </p>
          <p className="text-muted-foreground mt-0.5 text-[11px]">Filter this region →</p>
        </div>
      )}
    </div>
  );
}
