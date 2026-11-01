import { z } from "zod";

import { UpdateAdCampaignDtoRegionsEnum } from "@/app/_libs/api/generated";

export const AD_LIMITS = {
  nameMin: 2,
  nameMax: 100,
  advertiserMax: 100,
  captionMax: 300,
  ctaLabelMax: 40,
  clickUrlMax: 500,
  /** One ad slot after every 5 videos in a 25-video feed → ranks 1–5. */
  rankMax: 5,
  /** A scheduled ad starts at least this many minutes from now. */
  scheduleLeadMinutes: 5,
  /** `skippableAfterSeconds` `@Max(600)`. */
  skipMaxSeconds: 600,
  /** New ads can be skipped after this many seconds (client default). */
  defaultSkipSeconds: 10,
} as const;

export const AD_START_MODES = ["now", "schedule"] as const;
export type AdStartMode = (typeof AD_START_MODES)[number];

const AD_REGIONS = Object.values(UpdateAdCampaignDtoRegionsEnum);
const regionSchema = z.enum(AD_REGIONS);

/** The backend only accepts `https` click URLs (`@IsUrl({ protocols: ['https'] })`). */
const HTTPS_URL = /^https:\/\/[^\s/$.?#].[^\s]*$/i;

const isRank = (raw?: string) => {
  const n = Number(raw);
  return !!raw?.trim() && Number.isInteger(n) && n >= 1 && n <= AD_LIMITS.rankMax;
};

/**
 * Create / edit form for a feed ad (a `commercial` campaign). Dates are `Date`s in the admin's local
 * time and ranks are the inputs' raw strings; `ad-form-mapper.ts` turns them into the backend DTO.
 */
export const adFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(AD_LIMITS.nameMin, `Name needs at least ${AD_LIMITS.nameMin} characters`)
      .max(AD_LIMITS.nameMax, `Keep the name under ${AD_LIMITS.nameMax} characters`),
    advertiserName: z
      .string()
      .trim()
      .min(1, "Enter the advertiser")
      .max(
        AD_LIMITS.advertiserMax,
        `Keep the advertiser under ${AD_LIMITS.advertiserMax} characters`,
      ),
    caption: z
      .string()
      .max(AD_LIMITS.captionMax, `Keep the caption under ${AD_LIMITS.captionMax} characters`),
    creativeMediaId: z.string().nullable(),
    durationSeconds: z.number().int().positive().nullable(),
    /** Seconds before the skip button shows; `0` (or an empty field) = straight away. */
    skippableAfterSeconds: z
      .number({ error: "Enter a number of seconds" })
      .int("Use whole seconds")
      .min(0, "Can't be negative")
      .max(AD_LIMITS.skipMaxSeconds, `At most ${AD_LIMITS.skipMaxSeconds} seconds`)
      .nullable(),
    ctaLabel: z.string().trim().min(1, "Pick a button label").max(AD_LIMITS.ctaLabelMax),
    clickUrl: z
      .string()
      .trim()
      .max(AD_LIMITS.clickUrlMax)
      .regex(HTTPS_URL, "Enter an https:// link"),
    /** `"all"` is sent as an empty `regions` array. */
    regions: z.union([z.literal("all"), z.array(regionSchema)]),
    ranks: z.partialRecord(regionSchema, z.string()),
    /** `now` starts the ad on save (the start picker is ignored); `schedule` uses `startsAt`. */
    startMode: z.enum(AD_START_MODES),
    startsAt: z.date().nullable(),
    // `Date | null` in and out: an explicit `boolean` keeps TS from reading the check as a type
    // guard, which would make the output `Date` and split react-hook-form's input/output types
    endsAt: z
      .date()
      .nullable()
      .refine((date): boolean => date !== null, "Pick an end date"),
  })
  .superRefine((values, ctx) => {
    // the backend refuses a skip point past the end of the video
    const skip = values.skippableAfterSeconds;
    if (skip != null && values.durationSeconds && skip > values.durationSeconds) {
      ctx.addIssue({
        code: "custom",
        path: ["skippableAfterSeconds"],
        message: `Can't be longer than the video (${values.durationSeconds}s)`,
      });
    }
    if (!values.creativeMediaId) {
      ctx.addIssue({ code: "custom", path: ["creativeMediaId"], message: "Upload a video" });
    }
    if (Array.isArray(values.regions) && values.regions.length === 0) {
      ctx.addIssue({ code: "custom", path: ["regions"], message: "Pick at least one region" });
    }
    const targeted = values.regions === "all" ? AD_REGIONS : values.regions;
    for (const region of targeted) {
      if (!isRank(values.ranks[region])) {
        ctx.addIssue({
          code: "custom",
          path: ["ranks", region],
          message: `Enter a whole number from 1 to ${AD_LIMITS.rankMax}`,
        });
      }
    }
    const startsNow = values.startMode === "now";
    if (!startsNow && !values.startsAt) {
      ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Pick a start date" });
    }
    const start = startsNow ? new Date() : values.startsAt;
    if (start && values.endsAt) {
      if (values.endsAt <= start) {
        ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End must be after the start" });
      } else if (values.endsAt.getTime() <= Date.now()) {
        ctx.addIssue({ code: "custom", path: ["endsAt"], message: "End date is in the past" });
      }
    }
  });

export type AdFormValues = z.infer<typeof adFormSchema>;
