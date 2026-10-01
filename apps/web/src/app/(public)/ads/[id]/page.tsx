"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, Download, Globe, Repeat } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { AnalyticsDateFilter, useAnalyticsDateRange } from "@/components/custom/analytics-date-filter";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { StatTile } from "@/components/custom/stat-tile";

import { GlassCard } from "../../games/_components/glass-card";
import { AdStatusBadge } from "../_components/ad-status-badge";
import { downloadCsv } from "@/app/_libs/download-csv";
import { regionLabel } from "@/app/_libs/regions";

import {
  adAudience,
  type AdStatus,
  dailyImpressions,
  dailyStatsCsv,
  fmtDateRange,
  fmtNum,
  getAdById,
  regionsLabel,
} from "../constants";

export default function AdDetailPage() {
  const params = useParams<{ id: string }>();
  const found = getAdById(decodeURIComponent(params.id ?? ""));
  // status changes are local mock state
  const [status, setStatus] = useState<AdStatus | undefined>(found?.status);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const { label: rangeLabel, timeRange } = useAnalyticsDateRange();

  if (!found || !status) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-foreground text-lg font-semibold">Ad not found</p>
        <Button asChild variant="outline">
          <Link href={"/ads" as Route}>Back to Ads</Link>
        </Button>
      </div>
    );
  }

  const ad = { ...found, status };
  const { impressions, completionRate, ctr } = ad.stats;
  const clicks = Math.round((impressions * ctr) / 100);
  const audience = adAudience(ad);

  // Export: one row per date, the tile metrics as columns.
  const exportCsv = () =>
    downloadCsv(
      `ad-${ad.id}-${timeRange}.csv`,
      dailyStatsCsv(dailyImpressions(ad), { impressions, uniqueReach: audience.uniqueReach, ctr, completionRate }),
    );

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Button asChild variant="ghost" size="icon" aria-label="Back to Ads">
            <Link href={"/ads" as Route}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-gaming text-foreground text-2xl font-bold">{ad.name}</h1>
              <AdStatusBadge status={ad.status} />
            </div>
            <p className="text-muted-foreground text-sm">
              {ad.advertiser} · {fmtDateRange(ad.startsAt, ad.endsAt)} ·{" "}
              {regionsLabel(ad.regions)}
            </p>
            {ad.caption && <p className="text-foreground-secondary mt-1 max-w-2xl text-sm">{ad.caption}</p>}
          </div>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/ads/${ad.id}/edit` as Route}>Edit</Link>
          </Button>
          {(status === "live" || status === "scheduled") && (
            <Button variant="outline" size="sm" onClick={() => { setStatus("paused"); toast.success("Ad paused"); }}>
              Pause
            </Button>
          )}
          {status === "paused" && (
            <Button variant="outline" size="sm" onClick={() => { setStatus("live"); toast.success("Ad resumed"); }}>
              Resume
            </Button>
          )}
          {status !== "ended" && (
            <Button variant="outline" size="sm" className="text-destructive" onClick={() => setConfirmEnd(true)}>
              End
            </Button>
          )}
        </div>
      </div>

      {impressions > 0 ? (
        <>
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <StatTile label="Impressions" value={fmtNum(impressions)} description="Times the ad was shown" />
            <StatTile label="Unique reach" value={fmtNum(audience.uniqueReach)} description="Different users who saw it" />
            <StatTile label="Clicks" value={fmtNum(clicks)} description="Button taps" />
            <StatTile label="CTR" value={`${ctr}%`} description="Views that tapped the button" />
            <StatTile label="Completion rate" value={`${completionRate}%`} description="Plays watched to the end" />
          </div>

          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Impressions per day</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyImpressions(ad)} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 33%, 22%)" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} minTickGap={24} />
                    <YAxis tick={{ fontSize: 11, fill: "hsl(215, 20%, 65%)" }} tickFormatter={(v: number) => fmtNum(v)} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(217, 33%, 14%)",
                        border: "1px solid hsl(217, 33%, 22%)",
                        borderRadius: "6px",
                        fontSize: "11px",
                      }}
                      formatter={(v) => [fmtNum(Number(v)), "Impressions"]}
                    />
                    <Line type="monotone" dataKey="impressions" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </GlassCard>

          <div className="grid gap-6 lg:grid-cols-2">
            <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Repeat className="text-primary h-4 w-4" />
                  How often users saw it
                </CardTitle>
                <p className="text-muted-foreground text-xs">Share of reached users by times the ad was seen</p>
              </CardHeader>
              <CardContent className="space-y-3">
                {audience.frequency.map((f) => (
                  <div key={f.label} className="flex items-center gap-3 text-sm">
                    <span className="text-foreground w-28 shrink-0">{f.label}</span>
                    <div className="bg-background h-2 flex-1 overflow-hidden rounded-full">
                      <div className="bg-primary h-full rounded-full" style={{ width: `${f.share}%` }} />
                    </div>
                    <span className="text-foreground-secondary w-10 shrink-0 text-right text-xs tabular-nums">
                      {f.share}%
                    </span>
                  </div>
                ))}
                <p className="text-muted-foreground border-border/30 border-t pt-3 text-xs">
                  <span className="text-foreground font-medium">{audience.seen3Plus}%</span> of users saw it 3 or
                  more times. A high share can mean users are tiring of the ad.
                </p>
              </CardContent>
            </GlassCard>

            <GlassCard>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Globe className="text-info h-4 w-4" />
                  By region
                </CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-muted-foreground border-border/40 border-b text-xs">
                      <th className="pb-2 text-left font-medium">Region</th>
                      <th className="pb-2 text-right font-medium">Impr.</th>
                      <th className="pb-2 text-right font-medium">Share</th>
                      <th className="pb-2 text-right font-medium">CTR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {audience.byRegion.map((r) => (
                      <tr key={r.region} className="border-border/30 border-b last:border-b-0">
                        <td className="text-foreground py-2">{regionLabel(r.region)}</td>
                        <td className="py-2 text-right tabular-nums">{fmtNum(r.impressions)}</td>
                        <td className="py-2 text-right tabular-nums">{r.share}%</td>
                        <td className="py-2 text-right tabular-nums">{r.ctr.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </GlassCard>
          </div>

          <p className="text-muted-foreground text-xs">
            <span className="text-foreground-secondary font-medium">How these are counted:</span> an impression
            is each time the ad appears on screen (the same user twice counts twice). Unique reach counts each
            user once. Completion rate is plays watched to the end ÷ impressions.
          </p>
        </>
      ) : (
        <p className="text-muted-foreground border-border rounded-lg border px-4 py-10 text-center text-sm">
          Stats appear once the ad goes live.
        </p>
      )}

      <ConfirmationDialog
        open={confirmEnd}
        onOpenChange={setConfirmEnd}
        action="custom"
        title="End this ad now?"
        description={`“${ad.name}” stops showing immediately. Its stats are kept.`}
        confirmLabel="End now"
        onConfirm={() => {
          setStatus("ended");
          setConfirmEnd(false);
          toast.success("Ad ended");
        }}
      />
    </div>
  );
}
