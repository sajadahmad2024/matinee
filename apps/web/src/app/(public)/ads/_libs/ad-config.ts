// Ads Management config: routes, labels, list tabs, limits and region helpers. Values mirror the backend
// (`apps/backend/src/ads/dto/ad-sales.dto.ts`); no mock data lives here.
import type { Route } from "next";

import { ADMIN_ROUTES } from "@/app/_libs/constants/routes";
import { MACRO_REGIONS, type MacroRegion, regionLabel } from "@/app/_libs/regions";
import { AD_LIMITS } from "@/app/_libs/schemas/ads";
import type { CustomTabItem } from "@/components/custom/custom-tabs";
import { withReturnTo } from "@/hooks/use-return-to";

import { type AdCampaignDto, type AdCampaignStatus, AdCampaignStatusEnum } from "./ad-types";

export const AD_ROUTES = {
  LIST: ADMIN_ROUTES.ADS as Route,
  NEW: `${ADMIN_ROUTES.ADS}/new` as Route,
  PLATFORM: `${ADMIN_ROUTES.ADS}/platform` as Route,
  // `from`: the list URL (page, search, filters) the ad's pages go back to
  details: (id: string, from?: string | null) =>
    withReturnTo(`${ADMIN_ROUTES.ADS}/${id}` as Route, from),
  edit: (id: string, from?: string | null) =>
    withReturnTo(`${ADMIN_ROUTES.ADS}/${id}/edit` as Route, from),
  analytics: (id: string, from?: string | null) =>
    withReturnTo(`${ADMIN_ROUTES.ADS}/${id}/analytics` as Route, from),
} as const;

/** Back-link label for an ad page opened from `from` (the list, or global analytics). */
export const adBackLabel = (from: string | null) =>
  from?.startsWith(AD_ROUTES.PLATFORM) ? "Back to Global analytics" : "Back to Ads";

/** Feed ad slots per region: one ad after every 5 videos in a 25-video feed → ranks 1–5. */
export const AD_RANK_MAX = AD_LIMITS.rankMax;

export const AD_CAPTION_MAX = AD_LIMITS.captionMax;

export const CTA_LABELS = ["Learn more", "Shop now", "Install", "Watch now"] as const;

/** The backend calls a running ad `active`; admins know it as "Live". */
export const AD_STATUS_LABELS: Record<AdCampaignStatus, string> = {
  [AdCampaignStatusEnum.Draft]: "Draft",
  [AdCampaignStatusEnum.Scheduled]: "Scheduled",
  [AdCampaignStatusEnum.Active]: "Live",
  [AdCampaignStatusEnum.Paused]: "Paused",
  [AdCampaignStatusEnum.Ended]: "Ended",
};

// ─── List ────────────────────────────────────────────────────────────────────

export const AD_TAB_ALL = "all";
export type AdListTab = typeof AD_TAB_ALL | AdCampaignStatus;

/** Drafts are rare (legacy commercials), so they only show under "All". */
export const AD_LIST_TABS: CustomTabItem<AdListTab>[] = [
  { value: AD_TAB_ALL, label: "All" },
  { value: AdCampaignStatusEnum.Active, label: AD_STATUS_LABELS.active },
  { value: AdCampaignStatusEnum.Scheduled, label: AD_STATUS_LABELS.scheduled },
  { value: AdCampaignStatusEnum.Paused, label: AD_STATUS_LABELS.paused },
  { value: AdCampaignStatusEnum.Ended, label: AD_STATUS_LABELS.ended },
];

export const AD_LIST_PAGE_SIZE = 10;

/** Every region: no `region` sent, so no feed order and no swap. One region gives both. */
export const AD_REGION_ALL = "all";
export type AdListRegion = typeof AD_REGION_ALL | MacroRegion;

/** `useListUrlState` filters for the ad list: status tab + region (all, or one in feed order). */
export const AD_LIST_FILTERS = {
  status: { values: AD_LIST_TABS.map((t) => t.value), defaultValue: AD_TAB_ALL },
  region: {
    values: [AD_REGION_ALL, ...MACRO_REGIONS.map((r) => r.code)] as AdListRegion[],
    defaultValue: AD_REGION_ALL,
  },
} as const;

/** "Europe (EU)" — the code matches the chips in the list's Regions column. */
export const AD_REGION_OPTIONS: { value: AdListRegion; label: string }[] = [
  { value: AD_REGION_ALL, label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ value: r.code, label: `${r.label} (${r.code})` })),
];

// ─── Regions ─────────────────────────────────────────────────────────────────

export const isMacroRegion = (code: string): code is MacroRegion =>
  MACRO_REGIONS.some((r) => r.code === code);

/** The regions an ad runs in — all five when `regions` is empty (the backend's "everywhere"). */
export const campaignRegions = (regions?: readonly string[] | null): MacroRegion[] => {
  const known = regions?.filter(isMacroRegion) ?? [];
  return known.length ? known : MACRO_REGIONS.map((r) => r.code);
};

/** "All regions" or "North America, Europe". */
export const regionsLabel = (regions?: readonly string[] | null) =>
  regions?.length ? regions?.filter(isMacroRegion)?.map(regionLabel)?.join(", ") : "All regions";

/** The ad's feed rank in a region, if it holds one (ended ads have freed theirs). */
export const rankIn = (campaign: Pick<AdCampaignDto, "ranks" | "status">, region: MacroRegion) =>
  campaign?.status === AdCampaignStatusEnum.Ended ? undefined : campaign?.ranks?.[region];
