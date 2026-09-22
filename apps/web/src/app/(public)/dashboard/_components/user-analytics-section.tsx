"use client";

import { Eye, Gauge, Heart, Play, Repeat, Rocket, SkipForward, Timer } from "lucide-react";

import { fmtCount, REGION_ANALYTICS, type UserAnalyticsData } from "../constants";
import { MetricTile } from "./metric-tile";

// Content-quality signals — completion rate is the single best one.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface UserAnalyticsSectionProps {
  data?: UserAnalyticsData;
}

export function UserAnalyticsSection({
  data = REGION_ANALYTICS["global"]!.userAnalytics,
}: UserAnalyticsSectionProps) {
  const completionPct = Math.round((data.completes / data.starts) * 100);
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile
        label="Video starts → completes"
        value={`${completionPct}%`}
        sub={`${fmtCount(data.starts)} starts · ${fmtCount(data.completes)} completes — your single best content-quality signal`}
        icon={Play}
        accent="text-primary"
        trend={{ direction: "up", label: "+3.2%" }}
      />
      <MetricTile
        label="Avg watch / % watched"
        value={`${data.avgWatchPct}%`}
        sub={`${data.avgWatchSecs}s of avg ${data.avgClipSecs}s`}
        icon={Timer}
        accent="text-accent"
        trend={{ direction: "up", label: "+1.4%" }}
      />
      <MetricTile
        label="Swipe-through rate"
        value={`${data.swipeThroughPct}%`}
        sub="abandon < 3s — lower is better"
        icon={SkipForward}
        accent="text-warning"
        trend={{ direction: "down", label: "−0.9%", good: true }}
      />
      <MetricTile
        label="Re-watches / loops"
        value={`${data.rewatchLoops}×`}
        sub="avg loops on short clips"
        icon={Repeat}
        accent="text-success"
        trend={{ direction: "up", label: "+0.2×" }}
      />
      <MetricTile
        label="Engagement / session"
        value={String(data.engagementPerSession)}
        sub="likes + shares + saves + comments"
        icon={Heart}
        accent="text-featured"
        trend={{ direction: "up", label: "+0.5" }}
      />
      <MetricTile
        label="Content velocity"
        value={String(data.videosPerSession)}
        sub={`videos / session · ${data.videosPerDay} / day per user`}
        icon={Gauge}
        accent="text-primary"
        trend={{ direction: "up", label: "+1.1" }}
      />
      <MetricTile
        label="Completion rate (live lib)"
        value={`${data.completionLivePct}%`}
        sub="weighted across published"
        icon={Eye}
        accent="text-accent"
        trend={{ direction: "flat", label: "0%" }}
      />
      <MetricTile
        label="Hit rate (new uploads)"
        value={`${data.hitRatePct}%`}
        sub=">10K views in 30 days"
        icon={Rocket}
        accent="text-success"
        trend={{ direction: "up", label: "+4%" }}
      />
    </div>
  );
}
