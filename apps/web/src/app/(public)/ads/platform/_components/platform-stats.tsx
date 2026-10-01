"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { AlertTriangle, BarChart3, Download, Globe, type LucideIcon, Trophy } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { downloadCsv } from "@/app/_libs/download-csv";
import { regionLabel } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { AnalyticsDateFilter, useAnalyticsDateRange } from "@/components/custom/analytics-date-filter";
import { StatTile } from "@/components/custom/stat-tile";

import { GlassCard } from "../../../games/_components/glass-card";
import {
  type AdItem,
  dailyPlatformImpressions,
  dailyStatsCsv,
  fmtNum,
  MOCK_ADS,
  MOCK_PLATFORM_STATS,
} from "../../constants";

// Fixed "Needs review" thresholds (spec-09 §4.2) — constants, not settings.
const REVIEW_MIN_IMPRESSIONS = 1_000;
const REVIEW_CTR = 1;

const pct = (n: number) => `${n.toFixed(1)}%`;

const tooltipStyle = {
  backgroundColor: "hsl(217, 33%, 14%)",
  border: "1px solid hsl(217, 33%, 22%)",
  borderRadius: "8px",
};

/** Impression-weighted average of a per-ad percentage. */
function weighted(ads: AdItem[], pick: (a: AdItem) => number, impressions: number) {
  return impressions ? ads.reduce((s, a) => s + pick(a) * a.stats.impressions, 0) / impressions : 0;
}

/** Statistics tab: platform-wide numbers for feed ads. UI-only (mock data). */
export function PlatformStats() {
  const { label: rangeLabel, timeRange } = useAnalyticsDateRange();

  const delivered = MOCK_ADS.filter((a) => a.stats.impressions > 0);
  const impressions = delivered.reduce((s, a) => s + a.stats.impressions, 0);
  const clicks = Math.round(delivered.reduce((s, a) => s + (a.stats.impressions * a.stats.ctr) / 100, 0));
  const ctr = impressions ? (clicks / impressions) * 100 : 0;
  const completion = weighted(delivered, (a) => a.stats.completionRate, impressions);
  const { uniqueReach, byRegion } = MOCK_PLATFORM_STATS;
  const activeAds = MOCK_ADS.filter((a) => a.status === "live").length;

  const byImpressions = [...delivered].sort((a, b) => b.stats.impressions - a.stats.impressions);
  const topAds = byImpressions.slice(0, 5);
  const needsReview = byImpressions.filter(
    (a) =>
      a.stats.impressions >= REVIEW_MIN_IMPRESSIONS && a.stats.ctr < REVIEW_CTR,
  );

  const daily = dailyPlatformImpressions(30);

  // Export: one row per date, the tile metrics as columns.
  const exportCsv = () =>
    downloadCsv(
      `ads-platform-${timeRange}.csv`,
      dailyStatsCsv(daily, { impressions, uniqueReach, ctr, completionRate: completion }),
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-muted-foreground">Showing</span>
          <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
            {rangeLabel}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <AnalyticsDateFilter />
          <Button variant="outline" className="gap-2" onClick={exportCsv}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        <StatTile label="Impressions" value={fmtNum(impressions)} />
        <StatTile label="Unique reach" value={fmtNum(uniqueReach)} />
        <StatTile label="Clicks" value={fmtNum(clicks)} />
        <StatTile label="CTR" value={pct(ctr)} />
        <StatTile label="Completion rate" value={pct(completion)} />
        <StatTile label="Active ads" value={activeAds} />
      </div>

      {/* Impressions over time */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="text-primary h-5 w-5" />
            Impressions over time
          </CardTitle>
          <p className="text-muted-foreground text-sm">Daily</p>
        </CardHeader>
        <CardContent>
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
                <XAxis dataKey="day" stroke="hsl(215, 20%, 65%)" fontSize={11} interval={4} />
                <YAxis stroke="hsl(215, 20%, 65%)" fontSize={11} tickFormatter={(v: number) => fmtNum(v)} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  cursor={{ fill: "hsl(217, 33%, 22%)", opacity: 0.4 }}
                  formatter={(v: number) => [v.toLocaleString(), "Impressions"]}
                />
                <Bar dataKey="impressions" fill="hsl(217, 91%, 60%)" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdTable
          title="Top ads"
          icon={Trophy}
          iconClass="text-warning"
          ads={topAds}
          empty="No impressions in this range yet."
        />
        <AdTable
          title="Needs review"
          icon={AlertTriangle}
          iconClass="text-destructive"
          description={`CTR < ${REVIEW_CTR}% (${fmtNum(REVIEW_MIN_IMPRESSIONS)}+ impressions)`}
          ads={needsReview}
          empty="All ads are performing normally."
        />
      </div>

      {/* By region */}
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="text-info h-5 w-5" />
            By region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {byRegion.map((r) => (
            <div key={r.region} className="flex items-center gap-3 text-sm">
              <span className="text-foreground w-28 shrink-0">{regionLabel(r.region)}</span>
              <div className="bg-background h-2 flex-1 overflow-hidden rounded-full">
                <div className="bg-primary h-full rounded-full" style={{ width: `${r.share}%` }} />
              </div>
              <span className="text-foreground-secondary w-28 shrink-0 text-right text-xs tabular-nums">
                {r.share}% · {pct(r.ctr)} CTR
              </span>
            </div>
          ))}
        </CardContent>
      </GlassCard>
    </div>
  );
}

function AdTable({
  title,
  description,
  icon: Icon,
  iconClass,
  ads,
  empty,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClass: string;
  ads: AdItem[];
  empty: string;
}) {
  const router = useRouter();
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className={cn("h-5 w-5", iconClass)} />
          {title}
        </CardTitle>
        {description && <p className="text-muted-foreground text-xs">{description}</p>}
      </CardHeader>
      <CardContent>
        {ads.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">{empty}</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-border/40 border-b text-xs">
                <th className="pb-2 text-left font-medium">Ad</th>
                <th className="pb-2 text-right font-medium">Impr.</th>
                <th className="pb-2 text-right font-medium">CTR</th>
                <th className="pb-2 text-right font-medium">Completion</th>
              </tr>
            </thead>
            <tbody>
              {ads.map((ad) => (
                <tr
                  key={ad.id}
                  onClick={() => router.push(`/ads/${ad.id}` as Route)}
                  className="border-border/30 hover:bg-muted/30 cursor-pointer border-b last:border-b-0">
                  <td className="py-2">
                    <p className="text-foreground font-medium">{ad.name}</p>
                    <p className="text-muted-foreground text-xs">{ad.advertiser}</p>
                  </td>
                  <td className="py-2 text-right tabular-nums">{fmtNum(ad.stats.impressions)}</td>
                  <td
                    className={cn(
                      "py-2 text-right tabular-nums",
                      ad.stats.ctr < REVIEW_CTR && "text-destructive",
                    )}>
                    {pct(ad.stats.ctr)}
                  </td>
                  <td className="py-2 text-right tabular-nums">{ad.stats.completionRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </CardContent>
    </GlassCard>
  );
}

