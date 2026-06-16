"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight, MousePointerClick } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";

type Accent = "default" | "primary" | "success" | "warning" | "danger" | "accent";

const ACCENT_TEXT: Record<Accent, string> = {
  default: "text-foreground",
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-destructive",
  accent: "text-accent",
};

const ACCENT_STROKE: Record<Accent, string> = {
  default: "hsl(215, 20%, 65%)",
  primary: "hsl(217, 91%, 60%)",
  success: "hsl(142, 71%, 45%)",
  warning: "hsl(38, 92%, 50%)",
  danger: "hsl(0, 84%, 60%)",
  accent: "hsl(270, 91%, 65%)",
};

export interface SubStat {
  label: string;
  value?: string;
  accent?: Accent;
}

interface StatTileProps {
  label: string;
  value: string | number;
  icon?: React.ElementType;
  accent?: Accent;
  /** trend chip next to the big number */
  trend?: { direction: "up" | "down" | "flat"; label: string; good?: boolean };
  /** progress-to-goal bar */
  progress?: { value: number; max: number; label?: string };
  /** mini sparkline series */
  sparkline?: number[];
  subStats?: SubStat[];
  onClick?: () => void;
  className?: string;
}

export function StatTile({
  label,
  value,
  icon: Icon,
  accent = "default",
  trend,
  progress,
  sparkline,
  subStats,
  onClick,
  className,
}: StatTileProps) {
  const interactive = typeof onClick === "function";
  return (
    <GlassCard
      onClick={onClick}
      className={cn(
        "group relative p-4",
        interactive &&
          "hover:border-primary/60 hover:ring-primary/30 hover:bg-card/70 cursor-pointer transition-all hover:ring-1",
        className,
      )}>
      {interactive && (
        <span className="bg-primary/10 text-primary absolute top-2 right-2 flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium opacity-80 transition-opacity group-hover:opacity-100">
          <MousePointerClick className="h-3 w-3" /> Open
        </span>
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
          {Icon && <Icon className={cn("h-4 w-4", ACCENT_TEXT[accent])} />}
          {label}
        </div>
        {trend && !interactive && <TrendChip {...trend} />}
      </div>

      <div className="mt-2 flex items-end justify-between gap-2">
        <p className={cn("font-gaming text-2xl font-bold tabular-nums", ACCENT_TEXT[accent])}>
          {value}
        </p>
        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} stroke={ACCENT_STROKE[accent]} />
        )}
      </div>

      {progress && (
        <div className="mt-3 space-y-1">
          <div className="bg-muted/40 h-2 overflow-hidden rounded-full">
            <div
              className={cn(
                "h-full rounded-full",
                accent === "warning"
                  ? "bg-warning"
                  : accent === "danger"
                    ? "bg-destructive"
                    : accent === "success"
                      ? "bg-success"
                      : "from-primary to-accent bg-gradient-to-r",
              )}
              style={{
                width: `${Math.min(100, Math.round((progress.value / progress.max) * 100))}%`,
              }}
            />
          </div>
          {progress.label && (
            <p className="text-muted-foreground text-[11px]">{progress.label}</p>
          )}
        </div>
      )}

      {subStats && subStats.length > 0 && (
        <div className="mt-3 space-y-1">
          {subStats.map((s, i) => (
            <div key={i} className="flex items-center justify-between gap-2 text-[11px]">
              <span className="text-muted-foreground">{s.label}</span>
              {s.value && (
                <span className={cn("font-medium tabular-nums", ACCENT_TEXT[s.accent ?? "default"])}>
                  {s.value}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </GlassCard>
  );
}

function TrendChip({
  direction,
  label,
  good,
}: {
  direction: "up" | "down" | "flat";
  label: string;
  good?: boolean;
}) {
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : ArrowRight;
  // default semantics: up = good (green), down = bad (red); override with `good`
  const positive = good ?? direction === "up";
  const tone =
    direction === "flat"
      ? "text-muted-foreground bg-muted/40"
      : positive
        ? "text-success bg-success/10"
        : "text-destructive bg-destructive/10";
  return (
    <span className={cn("flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium", tone)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

/** Lightweight inline-SVG sparkline (no chart lib per-tile). */
function Sparkline({ data, stroke }: { data: number[]; stroke: string }) {
  const w = 64;
  const h = 24;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((d - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0 overflow-visible">
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
