"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import { StatTile } from "@/components/custom/stat-tile";

import { GlassCard } from "../../games/_components/glass-card";
import { AdStatusBadge } from "../_components/ad-status-badge";
import {
  type AdStatus,
  dailyImpressions,
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
              {ad.advertiser} · {fmtDateRange(ad.startsAt, ad.endsAt)} · every {ad.frequency} reels ·{" "}
              {regionsLabel(ad.regions)}
            </p>
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
          <div className="grid gap-3 sm:grid-cols-3">
            <StatTile label="Impressions" value={fmtNum(impressions)} description="Times the ad was shown" />
            <StatTile label="Completion rate" value={`${completionRate}%`} description="Plays watched to the end" />
            <StatTile label="CTR" value={`${ctr}%`} description="Views that tapped the button" />
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
