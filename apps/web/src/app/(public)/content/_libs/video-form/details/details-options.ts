import {
  CastMemberInputDtoRoleEnum,
  TaxonomySort,
  WatchLinkInputDtoPlatformEnum,
} from "@/app/_libs/api/generated";
import type { CustomSelectOption } from "@/components/custom/custom-select";

/** Details step: where-to-watch platforms, cast role labels, the Suggestions card size. */

/** Consumer-app "where to watch" CTA — the platform name is its own label. */
export const WATCH_PLATFORM_OPTIONS: CustomSelectOption<WatchLinkInputDtoPlatformEnum>[] =
  Object.values(WatchLinkInputDtoPlatformEnum).map((platform) => ({
    value: platform,
    label: platform,
  }));

export const DEFAULT_WATCH_PLATFORM = WatchLinkInputDtoPlatformEnum.Netflix;

export const CAST_ROLE_LABELS: Record<CastMemberInputDtoRoleEnum, string> = {
  [CastMemberInputDtoRoleEnum.Actor]: "Actor",
  [CastMemberInputDtoRoleEnum.Director]: "Director",
  [CastMemberInputDtoRoleEnum.Writer]: "Writer",
  [CastMemberInputDtoRoleEnum.Producer]: "Producer",
  [CastMemberInputDtoRoleEnum.Other]: "Other",
};

/** A person's `knownFor` shares the cast-role values; unset falls back to actor. */
export const DEFAULT_CAST_ROLE = CastMemberInputDtoRoleEnum.Actor;

/** How many most-used genres / tags the Suggestions card offers. */
export const SUGGESTIONS_LIMIT = 4;

/**
 * Tags and people are paged and searched through the API: the pickers show the first 50 matches
 * (A–Z) for what's typed, after a short pause.
 */
export const PAGED_PICKER_PARAMS = { sort: TaxonomySort.Name, limit: 50 } as const;
export const PICKER_SEARCH_DEBOUNCE_MS = 300;
