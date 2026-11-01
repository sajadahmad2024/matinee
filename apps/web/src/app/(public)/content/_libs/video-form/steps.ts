import { DollarSign, FileText, Film, Gavel, Globe, type LucideIcon } from "lucide-react";

import type { ContentCreateFormValues } from "@/app/_libs/schemas";

/** Wizard steps, in order: Details → Rights → Media → Distribution → Ad Sales. */
export const VideoFormStep = {
  Details: "details",
  Rights: "rights",
  Media: "media",
  Distribution: "distribution",
  AdSales: "ad-sales",
} as const;
export type VideoFormStep = (typeof VideoFormStep)[keyof typeof VideoFormStep];

export interface VideoFormStepConfig {
  key: VideoFormStep;
  label: string;
  icon: LucideIcon;
  /** Form fields the step owns — they must be valid before the next step unlocks. */
  fields: (keyof ContentCreateFormValues)[];
}

export const VIDEO_FORM_STEPS: VideoFormStepConfig[] = [
  {
    key: VideoFormStep.Details,
    label: "Details",
    icon: FileText,
    fields: ["title", "description", "studioId", "genreIds", "tagIds", "cast", "watchLinks"],
  },
  { key: VideoFormStep.Rights, label: "Rights", icon: Gavel, fields: ["license"] },
  { key: VideoFormStep.Media, label: "Media", icon: Film, fields: ["video", "thumbnail"] },
  {
    key: VideoFormStep.Distribution,
    label: "Distribution",
    icon: Globe,
    fields: [
      "contentType",
      "language",
      "rightsRegion",
      "recommendation",
      "parentContentId",
      "publishRegions",
      "exclusive",
      "unlockPoints",
    ],
  },
  { key: VideoFormStep.AdSales, label: "Ad Sales", icon: DollarSign, fields: ["sponsorship"] },
];

export const stepIndex = (step: VideoFormStep) => VIDEO_FORM_STEPS.findIndex((s) => s.key === step);

/** First step owning one of the invalid fields — where a failed save sends the user. */
export const firstStepWithError = (invalidFields: string[]) =>
  VIDEO_FORM_STEPS.find((s) => s.fields.some((f) => invalidFields.includes(f)))?.key ??
  VideoFormStep.Details;
