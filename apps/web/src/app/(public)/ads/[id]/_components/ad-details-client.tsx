"use client";

import Link from "next/link";

import { BarChart3, ExternalLink, Video } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { useAdCampaign } from "@/app/_libs/hooks/api/use-admin-ads";
import { regionLabel } from "@/app/_libs/regions";
import { EMPTY, formatDateTime24 } from "@/app/_libs/utils/format";
import { CustomButton } from "@/components/custom/custom-button";
import { DetailRow } from "@/components/custom/detail-row";
import { GlassCard } from "@/components/custom/glass-card";
import { MediaVideoPlayer } from "@/components/custom/media-video-player";
import { PageHeader } from "@/components/custom/page-header";
import { StatusBadge } from "@/components/custom/status-badge";
import { useCurrentHref, useReturnTo } from "@/hooks/use-return-to";

import { AdQueryState } from "../../_components/ad-query-state";
import { AdDetailsSkeleton } from "../../_components/ad-skeletons";
import {
  AD_ACTION_LABELS,
  AD_ALLOWED_ACTIONS,
  AdStatusConfirmDialog,
  canEditAd,
  hasAdAnalytics,
  useAdStatusActions,
} from "../../_components/ad-status-actions";
import {
  AD_ROUTES,
  AD_STATUS_LABELS,
  adBackLabel,
  campaignRegions,
  rankIn,
  regionsLabel,
} from "../../_libs/ad-config";
import { AdCampaignStatusEnum } from "../../_libs/ad-types";

/** Ad details — creative, delivery and schedule. Analytics live at /ads/[id]/analytics. */
/** The ad's skip rule: "skip after 10s", "skip anytime" (0) or "not skippable" (null). */
const skipLabel = (seconds?: number | null) =>
  seconds == null ? "not skippable" : seconds === 0 ? "skip anytime" : `skip after ${seconds}s`;

export function AdDetailsClient({ id }: { id: string }) {
  const { campaignQuery, campaign: ad } = useAdCampaign(id);
  const listHref = useReturnTo(AD_ROUTES.LIST);
  // edit returns here (and this page keeps its own way back to the list)
  const currentHref = useCurrentHref();
  const { request, dialog, isPending } = useAdStatusActions();

  if (!ad) return <AdQueryState query={campaignQuery} skeleton={<AdDetailsSkeleton />} />;

  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title={ad?.name}
        subtitle={ad?.advertiserName}
        backHref={listHref ?? AD_ROUTES.LIST}
        backLabel={adBackLabel(listHref)}
        titleAddon={
          <StatusBadge
            status={ad?.status}
            label={AD_STATUS_LABELS[ad?.status]}
            className="text-[10px]"
          />
        }
        actions={
          <>
            {hasAdAnalytics(ad?.status) && (
              <Button asChild variant="outline" size="sm" className="gap-2">
                <Link href={AD_ROUTES.analytics(ad?.id, listHref)}>
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </Link>
              </Button>
            )}
            {canEditAd(ad?.status) && (
              <Button asChild variant="outline" size="sm">
                <Link href={AD_ROUTES.edit(ad?.id, currentHref)}>Edit</Link>
              </Button>
            )}
            {AD_ALLOWED_ACTIONS[ad?.status]?.map((action) => (
              <CustomButton
                key={action}
                variant="outline"
                size="sm"
                disabled={isPending}
                className={action === "end" ? "text-destructive" : undefined}
                onClick={() => request(ad, action)}>
                {AD_ACTION_LABELS[action]}
              </CustomButton>
            ))}
          </>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6">
        <GlassCard>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">Video</CardTitle>
            <span className="text-muted-foreground text-xs">
              {[
                ad?.durationSeconds ? `${ad.durationSeconds}s` : null,
                skipLabel(ad?.skippableAfterSeconds),
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          </CardHeader>
          <CardContent>
            {ad?.creativeMediaId ? (
              <MediaVideoPlayer mediaId={ad.creativeMediaId} />
            ) : (
              <div className="border-border bg-background-tertiary text-muted-foreground flex aspect-video w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-lg border p-6 text-center text-xs">
                <Video className="h-6 w-6" />
                No video
              </div>
            )}
          </CardContent>
        </GlassCard>

        <GlassCard>
          <CardHeader>
            <CardTitle className="text-base">Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl>
              <DetailRow label="Advertiser">{ad?.advertiserName ?? EMPTY}</DetailRow>
              <DetailRow label="Caption">{ad?.caption || EMPTY}</DetailRow>
              <DetailRow label="Button">{ad?.ctaLabel ?? EMPTY}</DetailRow>
              <DetailRow label="Link">
                {ad?.clickUrl ? (
                  <a
                    href={ad?.clickUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary inline-flex items-center gap-1 hover:underline">
                    {ad?.clickUrl}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  EMPTY
                )}
              </DetailRow>
            </dl>
            <div>
              <p className="text-muted-foreground mb-1 text-xs font-medium tracking-wide uppercase">
                Delivery & schedule
              </p>
              <dl>
                <DetailRow label="Regions">{regionsLabel(ad?.regions)}</DetailRow>
                <DetailRow label="Feed rank">
                  {ad?.status === AdCampaignStatusEnum.Ended ? (
                    <span className="text-muted-foreground">Freed when the ad ended</span>
                  ) : (
                    <ul className="space-y-0.5">
                      {campaignRegions(ad?.regions)?.map((code) => (
                        <li key={code}>
                          <span className="font-medium tabular-nums">
                            #{rankIn(ad, code) ?? EMPTY}
                          </span>{" "}
                          <span className="text-muted-foreground">in {regionLabel(code)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </DetailRow>
                <DetailRow label="Starts">{formatDateTime24(ad?.startsAt)}</DetailRow>
                <DetailRow label="Ends">{formatDateTime24(ad?.endsAt)}</DetailRow>
              </dl>
            </div>
          </CardContent>
        </GlassCard>
      </div>

      <AdStatusConfirmDialog {...dialog} />
    </div>
  );
}
