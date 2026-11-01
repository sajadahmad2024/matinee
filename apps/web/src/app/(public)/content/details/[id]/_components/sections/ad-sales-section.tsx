import * as React from "react";

import Image from "next/image";

import {
  BarChart3,
  DollarSign,
  Eye,
  MousePointerClick,
  SkipForward,
  TrendingUp,
} from "lucide-react";

import type { AdMetricsDto, SponsorshipResponseDto } from "@/app/_libs/api/generated";
import { DetailRow } from "@/components/custom/detail-row";
import { MetricTile } from "@/components/custom/metric-tile";

import { formatCount } from "../../../../_components/listing/listing-config";
import { EMPTY, formatCents, formatDateRange } from "../../../../_shared/content-format";
import { DetailsCard } from "../details-card";
import { DETAILS_COPY } from "../details-config";

/** 0.0425 → "4.3%". */
const formatRatio = (ratio?: number | null) =>
  ratio == null ? EMPTY : `${(ratio * 100).toFixed(1)}%`;

export interface AdSalesSectionProps {
  /** The active sponsorship; none means the title runs organic. */
  sponsorship?: SponsorshipResponseDto | null;
  adPerformance?: AdMetricsDto | null;
}

/** Wizard step 5: organic or the sponsor deal, plus how its ads have performed. */
export const AdSalesSection: React.FC<AdSalesSectionProps> = ({ sponsorship, adPerformance }) => (
  <div className="space-y-6">
    <DetailsCard title="Ad Sales" icon={DollarSign}>
      {!sponsorship ? (
        <DetailRow label="Format">{DETAILS_COPY.organic}</DetailRow>
      ) : (
        <>
          <DetailRow label="Format">Sponsored — sponsor logo overlay</DetailRow>
          <DetailRow label="Sponsor / Brand">{sponsorship.sponsorName || EMPTY}</DetailRow>
          <DetailRow label="Banner / logo">
            {sponsorship.bannerUrl ? (
              <div className="border-border bg-background-tertiary relative size-20 overflow-hidden rounded-lg border">
                <Image
                  src={sponsorship?.bannerUrl}
                  alt={`${sponsorship?.sponsorName} logo`}
                  fill
                  unoptimized
                  sizes="80px"
                  className="object-contain"
                />
              </div>
            ) : (
              EMPTY
            )}
          </DetailRow>
          <DetailRow label="Placement">
            {sponsorship.placement === "overlay" ? "Logo overlay" : sponsorship.placement || EMPTY}
          </DetailRow>
          <DetailRow label="Run dates">
            {formatDateRange(sponsorship.startsAt, sponsorship.endsAt)}
          </DetailRow>
          <DetailRow label="Overlay duration">
            {sponsorship.adDurationSeconds ? `${sponsorship.adDurationSeconds}s` : EMPTY}
          </DetailRow>
          <DetailRow label="Deal value">
            {formatCents(sponsorship.revenueCents, sponsorship.currency)}
          </DetailRow>
        </>
      )}
    </DetailsCard>

    {sponsorship && (
      <DetailsCard title="Ad Performance" icon={BarChart3}>
        {adPerformance?.impressions ? (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
            <MetricTile
              label="Impressions"
              value={formatCount(adPerformance.impressions)}
              icon={Eye}
            />
            <MetricTile
              label="CTR"
              value={formatRatio(adPerformance.ctr)}
              sub={`${formatCount(adPerformance.clicks)} clicks`}
              icon={MousePointerClick}
            />
            <MetricTile
              label="Skip rate"
              value={formatRatio(adPerformance.skipRate)}
              icon={SkipForward}
            />
            <MetricTile
              label="Revenue"
              value={formatCents(adPerformance.revenueCents, sponsorship.currency)}
              icon={DollarSign}
              accent="text-success"
            />
            <MetricTile
              label="eCPM"
              value={formatCents(adPerformance.ecpmCents, sponsorship.currency)}
              icon={TrendingUp}
            />
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">{DETAILS_COPY.noAdPerformance}</p>
        )}
      </DetailsCard>
    )}
  </div>
);

AdSalesSection.displayName = "AdSalesSection";
