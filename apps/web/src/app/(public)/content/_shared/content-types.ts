import { ALL_REGIONS, MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

/** Region lens key: the whole library, or one macro-region. */
export type ContentRegionKey = typeof ALL_REGIONS | MacroRegion;

const MACRO_CODES = new Set(MACRO_REGIONS.map((r) => r.code as string));

/** A macro-region code ("apac" → "APAC"), or `undefined` when the value isn't one. */
export const toMacroRegion = (value?: string | null): MacroRegion | undefined =>
  value && MACRO_CODES.has(value.toUpperCase()) ? (value.toUpperCase() as MacroRegion) : undefined;

/** `?region=` → lens key; anything that isn't a macro-region means the whole library. */
export const normalizeContentRegion = (value?: string | null): ContentRegionKey =>
  toMacroRegion(value) ?? ALL_REGIONS;
