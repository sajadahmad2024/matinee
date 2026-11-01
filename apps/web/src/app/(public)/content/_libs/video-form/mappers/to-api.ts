import { addDays, format, startOfDay } from "date-fns";

import {
  CreateContentDtoAccessTierEnum,
  SponsorshipDtoAdFormatEnum,
  SponsorshipDtoPlacementEnum,
} from "@/app/_libs/api/generated";
import type {
  CreateContentDto,
  LicenseDto,
  SetRegionsDto,
  SponsorshipDto,
  UpdateContentDto,
} from "@/app/_libs/hooks/api/use-admin-content";
import type {
  ContentCreateFormValues,
  ContentLicenseValues,
  ContentPublishRegion,
  ContentSponsorshipValues,
} from "@/app/_libs/schemas";

import { canHaveParent } from "../distribution/distribution-options";

/** Wizard values → request DTOs, shared by the add and edit saves. */

const optional = (value: string) => value.trim() || undefined;

/** `[]` → `undefined`, so create leaves the field out. */
const nonEmpty = <T>(list: T[]) => (list.length ? list : undefined);

const toCast = (cast: ContentCreateFormValues["cast"]) =>
  cast.map((member, index) => ({
    personId: member.personId,
    role: member.role,
    billingOrder: index,
  }));

const toWatchLinks = (links: ContentCreateFormValues["watchLinks"]) =>
  links.map((link) => ({
    platform: link.platform,
    label: optional(link.label),
    url: optional(link.url),
  }));

const toAccess = ({ exclusive, unlockPoints }: ContentCreateFormValues) => ({
  accessTier: exclusive
    ? CreateContentDtoAccessTierEnum.Exclusive
    : CreateContentDtoAccessTierEnum.Free,
  unlockPoints: exclusive ? unlockPoints : undefined,
});

/** Only a BTS / clip carries a parent; "" = standalone. */
const toParent = ({ contentType, parentContentId }: ContentCreateFormValues) =>
  (canHaveParent(contentType) && parentContentId) || undefined;

/** Wizard values → `CreateContentDto`. Empty values are left out (the backend's defaults apply). */
export function toCreateContentDto(values: ContentCreateFormValues): CreateContentDto {
  const { genreIds, tagIds } = values;

  return {
    title: values.title.trim(),
    description: optional(values.description),
    studioId: values.studioId || undefined,
    genreIds: nonEmpty(genreIds),
    primaryGenreId: genreIds[0],
    tagIds: nonEmpty(tagIds),
    cast: nonEmpty(toCast(values.cast)),
    contentType: values.contentType,
    language: optional(values.language),
    rightsRegion: values.rightsRegion,
    recommendation: values.recommendation,
    parentContentId: toParent(values),
    ...toAccess(values),
    watchLinks: nonEmpty(toWatchLinks(values.watchLinks)),
    videoMediaId: values.video?.mediaId,
    thumbnailMediaId: values.thumbnail?.mediaId,
  };
}

/** Form fields stored on the content record itself; the rest have their own APIs. */
export type RecordField = Exclude<
  keyof ContentCreateFormValues,
  "license" | "publishRegions" | "sponsorship"
>;

/**
 * Each record field → the `UpdateContentDto` fields it owns. Unlike create, emptied values are
 * sent so they clear: `studioId: null`, `""`, and `[]` (list fields replace when present).
 * Media and the parent can't be cleared yet — the backend's `videoMediaId`, `thumbnailMediaId`
 * and `parentContentId` aren't nullable.
 */
const UPDATE_FIELDS: {
  [K in RecordField]: (values: ContentCreateFormValues) => UpdateContentDto;
} = {
  title: (v) => ({ title: v.title.trim() }),
  description: (v) => ({ description: v.description.trim() }),
  studioId: (v) => ({ studioId: v.studioId || null }),
  genreIds: (v) => ({ genreIds: v.genreIds, primaryGenreId: v.genreIds[0] }),
  tagIds: (v) => ({ tagIds: v.tagIds }),
  cast: (v) => ({ cast: toCast(v.cast) }),
  watchLinks: (v) => ({ watchLinks: toWatchLinks(v.watchLinks) }),
  contentType: (v) => ({ contentType: v.contentType }),
  language: (v) => ({ language: optional(v.language) }),
  rightsRegion: (v) => ({ rightsRegion: v.rightsRegion }),
  recommendation: (v) => ({ recommendation: v.recommendation }),
  parentContentId: (v) => ({ parentContentId: toParent(v) }),
  exclusive: toAccess,
  unlockPoints: toAccess,
  video: (v) => ({ videoMediaId: v.video?.mediaId }),
  thumbnail: (v) => ({ thumbnailMediaId: v.thumbnail?.mediaId }),
};

export const RECORD_FIELDS = Object.keys(UPDATE_FIELDS) as RecordField[];

/** Only the changed fields → `UpdateContentDto`, so the change history names what changed. */
export const toUpdateContentDto = (
  values: ContentCreateFormValues,
  changed: RecordField[],
): UpdateContentDto => Object.assign({}, ...changed.map((field) => UPDATE_FIELDS[field](values)));

/** Licence dates are calendar days — sent as `yyyy-MM-dd` so no timezone shifts the day. */
const toDay = (date?: Date) => (date ? format(date, "yyyy-MM-dd") : undefined);

/** Rights step (Licensed) → `LicenseDto`. Cost is entered in units and sent in cents; empty → omitted. */
export const toLicenseDto = (license: ContentLicenseValues): LicenseDto => ({
  licensorName: license.licensorName.trim(),
  renewalStatus: license.renewalStatus,
  startsAt: toDay(license.startsAt),
  expiresAt: toDay(license.expiresAt),
  licenseCostCents: Number.isNaN(license.cost) ? undefined : Math.round(license.cost * 100),
  currency: license.currency,
  revenueSource: optional(license.revenueSource),
  terms: optional(license.terms),
});

/** Distribution regions → `SetRegionsDto`: every selected region, and the ones switched Off. */
export const toRegionsDto = (regions: ContentPublishRegion[]): SetRegionsDto => ({
  regions: regions.map((region) => region.code),
  offRegions: regions.filter((region) => !region.live).map((region) => region.code),
});

/**
 * Ad Sales (Sponsored) → `SponsorshipDto`: a sponsor logo overlay. The dates are whole days, so
 * the window runs from the start day's midnight to the midnight after the end day.
 */
export const toSponsorshipDto = (sponsorship: ContentSponsorshipValues): SponsorshipDto => ({
  adFormat: SponsorshipDtoAdFormatEnum.Sponsored,
  placement: SponsorshipDtoPlacementEnum.Overlay,
  sponsorName: sponsorship.sponsorName.trim(),
  bannerMediaId: sponsorship.banner?.mediaId,
  startsAt: sponsorship.startsAt && startOfDay(sponsorship.startsAt).toISOString(),
  endsAt: sponsorship.endsAt && addDays(startOfDay(sponsorship.endsAt), 1).toISOString(),
});
