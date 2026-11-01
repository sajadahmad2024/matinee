import { AD_LIMITS, type AdFormValues } from "@/app/_libs/schemas/ads";
import { parseApiDate } from "@/app/_libs/utils/format";

import { CTA_LABELS, campaignRegions, isMacroRegion } from "./ad-config";
import {
  type AdCampaignDto,
  AdCampaignTypeEnum,
  type CreateAdCampaignDto,
  type RegionRanksDto,
  type UpdateAdCampaignDto,
} from "./ad-types";

/** The picker works to the minute; the API keeps seconds. Same minute = unchanged. */
const minuteOf = (date?: Date | null) => (date ? Math.floor(date.getTime() / 60_000) : null);

/**
 * "Publish now" start: a minute back, so a browser clock running ahead of the server can't land
 * the start in the future (the backend would schedule the ad instead of starting it).
 */
const publishNowStart = () => new Date(Date.now() - 60_000);

/** The start the ad is saved with: now, or the picked date. */
export const effectiveStart = (values: Pick<AdFormValues, "startMode" | "startsAt">) =>
  values.startMode === "now" ? publishNowStart() : values.startsAt;

/** A scheduled ad defaults to starting tomorrow and running 30 days. */
const defaultFlight = () => {
  const start = new Date();
  start.setDate(start.getDate() + 1);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 30);
  end.setHours(23, 59, 0, 0);
  return { startsAt: start, endsAt: end };
};

/** Form defaults: empty for a new ad, the campaign's values when editing. */
export function toAdFormValues(campaign?: AdCampaignDto): AdFormValues {
  if (!campaign) {
    return {
      name: "",
      advertiserName: "",
      caption: "",
      creativeMediaId: null,
      durationSeconds: null,
      skippableAfterSeconds: AD_LIMITS.defaultSkipSeconds,
      ctaLabel: CTA_LABELS[0],
      clickUrl: "",
      regions: [],
      ranks: {},
      startMode: "now",
      ...defaultFlight(),
    };
  }

  const regions = campaign?.regions?.filter(isMacroRegion) ?? [];
  return {
    name: campaign?.name ?? "",
    advertiserName: campaign?.advertiserName ?? "",
    caption: campaign?.caption ?? "",
    creativeMediaId: campaign?.creativeMediaId ?? null,
    durationSeconds: campaign?.durationSeconds ?? null,
    skippableAfterSeconds: campaign?.skippableAfterSeconds ?? null,
    ctaLabel: campaign?.ctaLabel ?? CTA_LABELS[0],
    clickUrl: campaign?.clickUrl ?? "",
    regions: regions?.length ? regions : "all",
    ranks: Object.fromEntries(
      campaignRegions(campaign?.regions)
        ?.filter((r) => campaign?.ranks?.[r] !== undefined)
        ?.map((r) => [r, String(campaign?.ranks?.[r])]) ?? [],
    ),
    startMode: "schedule",
    startsAt: parseApiDate(campaign?.startsAt) ?? null,
    endsAt: parseApiDate(campaign?.endsAt) ?? null,
  };
}

/** Ranks for the targeted regions only — the backend drops bookings for regions the ad left. */
const toRanks = (values: AdFormValues): RegionRanksDto => {
  const targeted = campaignRegions(values.regions === "all" ? [] : values.regions);
  return Object.fromEntries(targeted?.map((r) => [r, Number(values?.ranks?.[r])]) ?? []);
};

const toCampaignFields = (values: AdFormValues): UpdateAdCampaignDto => ({
  name: values.name.trim(),
  caption: values.caption.trim() || null,
  creativeMediaId: values.creativeMediaId,
  durationSeconds: values.durationSeconds,
  skippableAfterSeconds: values.skippableAfterSeconds,
  ctaLabel: values.ctaLabel,
  clickUrl: values.clickUrl.trim(),
  regions: values.regions === "all" ? [] : values.regions,
  ranks: toRanks(values),
  startsAt: effectiveStart(values)?.toISOString() ?? null,
  endsAt: values.endsAt?.toISOString() ?? null,
});

export function toCreateAdCampaignDto(values: AdFormValues): CreateAdCampaignDto {
  return {
    ...toCampaignFields(values),
    name: values.name.trim(),
    advertiserName: values.advertiserName.trim(),
    type: AdCampaignTypeEnum.Commercial,
  };
}

/**
 * Update body. A scheduled start is only sent when it changed: a live ad's start can't move, and the
 * minute-precision input would otherwise read as a change. "Publish now" always sends it.
 */
export function toUpdateAdCampaignDto(
  values: AdFormValues,
  current: AdCampaignDto,
): UpdateAdCampaignDto {
  const fields = toCampaignFields(values);
  if (
    values.startMode === "schedule" &&
    minuteOf(values.startsAt) === minuteOf(parseApiDate(current?.startsAt))
  ) {
    delete fields.startsAt;
  }
  return fields;
}
