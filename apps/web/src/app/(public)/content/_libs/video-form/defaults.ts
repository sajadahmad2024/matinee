import { addDays, startOfToday } from "date-fns";

import {
  CreateContentDtoContentTypeEnum,
  CreateContentDtoRecommendationEnum,
  CreateContentDtoRightsRegionEnum,
  LicenseDtoRenewalStatusEnum,
} from "@/app/_libs/api/generated";
import { type ContentCreateFormValues, LicenseKind, SponsorshipFormat } from "@/app/_libs/schemas";

/**
 * A fresh, empty wizard form. A function, so the date defaults are "today" when the form opens,
 * not when the module loaded.
 */
export const createVideoFormDefaults = (): ContentCreateFormValues => ({
  title: "",
  description: "",
  studioId: "",
  genreIds: [],
  tagIds: [],
  cast: [],
  contentType: CreateContentDtoContentTypeEnum.Trailer,
  language: "en",
  rightsRegion: CreateContentDtoRightsRegionEnum.Global,
  recommendation: CreateContentDtoRecommendationEnum.Normal,
  parentContentId: "",
  // None picked: the backend then falls back to the rights region (Global = everywhere).
  publishRegions: [],
  exclusive: false,
  unlockPoints: 100,
  watchLinks: [],
  video: null,
  thumbnail: null,
  license: {
    kind: LicenseKind.Original,
    licensorName: "",
    renewalStatus: LicenseDtoRenewalStatusEnum.Renewing,
    startsAt: undefined,
    expiresAt: undefined,
    // Empty — the cost is optional.
    cost: Number.NaN,
    currency: "USD",
    revenueSource: "",
    terms: "",
  },
  sponsorship: {
    format: SponsorshipFormat.Organic,
    sponsorName: "",
    banner: null,
    // A 30-day deal starting today.
    startsAt: startOfToday(),
    endsAt: addDays(startOfToday(), 30),
  },
});
