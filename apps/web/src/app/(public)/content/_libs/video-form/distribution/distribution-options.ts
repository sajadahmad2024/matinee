import { Clapperboard, Film, type LucideIcon, Video } from "lucide-react";

import {
  CreateContentDtoContentTypeEnum as ContentTypeEnum,
  SetRegionsDtoRegionsEnum as PublishRegionEnum,
  CreateContentDtoRecommendationEnum as RecommendationEnum,
  CreateContentDtoRightsRegionEnum as RightsRegionEnum,
} from "@/app/_libs/api/generated";
import { MACRO_REGIONS } from "@/app/_libs/regions";
import type { CustomSelectOption } from "@/components/custom/custom-select";

/**
 * Distribution step dropdowns and rules. Lists with a backend enum are built from it, with labels typed `Record<Enum, string>`,
 * so a new backend value fails the type check until it gets a label.
 */

/** Per content type: its label, icon and the hint under the select. */
export const CONTENT_TYPES: Record<
  ContentTypeEnum,
  { label: string; icon: LucideIcon; hint: string }
> = {
  [ContentTypeEnum.Trailer]: {
    label: "Trailer",
    icon: Clapperboard,
    hint: "Primary promotional video",
  },
  [ContentTypeEnum.Bts]: {
    label: "Behind the Scenes (BTS)",
    icon: Video,
    hint: "A standalone extra — may optionally belong to a title",
  },
  [ContentTypeEnum.Clip]: {
    label: "Clip",
    icon: Film,
    hint: "Short clip — may optionally belong to a title",
  },
};

/** A BTS or clip may belong to one primary title; a trailer is always a primary title. */
export const canHaveParent = (contentType: ContentTypeEnum) =>
  contentType === ContentTypeEnum.Bts || contentType === ContentTypeEnum.Clip;

/** The API's largest page — the parent picker searches within it. */
export const PARENT_OPTIONS_LIMIT = 100;

// TODO: load languages from the backend once it exposes them (the API takes any code ≤10 chars).
export const LANGUAGE_OPTIONS: CustomSelectOption[] = [
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
  { value: "es", label: "Spanish" },
  { value: "ja", label: "Japanese" },
  { value: "ko", label: "Korean" },
  { value: "pt", label: "Portuguese" },
];

/** A macro-region's display name (`NA` → "North America"); unknown codes show as-is. */
export const regionLabel = (code: string) =>
  MACRO_REGIONS.find((region) => region.code === code)?.label ?? code;

export const RIGHTS_REGION_OPTIONS: CustomSelectOption<RightsRegionEnum>[] = Object.values(
  RightsRegionEnum,
).map((value) => ({
  value,
  label: value === RightsRegionEnum.Global ? "Global" : regionLabel(value),
}));

const RECOMMENDATION_LABELS: Record<RecommendationEnum, string> = {
  [RecommendationEnum.Promoted]: "Promoted",
  [RecommendationEnum.Normal]: "Normal",
  [RecommendationEnum.Deprioritized]: "Deprioritized",
};

export const RECOMMENDATION_OPTIONS: CustomSelectOption<RecommendationEnum>[] = Object.values(
  RecommendationEnum,
).map((value) => ({ value, label: RECOMMENDATION_LABELS[value] }));

export const ALL_PUBLISH_REGIONS = Object.values(PublishRegionEnum);
