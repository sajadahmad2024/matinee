"use client";

import Link from "next/link";

import { ArrowLeft, Download, Gamepad2, MapPin, UserCheck, Users, Zap } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MetricTile } from "@/components/custom/metric-tile";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { regionLabel } from "@/app/_libs/regions";

import { fmtCount, TIME_RANGE_LABELS, type RegionAnalytics } from "../../../constants";

// Region page header: back to master, region identity, scope controls, export —
// plus the "Main statistics for this region" strip (slide 7's top box).
interface RegionHeaderProps {
  analytics: RegionAnalytics;
  timeRange: string;
  onExport: () => void;
}

export function RegionHeader({ analytics, timeRange, onExport }: RegionHeaderProps) {
  const isGlobal = analytics.code === "global";
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-muted-foreground hover:text-foreground mb-1 inline-flex items-center gap-1 text-xs transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Dashboard
          </Link>
          <h1 className="font-gaming text-foreground text-3xl font-bold">
            {isGlobal ? "Global Analytics" : `${analytics.name} Analytics`}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {!isGlobal && (
              <span className="bg-primary/10 text-primary flex items-center gap-1 rounded px-2 py-0.5 font-medium">
                <MapPin className="h-3 w-3" /> {analytics.code}
              </span>
            )}
            {analytics.macro && (
              <span className="bg-accent/10 text-accent rounded px-2 py-0.5 font-medium">
                part of {regionLabel(analytics.macro)}
              </span>
            )}
            <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
              {TIME_RANGE_LABELS[timeRange] ?? timeRange}
            </span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <TimeRangeSelector defaultValue={timeRange} />
          <Button variant="outline" className="gap-2" onClick={onExport}>
            <Download className="h-4 w-4" />
            Export report
          </Button>
        </div>
      </div>

      {/* Main statistics for this region */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile label="Users" value={fmtCount(analytics.strip.users)} sub="signed up in this region" icon={Users} accent="text-primary" />
        <MetricTile label="Subscribers" value={fmtCount(analytics.strip.subscribers)} sub="active paid subscriptions" icon={UserCheck} accent="text-success" />
        <MetricTile label="Online now" value={fmtCount(analytics.strip.onlineNow)} sub="live in the app" icon={Zap} accent="text-accent" />
        <MetricTile label="Playing now" value={fmtCount(analytics.strip.playingNow)} sub="in a game session" icon={Gamepad2} accent="text-featured" />
      </div>
    </div>
  );
}
