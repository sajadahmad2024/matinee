"use client";

import { Activity, BarChart3, Eye, Gamepad2, LogIn, Smartphone } from "lucide-react";

import { fmtCount, fmtDuration, REGION_ANALYTICS, type ScreenTimeData } from "../constants";
import { MetricTile } from "./metric-tile";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

// Screen time & session quality for one region: viewers vs gamified split, session length
// distribution, 24h × 7d usage heatmap, and login/logout drop-out proxies.
// Region-scoped via the `data` prop; defaults to the global baseline.
interface SessionQualitySectionProps {
  data?: ScreenTimeData;
}

export function SessionQualitySection({
  data = REGION_ANALYTICS["global"]!.screenTime,
}: SessionQualitySectionProps) {
  const gamifiedRate = Math.round((data.gamified / data.viewers) * 100);
  const maxBucket = Math.max(...data.sessionBuckets.map((b) => b.pct));
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricTile
          label="Viewership (not active)"
          value={fmtCount(data.viewers)}
          sub="passive viewers in this region"
          icon={Eye}
          accent="text-primary"
        />
        <MetricTile
          label="Viewers with gamification"
          value={fmtCount(data.gamified)}
          sub={`${gamifiedRate}% of viewers actively gamify`}
          icon={Gamepad2}
          accent="text-accent"
        />
        <MetricTile
          label="BG ↔ FG transitions"
          value={String(data.bgFgPerSession)}
          sub="re-entries / session / day — login/drop-out proxy"
          icon={LogIn}
          accent="text-warning"
          pending="needs sessions"
        />
        <MetricTile
          label="Doomscroll depth"
          value={`${data.doomscrollVideos} videos`}
          sub={`· ${data.doomscrollMinutes} min per user / session`}
          icon={Smartphone}
          accent="text-featured"
          pending="needs sessions"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Session length distribution histogram */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-1 flex items-center gap-1.5 text-sm font-medium">
            <BarChart3 className="text-primary h-4 w-4" /> Session length distribution
          </p>
          <p className="text-muted-foreground mb-3 text-[11px]">
            avg {fmtDuration(data.sessionAvgSecs)} · median {fmtDuration(data.sessionMedianSecs)}
          </p>
          <div className="flex items-end gap-2" style={{ height: 120 }}>
            {data.sessionBuckets.map((b) => (
              <div key={b.bucket} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
                <span className="text-muted-foreground text-[10px] tabular-nums">{b.pct}%</span>
                <div
                  className="from-primary to-accent w-full rounded-t-sm bg-gradient-to-t"
                  style={{ height: `${(b.pct / maxBucket) * 80}%` }}
                />
                <span className="text-muted-foreground text-[10px]">{b.bucket}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Time-of-day heatmap — 24h × 7d usage intensity */}
        <div className="border-border bg-card/50 rounded-lg border p-4">
          <p className="text-foreground mb-3 flex items-center gap-1.5 text-sm font-medium">
            <Activity className="text-accent h-4 w-4" /> Time-of-day usage (24h × 7d)
          </p>
          <div className="space-y-1">
            {data.heatmap.map((row, d) => (
              <div key={DAYS[d]} className="flex items-center gap-1">
                <span className="text-muted-foreground w-7 shrink-0 text-[10px]">{DAYS[d]}</span>
                <div className="grid flex-1 grid-cols-[repeat(24,minmax(0,1fr))] gap-px">
                  {row.map((v, h) => (
                    <div
                      key={h}
                      title={`${DAYS[d]} ${String(h).padStart(2, "0")}:00 — ${Math.round(v * 100)}%`}
                      className="aspect-square rounded-[2px]"
                      style={{ backgroundColor: `hsla(217, 91%, 60%, ${0.08 + v * 0.85})` }}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="flex items-center gap-1 pl-8">
              {[0, 6, 12, 18, 23].map((h) => (
                <span key={h} className="text-muted-foreground flex-1 text-[9px]">
                  {String(h).padStart(2, "0")}h
                </span>
              ))}
            </div>
          </div>
          <p className="text-muted-foreground mt-2 text-[11px]">Evenings (6–10 PM) drive most sessions; weekends run heavier.</p>
        </div>
      </div>
    </div>
  );
}
