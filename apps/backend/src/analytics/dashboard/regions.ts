import { BadRequestException } from '@nestjs/common';

/** Macro-regions used across the product (content rights, plans, subscriptions). */
export const MACRO_REGIONS = ['NA', 'EU', 'APAC', 'LATAM', 'MEA'] as const;
export type MacroRegion = (typeof MACRO_REGIONS)[number];

export const MACRO_REGION_LABELS: Record<MacroRegion, string> = {
  NA: 'North America',
  EU: 'Europe',
  APAC: 'Asia-Pacific',
  LATAM: 'Latin America',
  MEA: 'Middle East & Africa',
};

/**
 * ISO-3166 alpha-2 → [macro-region, display name]. Mirrors apps/web `_libs/regions.ts`
 * (extended). Countries not listed still resolve as a country scope, just without a macro.
 */
export const COUNTRIES: Record<string, readonly [MacroRegion, string]> = {
  US: ['NA', 'United States'], CA: ['NA', 'Canada'],
  GB: ['EU', 'United Kingdom'], DE: ['EU', 'Germany'], FR: ['EU', 'France'], ES: ['EU', 'Spain'],
  IT: ['EU', 'Italy'], NL: ['EU', 'Netherlands'], BE: ['EU', 'Belgium'], SE: ['EU', 'Sweden'],
  NO: ['EU', 'Norway'], DK: ['EU', 'Denmark'], FI: ['EU', 'Finland'], IE: ['EU', 'Ireland'],
  PT: ['EU', 'Portugal'], PL: ['EU', 'Poland'], AT: ['EU', 'Austria'], CH: ['EU', 'Switzerland'],
  GR: ['EU', 'Greece'], CZ: ['EU', 'Czechia'], RO: ['EU', 'Romania'], HU: ['EU', 'Hungary'],
  UA: ['EU', 'Ukraine'],
  IN: ['APAC', 'India'], JP: ['APAC', 'Japan'], AU: ['APAC', 'Australia'], KR: ['APAC', 'South Korea'],
  SG: ['APAC', 'Singapore'], ID: ['APAC', 'Indonesia'], PH: ['APAC', 'Philippines'], TH: ['APAC', 'Thailand'],
  VN: ['APAC', 'Vietnam'], MY: ['APAC', 'Malaysia'], NZ: ['APAC', 'New Zealand'], CN: ['APAC', 'China'],
  HK: ['APAC', 'Hong Kong'], TW: ['APAC', 'Taiwan'], PK: ['APAC', 'Pakistan'], BD: ['APAC', 'Bangladesh'],
  LK: ['APAC', 'Sri Lanka'], NP: ['APAC', 'Nepal'],
  BR: ['LATAM', 'Brazil'], MX: ['LATAM', 'Mexico'], AR: ['LATAM', 'Argentina'], CO: ['LATAM', 'Colombia'],
  CL: ['LATAM', 'Chile'], PE: ['LATAM', 'Peru'], VE: ['LATAM', 'Venezuela'], EC: ['LATAM', 'Ecuador'],
  UY: ['LATAM', 'Uruguay'],
  AE: ['MEA', 'United Arab Emirates'], SA: ['MEA', 'Saudi Arabia'], ZA: ['MEA', 'South Africa'],
  NG: ['MEA', 'Nigeria'], EG: ['MEA', 'Egypt'], KE: ['MEA', 'Kenya'], IL: ['MEA', 'Israel'],
  TR: ['MEA', 'Turkey'], QA: ['MEA', 'Qatar'], MA: ['MEA', 'Morocco'], GH: ['MEA', 'Ghana'],
};

export function macroForCountry(code: string | null | undefined): MacroRegion | null {
  if (!code) {
    return null;
  }
  return COUNTRIES[code.toUpperCase()]?.[0] ?? null;
}

export function countriesOfMacro(macro: MacroRegion): string[] {
  return Object.keys(COUNTRIES).filter((c) => COUNTRIES[c]?.[0] === macro);
}

export interface RegionScope {
  /** Normalised code: 'global', a macro (NA…) or an ISO alpha-2 country. */
  code: string;
  name: string;
  kind: 'global' | 'macro' | 'country';
  /** Parent macro for country scopes. */
  macro: MacroRegion | null;
  /** `users.country_code` filter; null = no filter (global). */
  countries: string[] | null;
}

/** Resolve a `region` query / `:code` path value. Throws 400 for anything unrecognised. */
export function resolveRegionScope(raw: string | null | undefined): RegionScope {
  const v = (raw ?? '').trim();
  if (v === '' || v.toLowerCase() === 'global') {
    return { code: 'global', name: 'Global', kind: 'global', macro: null, countries: null };
  }
  const up = v.toUpperCase();
  if ((MACRO_REGIONS as readonly string[]).includes(up)) {
    const macro = up as MacroRegion;
    return { code: macro, name: MACRO_REGION_LABELS[macro], kind: 'macro', macro: null, countries: countriesOfMacro(macro) };
  }
  if (/^[A-Z]{2}$/.test(up)) {
    const entry = COUNTRIES[up];
    return { code: up, name: entry?.[1] ?? up, kind: 'country', macro: entry?.[0] ?? null, countries: [up] };
  }
  throw new BadRequestException(`Unknown region "${v}" — use global, a macro-region (${MACRO_REGIONS.join('/')}) or an ISO alpha-2 country`);
}
