import { z } from "zod";

import {
  CastMemberInputDtoRoleEnum,
  CreateContentDtoContentTypeEnum,
  CreateContentDtoRecommendationEnum,
  CreateContentDtoRightsRegionEnum,
  LicenseDtoRenewalStatusEnum,
  SetRegionsDtoRegionsEnum,
  WatchLinkInputDtoPlatformEnum,
} from "@/app/_libs/api/generated";

/** Backend caps on `CreateContentDto` (content-write.dto.ts). */
export const CONTENT_LIMITS = {
  titleMin: 2,
  titleMax: 300,
  /** Stricter than the backend (5000) — product cap. */
  descriptionMax: 500,
  genresMax: 10,
  tagsMax: 30,
  castMax: 100,
  languageMax: 10,
  watchLinksMax: 3,
  watchLabelMax: 60,
  watchUrlMax: 500,
  licensorMax: 200,
  revenueSourceMax: 100,
  licenseTermsMax: 500,
  sponsorNameMax: 200,
} as const;

/** Rights step: an owned original has no licence row; a licensed title has one. */
export const LicenseKind = {
  Original: "original",
  Licensed: "licensed",
} as const;
export type LicenseKind = (typeof LicenseKind)[keyof typeof LicenseKind];

/** Ad Sales step: organic has no sponsorship row; sponsored has one (a logo overlay). */
export const SponsorshipFormat = {
  Organic: "organic",
  Sponsored: "sponsored",
} as const;
export type SponsorshipFormat = (typeof SponsorshipFormat)[keyof typeof SponsorshipFormat];

const castMemberSchema = z.object({
  personId: z.string(),
  /** The person's Library role (`knownFor`), set on pick — not edited in the form. */
  role: z.enum(CastMemberInputDtoRoleEnum),
});

/** Max length per licence text field, with its label for the error. */
const LICENSE_TEXT_LIMITS = [
  ["licensorName", "Licensor", CONTENT_LIMITS.licensorMax],
  ["revenueSource", "Revenue source", CONTENT_LIMITS.revenueSourceMax],
  ["terms", "Terms", CONTENT_LIMITS.licenseTermsMax],
] as const;

/**
 * Every check runs only for a Licensed title — an Original sends no licence, so values left in
 * its hidden fields must not block the step.
 */
const licenseSchema = z
  .object({
    kind: z.enum(LicenseKind),
    licensorName: z.string().trim(),
    renewalStatus: z.enum(LicenseDtoRenewalStatusEnum),
    startsAt: z.date().optional(),
    expiresAt: z.date().optional(),
    /** Optional, in currency units; sent as cents. `NaN` when the input is empty. */
    cost: z.union([z.number(), z.nan()]),
    currency: z.string(),
    revenueSource: z.string().trim(),
    terms: z.string().trim(),
  })
  .superRefine((license, ctx) => {
    if (license.kind !== LicenseKind.Licensed) return;
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (!license.licensorName) issue("licensorName", "Licensor is required");
    for (const [field, label, max] of LICENSE_TEXT_LIMITS) {
      if (license[field].length > max) issue(field, `${label} must be ${max} characters or fewer`);
    }
    if (license.cost < 0) issue("cost", "Cost can't be negative");
    if (license.startsAt && license.expiresAt && license.expiresAt <= license.startsAt) {
      issue("expiresAt", "Expiry must be after the start");
    }
  });

/** Checks run only when Sponsored — values left in an Organic form's hidden fields don't block. */
const sponsorshipSchema = z
  .object({
    format: z.enum(SponsorshipFormat),
    sponsorName: z.string().trim(),
    /** Uploaded sponsor banner / logo; `null` = none. */
    banner: z.object({ mediaId: z.string(), previewUrl: z.string() }).nullable(),
    /** Overlay window — calendar days, both inclusive. */
    startsAt: z.date().optional(),
    endsAt: z.date().optional(),
  })
  .superRefine((sponsorship, ctx) => {
    if (sponsorship.format !== SponsorshipFormat.Sponsored) return;
    const issue = (path: string, message: string) =>
      ctx.addIssue({ code: "custom", path: [path], message });

    if (!sponsorship.sponsorName) issue("sponsorName", "Sponsor is required");
    else if (sponsorship.sponsorName.length > CONTENT_LIMITS.sponsorNameMax) {
      issue("sponsorName", `Sponsor must be ${CONTENT_LIMITS.sponsorNameMax} characters or fewer`);
    }
    if (sponsorship.startsAt && sponsorship.endsAt && sponsorship.endsAt < sponsorship.startsAt) {
      issue("endsAt", "End date can't be before the start");
    }
  });

