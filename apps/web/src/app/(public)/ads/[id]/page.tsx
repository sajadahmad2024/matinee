"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useParams } from "next/navigation";

import { ArrowLeft, BarChart3, ExternalLink, Video } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { GlassCard } from "../../games/_components/glass-card";
import { AdStatusBadge } from "../_components/ad-status-badge";
import { type AdStatus, getAdById, regionsLabel } from "../constants";

const fmtDateTime = (v: string) =>
  new Date(v).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-border/30 grid grid-cols-[8rem_1fr] gap-3 border-b py-2 text-sm last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground min-w-0 break-words">{children}</dd>
    </div>
  );
}

/** Ad details — creative, delivery and schedule. Analytics live at /ads/[id]/analytics. */
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
            <p className="text-muted-foreground text-sm">{ad.advertiser}</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="gap-2">
            <Link href={`/ads/${ad.id}/analytics` as Route}>
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/ads/${ad.id}/edit` as Route}>Edit</Link>
          </Button>
          {(status === "live" || status === "scheduled") && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("paused");
                toast.success("Ad paused");
              }}>
              Pause
            </Button>
          )}
          {status === "paused" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setStatus("live");
                toast.success("Ad resumed");
              }}>
              Resume
            </Button>
          )}
          {status !== "ended" && (
            <Button
              variant="outline"
              size="sm"
              className="text-destructive"
              onClick={() => setConfirmEnd(true)}>
              End
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-4xl space-y-6">
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Video</CardTitle>
            <span className="text-muted-foreground text-xs">{ad.durationSecs}s · 16:9</span>
          </CardHeader>
          <CardContent>
            <div className="border-border aspect-video w-full overflow-hidden rounded-lg border bg-black">
              {ad.videoUrl ? (
                <video src={ad.videoUrl} controls playsInline className="h-full w-full object-contain" />
              ) : (
                <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-xs">
                  <Video className="h-6 w-6" />
                  No preview available
                </div>
              )}
            </div>
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl>
              <DetailRow label="Advertiser">{ad.advertiser}</DetailRow>
              <DetailRow label="Caption">{ad.caption || "—"}</DetailRow>
              <DetailRow label="Button">{ad.ctaLabel}</DetailRow>
              <DetailRow label="Link">
                <a
                  href={ad.ctaUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary inline-flex items-center gap-1 hover:underline">
                  {ad.ctaUrl}
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
              </DetailRow>
            </dl>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Delivery & schedule
              </p>
              <dl>
                <DetailRow label="Regions">{regionsLabel(ad.regions)}</DetailRow>
                <DetailRow label="Starts">{fmtDateTime(ad.startsAt)}</DetailRow>
                <DetailRow label="Ends">{fmtDateTime(ad.endsAt)}</DetailRow>
              </dl>
            </div>
          </CardContent>
        </GlassCard>
      </div>

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
