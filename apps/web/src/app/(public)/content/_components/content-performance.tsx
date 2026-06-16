"use client";

import { Activity, Gamepad2, Heart, Target, Timer } from "lucide-react";

import { PERFORMANCE_SUMMARY as PERF } from "../constants";
import { SectionHeading } from "./section-heading";
import { StatTile } from "./stat-tile";

export function ContentPerformance() {
  return (
    <section className="space-y-3">
      <SectionHeading
        title="Content Performance"
        subtitle="Engagement funnel signals across the live library"
        icon={Activity}
        action={
          <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
            <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
            {PERF.activeConcurrentViewers.toLocaleString()} watching now
          </span>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Avg Watch Time"
          value={PERF.avgWatchTime}
          icon={Timer}
          accent="primary"
          trend={{
            direction: PERF.avgWatchTimeTrendPct >= 0 ? "up" : "down",
            label: `${PERF.avgWatchTimeTrendPct >= 0 ? "+" : ""}${PERF.avgWatchTimeTrendPct}%`,
          }}
          subStats={PERF.avgWatchByRegion.map((r) => ({ label: r.region, value: r.value }))}
        />

        <StatTile
          label="Game Conversion"
          value={`${PERF.gameConversionPct}%`}
          icon={Gamepad2}
          accent="accent"
          trend={{
            direction: PERF.gameConversionTrendPct >= 0 ? "up" : "down",
            label: `${PERF.gameConversionTrendPct >= 0 ? "+" : ""}${PERF.gameConversionTrendPct}% vs last mo`,
          }}
          sparkline={PERF.gameConversionSpark}
          subStats={[{ label: "Viewer → Player", value: `${PERF.gameConversionPct}%` }]}
        />

        <StatTile
          label="Hit Rate"
          value={`${PERF.hitRatePct}%`}
          icon={Target}
          accent="success"
          sparkline={PERF.hitRateSpark}
          subStats={[
            { label: "This month's uploads", value: `${PERF.hitRatePct}%` },
            { label: "Threshold", value: PERF.hitRateThreshold },
          ]}
        />

        <StatTile
          label="Avg Engagement Rate"
          value={`${PERF.avgEngagementRatePct}%`}
          icon={Heart}
          accent="danger"
          trend={{
            direction: PERF.avgEngagementTrendPct >= 0 ? "up" : "down",
            label: `${PERF.avgEngagementTrendPct >= 0 ? "+" : ""}${PERF.avgEngagementTrendPct}%`,
          }}
          sparkline={PERF.avgEngagementSpark}
          subStats={[{ label: "(likes+comments+shares+saves) ÷ views", value: "all live" }]}
        />
      </div>
    </section>
  );
}
