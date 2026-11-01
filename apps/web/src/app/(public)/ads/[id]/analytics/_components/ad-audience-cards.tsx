"use client";

import { Globe, Repeat } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

import { regionLabel } from "@/app/_libs/regions";
import { formatCount, formatRatioPct } from "@/app/_libs/utils/format";
import { GlassCard } from "@/components/custom/glass-card";

import { isMacroRegion } from "../../../_libs/ad-config";
import type { AdCampaignPerformanceDto } from "../../../_libs/ad-types";

const SEEN_LABELS: Record<string, string> = {
  "1": "Seen once",
  "2": "Seen twice",
  "3": "Seen 3 times",
  "4+": "Seen 4+ times",
};

/** Buckets that count as "seen 3 or more times" for the fatigue note. */
const FATIGUE_BUCKETS = ["3", "4+"];

/**
 * Who the ad reached in the selected window: how often each reached user saw it, and impressions
 * by region (`frequency` / `byRegion` from `GET /campaigns/:id/performance`).
 */
export function AdAudienceCards({
  frequency,
  byRegion,
}: Pick<AdCampaignPerformanceDto, "frequency" | "byRegion">) {
  const reached = frequency?.reduce((sum, f) => sum + (f?.users ?? 0), 0) ?? 0;
  const seen3Plus =
    frequency
      ?.filter((f) => FATIGUE_BUCKETS.includes(f?.seen))
      ?.reduce((sum, f) => sum + (f?.share ?? 0), 0) ?? 0;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Repeat className="text-primary h-4 w-4" />
            How often users saw it
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Share of reached users by times the ad was seen
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {reached > 0 ? (
            <>
              {frequency?.map((f) => (
                <div key={f?.seen} className="flex items-center gap-3 text-sm">
                  <span className="text-foreground w-28 shrink-0">
                    {SEEN_LABELS[f?.seen] ?? f?.seen}
                  </span>
                  <Progress value={Math.min(100, (f?.share ?? 0) * 100)} className="h-2 flex-1" />
                  <span className="text-foreground-secondary w-12 shrink-0 text-right text-xs tabular-nums">
                    {formatRatioPct(f?.share)}
                  </span>
                </div>
              ))}
              <p className="text-muted-foreground border-border/30 border-t pt-3 text-xs">
                <span className="text-foreground font-medium">{formatRatioPct(seen3Plus)}</span> of
                users saw it 3 or more times. A high share can mean users are tiring of the ad.
              </p>
            </>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No signed-in viewers in this range.
            </p>
          )}
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
          {byRegion?.length ? (
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
                {byRegion?.map((r) => (
                  <tr
                    key={r?.region ?? "unknown"}
                    className="border-border/30 border-b last:border-b-0">
                    <td className="text-foreground py-2">
                      {r?.region && isMacroRegion(r.region)
                        ? regionLabel(r.region)
                        : (r?.region ?? "Unknown")}
                    </td>
                    <td className="py-2 text-right tabular-nums">{formatCount(r?.impressions)}</td>
                    <td className="py-2 text-right tabular-nums">{formatRatioPct(r?.share)}</td>
                    <td className="py-2 text-right tabular-nums">{formatRatioPct(r?.ctr)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No impressions in this range.
            </p>
          )}
        </CardContent>
      </GlassCard>
    </div>
  );
}
