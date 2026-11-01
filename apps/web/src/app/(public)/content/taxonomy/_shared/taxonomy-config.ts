import { TaxonomySort } from "@/app/_libs/api/generated";
import type { CustomSelectOption } from "@/components/custom/custom-select";

import { CONTENT_TABLE_CLASS_NAMES } from "../../_shared/content-table-class-names";

/** Static config for the content library (`/content/taxonomy`): tabs, sort, table, copy. */

// ─── Tabs ────────────────────────────────────────────────────────────────────

/** Library tabs (`?tab=`). */
export const TaxonomyTab = {
  Studios: "studios",
  Genres: "genres",
  Tags: "tags",
  People: "cast",
} as const;
export type TaxonomyTab = (typeof TaxonomyTab)[keyof typeof TaxonomyTab];

export interface TaxonomyTabConfig {
  /** Tab trigger + card heading. */
  title: string;
  /** Singular, used in buttons, modal titles and toasts — e.g. "Add Studio". */
  noun: string;
  /** Header + field label for the meta column; omit to hide it. */
  metaLabel?: string;
  /** Header + field label for the image (logo / photo); omit to hide it. */
  imageLabel?: string;
}

/** Tab order follows the object order. */
export const TAXONOMY_TABS_CONFIG: Record<TaxonomyTab, TaxonomyTabConfig> = {
  [TaxonomyTab.Studios]: {
    title: "Studios",
    noun: "Studio",
    metaLabel: "Country",
    imageLabel: "Logo",
  },
  [TaxonomyTab.Genres]: { title: "Genres", noun: "Genre" },
  [TaxonomyTab.Tags]: { title: "Tags", noun: "Tag" },
  [TaxonomyTab.People]: {
    title: "Cast & Crew",
    noun: "Person",
    metaLabel: "Role",
    imageLabel: "Photo",
  },
};

const TAXONOMY_TAB_VALUES = new Set<string>(Object.values(TaxonomyTab));

/** Unknown `?tab=` values fall back to the default tab. */
export const toTaxonomyTab = (value?: string | null): TaxonomyTab =>
  value && TAXONOMY_TAB_VALUES.has(value) ? (value as TaxonomyTab) : TAXONOMY_DEFAULTS.tab;

// ─── Sort ────────────────────────────────────────────────────────────────────

/** Values are the API's `TaxonomySort` enum, so they pass straight through. */
export const TAXONOMY_SORT_OPTIONS = [
  { value: TaxonomySort.MostUsed, label: "Most used" },
  { value: TaxonomySort.LeastUsed, label: "Least used" },
  { value: TaxonomySort.Name, label: "Name (A–Z)" },
] as const satisfies readonly CustomSelectOption<TaxonomySort>[];

// ─── Defaults & table ────────────────────────────────────────────────────────

export const TAXONOMY_DEFAULTS = {
  tab: TaxonomyTab.Studios,
  sort: TaxonomySort.MostUsed,
  /** Rows per page for the infinite-scroll lists (tags, people); studios and genres come in full. */
  pageSize: 30,
} as const satisfies { tab: TaxonomyTab; sort: TaxonomySort; pageSize: number };

export const TAXONOMY_SEARCH_DEBOUNCE_MS = 300;

/**
 * Equal-width columns (`table-fixed`); below `min-w` the table scrolls sideways. The first column
 * is inset (`first:pl-4`) to line up with the card's heading and search row. The opaque header
 * comes from `CONTENT_TABLE_CLASS_NAMES`.
 */
export const TAXONOMY_TABLE_CLASS_NAMES = {
  ...CONTENT_TABLE_CLASS_NAMES,
  table: "min-w-[640px] table-fixed",
  head: `${CONTENT_TABLE_CLASS_NAMES.head} first:pl-4`,
  cell: `${CONTENT_TABLE_CLASS_NAMES.cell} first:pl-4`,
};

/**
 * The table scrolls inside the card: at most what's left of the screen under the page header,
 * tabs, toolbar and footer (never under 16rem).
 */
export const TAXONOMY_TABLE_HEIGHT = "max-h-[max(16rem,calc(100dvh-27rem))] min-h-64";

// ─── Image upload ───────────────────────────────────────────────────────────

/**
 * Logo / photo rules, checked before upload. TODO(BE): admin uploads skip the backend's image
 * checks (only the 10 GB global cap applies) — mirror these there.
 */
export const TAXONOMY_IMAGE_RULES = {
  maxBytes: 5 * 1024 * 1024,
  maxLabel: "5 MB",
  mimeTypes: ["image/png", "image/jpeg", "image/webp"],
  typesLabel: "PNG, JPG or WebP",
} as const;

// ─── Copy ────────────────────────────────────────────────────────────────────

export const TAXONOMY_COPY = {
  pageTitle: "Content Library",
  pageSubtitle: "Manage the master data referenced across content — studios, genres, tags, cast.",
  backLabel: "Back to content",
  searchPlaceholder: (title: string) => `Search ${title.toLowerCase()}...`,
  loading: (title: string) => `Loading ${title.toLowerCase()}...`,
  empty: (title: string) => `No ${title.toLowerCase()} yet.`,
  noMatches: "No matches.",
  loadError: (title: string) => `Unable to load ${title.toLowerCase()}`,
  created: (noun: string) => `${noun} created`,
  updated: (noun: string) => `${noun} updated`,
  deleted: (noun: string, name: string) => `${noun} "${name}" deleted`,
  saveError: (noun: string) => `Unable to save ${noun.toLowerCase()}.`,
  deleteError: (noun: string) => `Unable to delete ${noun.toLowerCase()}.`,
  deleteInUseTitle: (noun: string) => `${noun} is in use`,
  deleteInUse: (name: string, count: number) =>
    `"${name}" is used by ${count} ${count === 1 ? "video" : "videos"}. Remove it from them before deleting it.`,
  enabled: (noun: string, name: string) => `${noun} "${name}" enabled`,
  disabled: (noun: string, name: string) => `${noun} "${name}" disabled`,
  toggleError: (noun: string) => `Unable to update ${noun.toLowerCase()} status.`,
  imageHint: `${TAXONOMY_IMAGE_RULES.typesLabel} · up to ${TAXONOMY_IMAGE_RULES.maxLabel}`,
  imageType: `Choose a ${TAXONOMY_IMAGE_RULES.typesLabel} image.`,
  imageTooLarge: `Image must be ${TAXONOMY_IMAGE_RULES.maxLabel} or smaller.`,
} as const;
