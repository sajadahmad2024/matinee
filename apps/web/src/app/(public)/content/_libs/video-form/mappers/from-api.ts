import { parseISO, startOfDay, subMilliseconds } from "date-fns";

import {
  CastMemberInputDtoRoleEnum,
  CreateContentDtoAccessTierEnum,
  CreateContentDtoContentTypeEnum,
  CreateContentDtoRecommendationEnum,
  CreateContentDtoRightsRegionEnum,
  LicenseDtoRenewalStatusEnum,
  SetRegionsDtoRegionsEnum,
  SponsorshipDtoAdFormatEnum,
  WatchLinkInputDtoPlatformEnum,
} from "@/app/_libs/api/generated";
import type { ContentFullDto } from "@/app/_libs/hooks/api/use-admin-content";
import {
  type ContentCreateFormValues,
  type ContentLicenseValues,
  type ContentPublishRegion,
  type ContentSponsorshipValues,
  LicenseKind,
  SponsorshipFormat,
} from "@/app/_libs/schemas";

import { createVideoFormDefaults } from "../defaults";

/**
 * API → form: the loaded `ContentFullDto` as wizard form values (edit; the details page later).
 * The reverse of `to-api.ts`.
 */

/** The API types enum fields as plain strings — keep a known value, else the form's default. */
const oneOf = <T extends Record<string, string>>(
  options: T,
  value: string | null | undefined,
  fallback: T[keyof T],
): T[keyof T] =>
  (Object.values(options) as string[]).includes(value ?? "") ? (value as T[keyof T]) : fallback;

/** A licence date is a calendar day — read its `yyyy-MM-dd` part, so no timezone shifts it. */
const toDay = (value?: string | null) => (value ? parseISO(value.slice(0, 10)) : undefined);

const toLicense = (
  license: ContentFullDto["license"],
  defaults: ContentCreateFormValues,
): ContentLicenseValues => {
  if (!license) return defaults.license;
  return {
    kind: LicenseKind.Licensed,
    licensorName: license.licensorName ?? "",
    renewalStatus: oneOf(
      LicenseDtoRenewalStatusEnum,
      license.renewalStatus,
      defaults.license.renewalStatus,
    ),
    startsAt: toDay(license.startsAt),
    expiresAt: toDay(license.expiresAt),
    cost: license.licenseCostCents / 100,
    currency: license.currency || defaults.license.currency,
    revenueSource: license.revenueSource ?? "",
    terms: license.terms ?? "",
  };
};

/**
 * Only a sponsored deal maps to the form; a feed commercial (managed in Ads) stays Organic here.
 * `endsAt` is the instant the overlay stops (the add flow sends the midnight after the last
 * day), so the last day is the day just before it.
 */
const toSponsorship = (
  sponsorship: ContentFullDto["sponsorship"],
  defaults: ContentCreateFormValues,
): ContentSponsorshipValues => {
  if (sponsorship?.adFormat !== SponsorshipDtoAdFormatEnum.Sponsored) {
    return defaults.sponsorship;
  }
  return {
    format: SponsorshipFormat.Sponsored,
    sponsorName: sponsorship.sponsorName ?? "",
    banner: sponsorship.bannerMediaId
      ? { mediaId: sponsorship.bannerMediaId, previewUrl: sponsorship.bannerUrl ?? "" }
      : null,
    startsAt: sponsorship.startsAt ? startOfDay(parseISO(sponsorship.startsAt)) : undefined,
    endsAt: sponsorship.endsAt
      ? startOfDay(subMilliseconds(parseISO(sponsorship.endsAt), 1))
      : undefined,
  };
};

const PUBLISH_REGIONS = Object.values(SetRegionsDtoRegionsEnum) as string[];

const toPublishRegions = (regions: ContentFullDto["regions"]): ContentPublishRegion[] =>
  (regions?.items ?? [])
    .filter((item) => PUBLISH_REGIONS.includes(item?.region))
    .map((item) => ({ code: item.region as SetRegionsDtoRegionsEnum, live: item.live }));

/**
 * Loaded video → form values. Saved media carry only their ids here (`fileName` / `previewUrl`
 * empty); the step cards read the rest from `GET /media/:id`.
 */
export function toEditFormValues({
  content,
  license,
  sponsorship,
  regions,
}: ContentFullDto): ContentCreateFormValues {
  const defaults = createVideoFormDefaults();
  const genres = [...(content?.genres ?? [])].sort(
    (a, b) => Number(b?.isPrimary) - Number(a?.isPrimary),
  );
  const cast = [...(content?.cast ?? [])].sort((a, b) => a?.billingOrder - b?.billingOrder);

  return {
    title: content?.title ?? "",
    description: content?.description ?? "",
    studioId: content?.studioId ?? "",
    genreIds: genres.map((genre) => genre.id),
    tagIds: (content?.tags ?? []).map((tag) => tag.id),
    cast: cast.map((member) => ({
      personId: member.personId,
      role: oneOf(CastMemberInputDtoRoleEnum, member.role, CastMemberInputDtoRoleEnum.Actor),
    })),
    contentType: oneOf(CreateContentDtoContentTypeEnum, content?.contentType, defaults.contentType),
    language: content?.language ?? "",
    rightsRegion: oneOf(
      CreateContentDtoRightsRegionEnum,
      content?.rightsRegion,
      defaults.rightsRegion,
    ),
    recommendation: oneOf(
      CreateContentDtoRecommendationEnum,
      content?.recommendation,
      defaults.recommendation,
    ),
    parentContentId: content?.parentContentId ?? "",
    publishRegions: toPublishRegions(regions),
    exclusive: content?.accessTier === CreateContentDtoAccessTierEnum.Exclusive,
    unlockPoints: content?.unlockPoints ?? defaults.unlockPoints,
    watchLinks: (content?.watchLinks ?? []).map((link) => ({
      platform: oneOf(
        WatchLinkInputDtoPlatformEnum,
        link.platform,
        WatchLinkInputDtoPlatformEnum.Other,
      ),
      label: link.label ?? "",
      url: link.url ?? "",
    })),
    video: content?.videoMediaId
      ? { mediaId: content.videoMediaId, fileName: "", sizeBytes: 0 }
      : null,
    thumbnail: content?.thumbnailMediaId
      ? { mediaId: content.thumbnailMediaId, previewUrl: content.thumbnailUrl ?? "" }
      : null,
    license: toLicense(license, defaults),
    sponsorship: toSponsorship(sponsorship, defaults),
  };
}
