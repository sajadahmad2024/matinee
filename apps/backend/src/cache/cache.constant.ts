export const CACHE_CLIENT = 'CACHE_CLIENT';

/**
 * TTL presets (seconds). Use these instead of magic numbers so cache
 * lifetimes are consistent and tunable in one place.
 */
export const CacheTtl = {
  SHORT: 30,
  DEFAULT: 5 * 60,
  MEDIUM: 30 * 60,
  LONG: 60 * 60,
  DAY: 24 * 60 * 60,
} as const;
