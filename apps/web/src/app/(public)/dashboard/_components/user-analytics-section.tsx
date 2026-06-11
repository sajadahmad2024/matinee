"use client";

import { Eye, Gauge, Heart, Play, Repeat, Rocket, SkipForward, Timer } from "lucide-react";

import { MetricTile } from "./metric-tile";

// Content-quality signals — completion rate is the single best one.
export function UserAnalyticsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <MetricTile
        label="Video starts → completes"
        value="68%"
        sub="1.84M starts · 1.25M completes"
        icon={Play}
        accent="text-primary"
        trend={{ direction: "up", label: "+3.2%" }}
      />
      <MetricTile
        label="Avg watch / % watched"
        value="82%"
        sub="18.6s of avg 22.7s"
        icon={Timer}
        accent="text-accent"
        trend={{ direction: "up", label: "+1.4%" }}
      />
      <MetricTile
        label="Swipe-through rate"
        value="11.3%"
        sub="abandon < 3s — lower is better"
        icon={SkipForward}
        accent="text-warning"
        trend={{ direction: "down", label: "−0.9%", good: true }}
      />
      <MetricTile
        label="Re-watches / loops"
        value="2.1×"
        sub="avg loops on short clips"
        icon={Repeat}
        accent="text-success"
        trend={{ direction: "up", label: "+0.2×" }}
      />
      <MetricTile
        label="Engagement / session"
        value="4.7"
        sub="likes + shares + saves + comments"
        icon={Heart}
        accent="text-featured"
        trend={{ direction: "up", label: "+0.5" }}
      />
      <MetricTile
        label="Content velocity"
        value="14.2"
        sub="videos / session · 38 / day per user"
        icon={Gauge}
        accent="text-primary"
        trend={{ direction: "up", label: "+1.1" }}
      />
      <MetricTile
        label="Completion rate (live lib)"
        value="64%"
        sub="weighted across published"
        icon={Eye}
        accent="text-accent"
        trend={{ direction: "flat", label: "0%" }}
      />
      <MetricTile
        label="Hit rate (new uploads)"
        value="62%"
        sub=">10K views in 30 days"
        icon={Rocket}
        accent="text-success"
        trend={{ direction: "up", label: "+4%" }}
      />
    </div>
  );
}
