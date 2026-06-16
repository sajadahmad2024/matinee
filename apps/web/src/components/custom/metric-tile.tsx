"use client";

import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

interface MetricTileProps {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ElementType;
  accent?: string; // tailwind text color e.g. "text-primary"
  trend?: { direction: "up" | "down" | "flat"; label: string; good?: boolean };
  /** badge for data not yet wired (external integration / DB pending) */
  pending?: string;
}

/** Shared metric tile used across dashboard + regional analytics (one tile to rule them all). */
export function MetricTile({ label, value, sub, icon: Icon, accent = "text-foreground", trend, pending }: MetricTileProps) {
  return (
    <div className="border-border bg-card/50 rounded-lg border p-4">
      <div className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className={cn("h-4 w-4", accent)} />}
          {label}
        </span>
        {trend && <Trend {...trend} />}
        {pending && (
          <span className="bg-muted/40 text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px]">
            {pending}
          </span>
        )}
      </div>
      <p className={cn("font-gaming mt-1.5 text-2xl font-bold tabular-nums", accent)}>{value}</p>
      {sub && <p className="text-muted-foreground mt-0.5 text-xs">{sub}</p>}
    </div>
  );
}

function Trend({ direction, label, good }: { direction: "up" | "down" | "flat"; label: string; good?: boolean }) {
  const Icon = direction === "up" ? ArrowUpRight : direction === "down" ? ArrowDownRight : ArrowRight;
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
