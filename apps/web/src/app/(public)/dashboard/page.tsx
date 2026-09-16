"use client";

import { useEffect, useState } from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Download, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MACRO_REGIONS } from "@/app/_libs/regions";
import { SectionHeading } from "@/components/custom/section-heading";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import {
  GlobalActivityMap,
  MAP_METRIC_LABEL,
  type MapMetric,
  mapCells,
} from "./_components/global-activity-map";
import { RealTimePulse } from "./_components/real-time-pulse";
import { ViewershipSplit } from "./_components/viewership-split";
import { type CsvRow, downloadCsv } from "./_libs/download-csv";
import { REGION_ANALYTICS, TIME_RANGE_LABELS } from "./constants";

// Master dashboard = a management snapshot with exactly three sections: live stat row,
// global activity map (click a region for full analytics), viewership-vs-gamification
// split. Everything else lives on /dashboard/region/[code] (7 boxed sections).
export default function DashboardPage() {
  // Simulate live updating numbers
  const [liveUsers, setLiveUsers] = useState(12405);
  const [liveGameSessions, setLiveGameSessions] = useState(3847);
  const [subscribedUsers] = useState(8923);
  const [signedUpUsers] = useState(248500);
  // $ attached to those subscribers — the count on its own never showed what they are
  // worth. Lifetime revenue, derived from the Avg LTV the Subscriptions module reports,
  // so the two screens never disagree.
  const avgLifetimeValue = 186;
  const lifetimeRevenue = subscribedUsers * avgLifetimeValue;

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
      setLiveGameSessions((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Installs, incl. devices that never signed up — distinct from signed-up accounts.
  const totalDownloads = 312000;

  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "30d";
  const timeRangeLabel = TIME_RANGE_LABELS[timeRange] ?? timeRange;

  // The map's active view, mirrored so Export covers what the operator is looking at.
  const [mapMetric, setMapMetric] = useState<MapMetric>("activity");

  // Export = all three master sections: stat row, per-cell map values for the active
  // metric mode, and the viewership-split table.
  const exportDashboard = () => {
    const rows: CsvRow[] = [
      ["Section", "Metric", "Value"],
      ["Live stats", "Total Downloads", totalDownloads],
      ["Live stats", "Total Users", signedUpUsers],
      ["Live stats", "Total Subscribers", subscribedUsers],
      ["Live stats", "Subscriber lifetime revenue", lifetimeRevenue],
      ["Live stats", "Avg lifetime value", avgLifetimeValue],
      ["Live stats", "Online Now", liveUsers],
      ["Live stats", "Playing Games", liveGameSessions],
      ["Live stats", "Period", timeRangeLabel],
    ];
    for (const cell of mapCells(mapMetric)) {
      rows.push([`Activity map (${MAP_METRIC_LABEL(mapMetric)})`, cell.name, cell.value]);
    }
    for (const r of MACRO_REGIONS) {
      const a = REGION_ANALYTICS[r.code]!;
      rows.push(["Viewership split", `${r.label} — viewers`, a.screenTime.viewers]);
      rows.push(["Viewership split", `${r.label} — gamified`, a.screenTime.gamified]);
    }
    downloadCsv(`dashboard-master-${timeRange}.csv`, rows);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Dashboard</h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Global snapshot — click a region for detailed analytics
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Showing</span>
            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 font-medium">
              Global
            </span>
            <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
              {timeRangeLabel}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeSelector defaultValue={timeRange} />
          <Button variant="outline" className="gap-2" onClick={exportDashboard}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Section 1 — master stat row (live) */}
      <RealTimePulse
        totalDownloads={totalDownloads}
        totalUsers={signedUpUsers}
        subscribedUsers={subscribedUsers}
        lifetimeRevenue={lifetimeRevenue}
        avgLifetimeValue={avgLifetimeValue}
        liveUsers={liveUsers}
        liveGameSessions={liveGameSessions}
      />

      {/* Section 2 — global activity map, cells click through to region analytics */}
      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <SectionHeading
          title="Global Activity Map"
          subtitle="Heat by users, points economy, or revenue — click a region for full analytics"
          icon={Globe}
          action={
            <Link
              href="/dashboard/region/global"
              className="text-muted-foreground hover:text-primary text-xs transition-colors">
              View global analytics →
            </Link>
          }
        />
        <GlobalActivityMap onMetricChange={setMapMetric} />
      </section>

      {/* Section 3 — viewership vs active gamification (rows click through) */}
      <ViewershipSplit />
    </div>
  );
}
