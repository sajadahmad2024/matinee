"use client";

import type { Route } from "next";
import Link from "next/link";

import { ChevronRight, Eye } from "lucide-react";

import { SectionHeading } from "@/components/custom/section-heading";

import { MACRO_REGIONS } from "@/app/_libs/regions";

import { REGION_ANALYTICS } from "../constants";

// Slide-6 bottom table: high-level split of passive viewers vs gamified users per
// macro-region. Rows click through to the region's full analytics (same destination
// as the activity map).
export function ViewershipSplit() {
  const rows = MACRO_REGIONS.map((r) => {
    const a = REGION_ANALYTICS[r.code]!;
    return {
      code: r.code,
      label: r.label,
      viewers: a.screenTime.viewers,
      gamified: a.screenTime.gamified,
    };
  });
  const totalViewers = rows.reduce((s, r) => s + r.viewers, 0) || 1;

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Viewership vs Active Gamification"
        subtitle="High-level split of passive viewers vs gamified users, by region — click a row for full analytics"
        icon={Eye}
      />
      <div className="border-border bg-card/50 overflow-hidden rounded-lg border">
        <div className="text-muted-foreground grid grid-cols-[1.6fr_0.8fr_1fr_1fr_1.4fr_auto] items-center gap-2 border-b border-border/50 px-4 py-2 text-[11px] font-medium uppercase">
          <span>Region</span>
          <span className="text-right">Share</span>
          <span className="text-right">Viewers</span>
          <span className="text-right">Gamified</span>
          <span>Gamified rate</span>
          <span />
        </div>
        {rows.map((r) => {
          const share = Math.round((r.viewers / totalViewers) * 100);
          const rate = Math.round((r.gamified / r.viewers) * 100);
          return (
            <Link
              key={r.code}
              href={`/dashboard/region/${r.code}` as Route}
              className="hover:bg-muted/20 grid grid-cols-[1.6fr_0.8fr_1fr_1fr_1.4fr_auto] items-center gap-2 border-b border-border/30 px-4 py-2.5 text-sm transition-colors last:border-b-0">
              <span className="text-foreground font-medium">
                {r.label} <span className="text-muted-foreground text-xs">({r.code})</span>
              </span>
              <span className="text-muted-foreground text-right tabular-nums">{share}%</span>
              <span className="text-foreground text-right tabular-nums">{r.viewers.toLocaleString()}</span>
              <span className="text-foreground text-right tabular-nums">{r.gamified.toLocaleString()}</span>
              <span className="flex items-center gap-2">
                <span className="bg-muted/30 h-2 flex-1 overflow-hidden rounded-full">
                  <span
                    className="from-primary to-accent block h-full rounded-full bg-gradient-to-r"
                    style={{ width: `${rate}%` }}
                  />
                </span>
                <span className="text-muted-foreground w-9 shrink-0 text-right text-xs tabular-nums">{rate}%</span>
              </span>
              <ChevronRight className="text-muted-foreground h-4 w-4" />
            </Link>
          );
        })}
      </div>
    </section>
  );
}