/** Media step: an uploaded file — its media id is what's saved; the rest is for display. */
const uploadedVideoSchema = z.object({
  mediaId: z.string(),
  fileName: z.string(),
  sizeBytes: z.number(),
});
const uploadedThumbnailSchema = z.object({
  mediaId: z.string(),
  /** Local preview of the picked image. */
  previewUrl: z.string(),
});

/** Distribution: a region the video is published to — selected, and Live or switched Off. */
const publishRegionSchema = z.object({
  code: z.enum(SetRegionsDtoRegionsEnum),
  live: z.boolean(),
});

const watchLinkSchema = z
  .object({
    platform: z.enum(WatchLinkInputDtoPlatformEnum),
    /** Platform name when `platform` is "Other". */
    label: z.string().trim().max(CONTENT_LIMITS.watchLabelMax),
    url: z.string().trim().max(CONTENT_LIMITS.watchUrlMax),
  })
  .superRefine((link, ctx) => {
    if (link.platform === WatchLinkInputDtoPlatformEnum.Other && !link.label) {
      ctx.addIssue({ code: "custom", path: ["label"], message: "Platform name is required" });
    }
    if (link.url && !/^https:\/\/\S+$/.test(link.url)) {
      ctx.addIssue({ code: "custom", path: ["url"], message: "Use a full https:// link" });
    }
  });

/** Add / edit video wizard — mirrors the parts of `CreateContentDto` the form sends today. */
export const contentCreateSchema = z.object({
  title: z
    .string()
    .trim()
    .min(CONTENT_LIMITS.titleMin, `Title must be at least ${CONTENT_LIMITS.titleMin} characters`)
    .max(CONTENT_LIMITS.titleMax, `Title must be ${CONTENT_LIMITS.titleMax} characters or fewer`),
  description: z
    .string()
    .trim()
    .max(
      CONTENT_LIMITS.descriptionMax,
      `Description must be ${CONTENT_LIMITS.descriptionMax} characters or fewer`,
    ),
  /** "" = no studio. */
  studioId: z.string(),
  /** The first id is the primary genre. */
  genreIds: z
    .array(z.string())
    .max(CONTENT_LIMITS.genresMax, `At most ${CONTENT_LIMITS.genresMax} genres`),
  tagIds: z.array(z.string()).max(CONTENT_LIMITS.tagsMax, `At most ${CONTENT_LIMITS.tagsMax} tags`),
  /** Billing order is the array order. */
  cast: z
    .array(castMemberSchema)
    .max(CONTENT_LIMITS.castMax, `At most ${CONTENT_LIMITS.castMax} people`),
  contentType: z.enum(CreateContentDtoContentTypeEnum),
  language: z.string().max(CONTENT_LIMITS.languageMax),
  rightsRegion: z.enum(CreateContentDtoRightsRegionEnum),
  recommendation: z.enum(CreateContentDtoRecommendationEnum),
  /** Primary title of a BTS / clip; "" = standalone. */
  parentContentId: z.string(),
  /** Saved with its own API (`PUT /:id/regions`), not as part of the content record. */
  publishRegions: z.array(publishRegionSchema),
  exclusive: z.boolean(),
  unlockPoints: z.number().int("Whole points only").min(0, "Points can't be negative"),
  watchLinks: z.array(watchLinkSchema).max(CONTENT_LIMITS.watchLinksMax),
  /** Media step — `null` until a file is uploaded. */
  video: uploadedVideoSchema.nullable(),
  thumbnail: uploadedThumbnailSchema.nullable(),
  /** Rights step — saved with its own API, not as part of the content record. */
  license: licenseSchema,
  /** Ad Sales step — saved with its own API, not as part of the content record. */
  sponsorship: sponsorshipSchema,
});

export type ContentCreateFormValues = z.infer<typeof contentCreateSchema>;
export type ContentCastMember = z.infer<typeof castMemberSchema>;
export type ContentLicenseValues = z.infer<typeof licenseSchema>;
export type ContentPublishRegion = z.infer<typeof publishRegionSchema>;
export type ContentSponsorshipValues = z.infer<typeof sponsorshipSchema>;
export type ContentUploadedVideo = z.infer<typeof uploadedVideoSchema>;
export type ContentUploadedThumbnail = z.infer<typeof uploadedThumbnailSchema>;
