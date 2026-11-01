"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { downloadCsv } from "@/app/_libs/download-csv";
import { useAdCampaign, useAdCampaignPerformance } from "@/app/_libs/hooks/api/use-admin-ads";
import { formatCount, formatDateRange, formatRatioPct } from "@/app/_libs/utils/format";
import {
  AnalyticsDateFilter,
  analyticsWindowFor,
  useAnalyticsDateRange,
} from "@/components/custom/analytics-date-filter";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { GlassCard } from "@/components/custom/glass-card";
import { PageHeader } from "@/components/custom/page-header";
import { StatTile } from "@/components/custom/stat-tile";
import { StatusBadge } from "@/components/custom/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";

import { AdImpressionsChart } from "../../../_components/ad-impressions-chart";
import { AdQueryState } from "../../../_components/ad-query-state";
import { AdAnalyticsSkeleton, AdAnalyticsStatsSkeleton } from "../../../_components/ad-skeletons";
import { AD_ROUTES, AD_STATUS_LABELS, regionsLabel } from "../../../_libs/ad-config";
import { AdAudienceCards } from "./ad-audience-cards";

export function AdAnalyticsClient({ id }: { id: string }) {
  const { campaignQuery, campaign: ad } = useAdCampaign(id);
  const listHref = useReturnTo(AD_ROUTES.LIST);
  const { label: rangeLabel, timeRange, window: range } = useAnalyticsDateRange();
  // "All time" has no preset window: the ad's flight so far, up to the current hour (a stable key)
  const perfWindow = range ?? {
    from: ad?.startsAt ?? new Date(0).toISOString(),
    to: analyticsWindowFor("24h")!.to,
  };
  const { performanceQuery, performance } = useAdCampaignPerformance(ad?.id, perfWindow);

  if (!ad) return <AdQueryState query={campaignQuery} skeleton={<AdAnalyticsSkeleton />} />;

  const totals = performance?.totals;
  const daily = performance?.daily ?? [];
  // a failed window (e.g. an old link wider than the backend's 366 days) shows why, not empty tiles
  const statsFailed = performanceQuery?.isError && !performance;
  // first load only — a new date range keeps the previous numbers on screen (keepPreviousData)
  const statsLoading = performanceQuery?.isPending;

  // Export: one row per day, the tile metrics as columns.
  const exportCsv = () =>
    downloadCsv(`ad-${ad?.id}-${timeRange}.csv`, [
      ["Date", "Impressions", "Unique reach", "Clicks", "CTR %", "Completion rate %"],
      ...(daily?.map((d) => [
        d?.day,
        d?.impressions,
        d?.uniqueViewers,
        d?.clicks,
        ((d?.ctr ?? 0) * 100).toFixed(1),
        ((d?.completionRate ?? 0) * 100).toFixed(1),
      ]) ?? []),
    ]);

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={ad?.name}
        backHref={AD_ROUTES.details(ad?.id, listHref)}
        backLabel="Back to the ad"
        titleAddon={
          <StatusBadge
            status={ad?.status}
            label={AD_STATUS_LABELS[ad?.status]}
            className="text-[10px]"
          />
        }
        subtitle={`${ad?.advertiserName ?? ""} · ${formatDateRange(ad?.startsAt, ad?.endsAt, { short: true })} · ${regionsLabel(ad?.regions)}`}>
        {ad?.caption && (
          <p className="text-foreground-secondary mt-1 max-w-2xl text-sm">{ad?.caption}</p>
        )}
      </PageHeader>

      {statsLoading ? (
        <AdAnalyticsStatsSkeleton />
      ) : (
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
              <Button
                variant="outline"
                className="gap-2"
                onClick={exportCsv}
                disabled={!daily?.length}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {statsFailed ? (
            <CustomRetryState
              title="Couldn't load the stats"
              description={performanceQuery?.error?.message}
              onRetry={() => void performanceQuery?.refetch()}
              isRetrying={performanceQuery?.isFetching}
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                <StatTile
                  label="Impressions"
                  value={formatCount(totals?.impressions)}
                  description="Times the ad was shown"
                />
                <StatTile
                  label="Unique reach"
                  value={formatCount(totals?.uniqueViewers)}
                  description="Different users who saw it"
                />
                <StatTile
                  label="Clicks"
                  value={formatCount(totals?.clicks)}
                  description="Button taps"
                />
                <StatTile
                  label="CTR"
                  value={formatRatioPct(totals?.ctr)}
                  description="Views that tapped the button"
                />
                <StatTile
                  label="Completion rate"
                  value={formatRatioPct(totals?.completionRate)}
                  description="Plays watched to the end"
                />
              </div>

              <GlassCard>
                <CardHeader>
                  <CardTitle className="text-base">Impressions per day</CardTitle>
                </CardHeader>
                <CardContent>
                  <AdImpressionsChart data={daily} />
                </CardContent>
              </GlassCard>

              <AdAudienceCards
                frequency={performance?.frequency ?? []}
                byRegion={performance?.byRegion ?? []}
              />
            </>
          )}

          <p className="text-muted-foreground text-xs">
            <span className="text-foreground-secondary font-medium">How these are counted:</span> an
            impression is each time the ad appears on screen (the same user twice counts twice).
            Unique reach counts each user once. Completion rate is plays watched to the end ÷
            impressions.
          </p>
        </>
      )}
    </div>
  );
}
