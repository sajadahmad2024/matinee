import type { ReactNode } from "react";

import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { type MacroRegion, regionLabel } from "@/app/_libs/regions";
import { EMPTY, formatCount, formatDateRange, formatRatioPct } from "@/app/_libs/utils/format";
import type { Column } from "@/components/custom/data-table";
import { StatusBadge } from "@/components/custom/status-badge";

import { AD_ROUTES, AD_STATUS_LABELS, isMacroRegion, rankIn } from "../_libs/ad-config";
import type { AdCampaignDto } from "../_libs/ad-types";

interface AdColumnsOptions {
  /** `null` = every region: the ad's regions instead of its rank, no swap picks. */
  region: MacroRegion | null;
  pickedIds: string[];
  onTogglePick: (campaign: AdCampaignDto) => void;
  renderActions: (campaign: AdCampaignDto) => ReactNode;
  /** The list URL the ad's details page goes back to. */
  returnTo?: string;
}

/** Ads that hold a rank in the region can trade it (ended ads have freed theirs). */
export const canSwapIn = (campaign: AdCampaignDto, region: MacroRegion) =>
  rankIn(campaign, region) !== undefined;

/**
 * Columns of the ad list. With a region, rank is the ad's feed position there and ranked ads can be
 * picked for a swap; across all regions the list shows where each ad runs and there is no swap.
 */
export function getAdColumns({
  region,
  pickedIds,
  onTogglePick,
  renderActions,
  returnTo,
}: AdColumnsOptions): Column<AdCampaignDto>[] {
  const rankColumns: Column<AdCampaignDto>[] = region
    ? [
        {
          header: "",
          headerClassName: "w-10",
          cell: (ad) =>
            canSwapIn(ad, region) ? (
              <div onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={pickedIds?.includes(ad?.id)}
                  onCheckedChange={() => onTogglePick(ad)}
                  aria-label={`Select “${ad?.name}” to swap rank`}
                  title="Select to swap rank"
                />
              </div>
            ) : null,
        },
        {
          header: "Rank",
          headerClassName: "w-16",
          className: "font-medium tabular-nums",
          cell: (ad) => {
            const rank = rankIn(ad, region);
            return rank ? `#${rank}` : <span className="text-muted-foreground">{EMPTY}</span>;
          },
        },
      ]
    : [
        {
          header: "Regions",
          headerClassName: "w-44",
          // one code chip per region (full name on hover); several wrap instead of widening the column
          cell: (ad) => {
            const codes = ad?.regions?.filter(isMacroRegion) ?? [];
            return (
              <div className="flex max-w-44 flex-wrap gap-1">
                {codes.length ? (
                  codes?.map((code) => (
                    <Badge
                      key={code}
                      variant="secondary"
                      title={regionLabel(code)}
                      className="text-[10px] font-normal">
                      {code}
                    </Badge>
                  ))
                ) : (
                  <Badge variant="secondary" className="text-[10px] font-normal">
                    All regions
                  </Badge>
                )}
              </div>
            );
          },
        },
      ];

  return [
    ...rankColumns,
    {
      header: "Ad",
      cell: (ad) => (
        <>
          <Link
            href={AD_ROUTES.details(ad?.id, returnTo)}
            className="text-foreground font-medium hover:underline"
            onClick={(e) => e.stopPropagation()}>
            {ad?.name}
          </Link>
          <p className="text-muted-foreground text-xs">{ad?.advertiserName}</p>
        </>
      ),
    },
    {
      header: "Dates",
      className: "text-muted-foreground whitespace-nowrap",
      cell: (ad) => formatDateRange(ad?.startsAt, ad?.endsAt, { short: true, withTime: true }),
    },
    {
      header: "Status",
      cell: (ad) => (
        <StatusBadge
          status={ad?.status}
          label={AD_STATUS_LABELS[ad?.status]}
          className="text-[10px]"
        />
      ),
    },
    {
      header: "Impressions",
      className: "tabular-nums",
      cell: (ad) => (ad?.delivery?.impressions ? formatCount(ad?.delivery?.impressions) : EMPTY),
    },
    {
      header: "Completion",
      className: "tabular-nums",
      cell: (ad) =>
        ad?.delivery?.impressions ? formatRatioPct(ad?.delivery?.completionRate) : EMPTY,
    },
    {
      header: "",
      headerClassName: "w-28",
      cell: renderActions,
    },
  ];
}
