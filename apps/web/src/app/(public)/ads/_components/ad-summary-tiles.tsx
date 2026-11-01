"use client";

import { useState } from "react";

import { useAdSalesSummary } from "@/app/_libs/hooks/api/use-admin-ads";
import { EMPTY, formatCount, formatRatioPct } from "@/app/_libs/utils/format";
import { analyticsWindowFor } from "@/components/custom/analytics-date-filter";
import { StatTile } from "@/components/custom/stat-tile";

/** Live ads, and feed-ad delivery over the last 30 days (`GET /admin/ads/summary`). */
export function AdSummaryTiles() {
  const [last30Days] = useState(() => analyticsWindowFor("30d")!);
  const { summary } = useAdSalesSummary(last30Days);
  const commercial = summary?.delivery?.commercial;

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatTile
        label="Live ads"
        value={summary?.counts?.activeCommercials ?? EMPTY}
        description="Ads showing in the feed right now"
      />
      <StatTile
        label="Impressions"
        value={commercial ? formatCount(commercial?.impressions ?? 0) : EMPTY}
        description="Times ads were shown, last 30 days"
      />
      <StatTile
        label="Avg completion"
        value={
          commercial
            ? formatRatioPct(
                commercial?.impressions
                  ? (commercial?.completes ?? 0) / commercial?.impressions
                  : 0,
              )
            : EMPTY
        }
        description="Share of plays watched to the end"
      />
    </div>
  );
}
