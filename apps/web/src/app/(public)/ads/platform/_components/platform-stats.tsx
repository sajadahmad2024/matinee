"use client";

import { useRouter } from "next/navigation";

import { AlertTriangle, BarChart3, Download, Globe, type LucideIcon, Trophy } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { AdSalesCommercialRowDto } from "@/app/_libs/api/generated";
import { downloadCsv } from "@/app/_libs/download-csv";
import { useAdSalesSummary } from "@/app/_libs/hooks/api/use-admin-ads";
import { regionLabel } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { EMPTY, formatCount, formatRatioPct } from "@/app/_libs/utils/format";
import {
  AnalyticsDateFilter,
  analyticsWindowFor,
  useAnalyticsDateRange,
} from "@/components/custom/analytics-date-filter";
import { type Column, DataTable } from "@/components/custom/data-table";
import { GlassCard } from "@/components/custom/glass-card";
import { StatTile } from "@/components/custom/stat-tile";
import { useCurrentHref } from "@/hooks/use-return-to";

import { AdImpressionsChart } from "../../_components/ad-impressions-chart";
import { AD_ROUTES, isMacroRegion } from "../../_libs/ad-config";

/** Platform-wide numbers for feed ads (`GET /admin/ads/summary`, commercials only, windowed). */
export function PlatformStats() {
  const { label: rangeLabel, timeRange, window: range } = useAnalyticsDateRange();
  // "All time" has no preset window; the backend caps windows, so use the longest preset
  const summaryWindow = range ?? analyticsWindowFor("12m")!;
  const { summaryQuery, summary } = useAdSalesSummary(summaryWindow);

  const commercial = summary?.delivery?.commercial;
  const impressions = commercial?.impressions ?? 0;
  // one row per day of the window, zero-filled by the backend
  const daily = summary?.daily ?? [];
  // the "Needs review" thresholds are the backend's (`needsReviewRule`), not ours
  const reviewRule = summary?.needsReviewRule;
  // all five macro-regions, zero-filled; impressions without a region aren't in any of them,
  // so each share is of the attributed total
  const regions = summary?.byRegion?.filter((r) => isMacroRegion(r.region)) ?? [];
  const regionImpressions = regions?.reduce((sum, r) => sum + r.impressions, 0) ?? 0;

  const exportCsv = () =>
    downloadCsv(`ads-platform-${timeRange}.csv`, [
      ["Date", "Impressions"],
      ...daily.map((d) => [d.day, d.impressions]),
    ]);

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
          <Button variant="outline" className="gap-2" onClick={exportCsv} disabled={!daily.length}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        <StatTile label="Impressions" value={commercial ? formatCount(impressions) : EMPTY} />
        <StatTile label="Unique reach" value={formatCount(commercial?.uniqueViewers)} />
        <StatTile label="Clicks" value={formatCount(commercial?.clicks)} />
        <StatTile label="CTR" value={formatRatioPct(commercial?.ctr)} />
        <StatTile
          label="Completion rate"
          value={
            commercial
              ? formatRatioPct(impressions ? commercial.completes / impressions : 0)
              : EMPTY
          }
        />
        <StatTile label="Active ads" value={summary?.counts?.activeCommercials ?? EMPTY} />
      </div>

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart3 className="text-primary h-5 w-5" />
            Impressions over time
          </CardTitle>
          <p className="text-muted-foreground text-sm">Daily</p>
        </CardHeader>
        <CardContent>
          <AdImpressionsChart data={daily} variant="bar" />
        </CardContent>
      </GlassCard>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdTable
          title="Top ads"
          icon={Trophy}
          iconClass="text-warning"
          ads={summary?.topCommercials ?? []}
          reviewCtr={reviewRule?.maxCtr}
          isLoading={summaryQuery.isPending}
          empty="No impressions in this range yet."
        />
        <AdTable
          title="Needs review"
          icon={AlertTriangle}
          iconClass="text-destructive"
          description={
            reviewRule
              ? `CTR < ${formatRatioPct(reviewRule.maxCtr)} (${formatCount(reviewRule.minImpressions)}+ impressions)`
              : undefined
          }
          ads={summary?.needsReview ?? []}
          reviewCtr={reviewRule?.maxCtr}
          isLoading={summaryQuery.isPending}
          empty="All ads are performing normally."
        />
      </div>

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Globe className="text-info h-5 w-5" />
            By region
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {regions?.map((r) => {
            const share = regionImpressions ? (r.impressions / regionImpressions) * 100 : 0;
            return (
              <div key={r.region} className="flex items-center gap-3 text-sm">
                <span className="text-foreground w-28 shrink-0">{regionLabel(r.region)}</span>
                <div className="bg-background h-2 flex-1 overflow-hidden rounded-full">
                  <div className="bg-primary h-full rounded-full" style={{ width: `${share}%` }} />
                </div>
                <span className="text-foreground-secondary w-28 shrink-0 text-right text-xs tabular-nums">
                  {Math.round(share)}% · {formatRatioPct(r.ctr)} CTR
                </span>
              </div>
            );
          })}
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
  reviewCtr,
  isLoading,
  empty,
}: {
  title: string;
  description?: string;
  icon: LucideIcon;
  iconClass: string;
  ads: AdSalesCommercialRowDto[];
  /** CTR below this is flagged red (the needs-review threshold). */
  reviewCtr?: number;
  isLoading: boolean;
  empty: string;
}) {
  const router = useRouter();
  const returnTo = useCurrentHref();
  const columns: Column<AdSalesCommercialRowDto>[] = [
    {
      header: "Ad",
      cell: (ad) => (
        <>
          <p className="text-foreground font-medium">{ad?.name}</p>
          <p className="text-muted-foreground text-xs">{ad?.advertiserName}</p>
        </>
      ),
    },
    {
      header: "Impr.",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      cell: (ad) => formatCount(ad?.impressions),
    },
    {
      header: "CTR",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      cell: (ad) => (
        <span className={cn(reviewCtr !== undefined && ad?.ctr < reviewCtr && "text-destructive")}>
          {formatRatioPct(ad?.ctr)}
        </span>
      ),
    },
    {
      header: "Completion",
      headerClassName: "text-right",
      className: "text-right tabular-nums",
      cell: (ad) => formatRatioPct(ad?.completionRate),
    },
  ];

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
        <DataTable
          columns={columns}
          data={ads}
          rowIdKey="id"
          isLoading={isLoading}
          loadingRows={3}
          onRowClick={(ad) => router.push(AD_ROUTES.details(ad?.id, returnTo))}
          classNames={{ table: "text-sm", cell: "px-3 py-2", head: "px-3 text-xs" }}
          className="bg-transparent"
          emptyState={<span className="text-muted-foreground text-sm">{empty}</span>}
        />
      </CardContent>
    </GlassCard>
  );
}
