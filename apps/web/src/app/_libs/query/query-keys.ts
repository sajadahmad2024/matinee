/**
 * Query-key factories — one object per backend domain, never raw string arrays in hooks.
 *
 * Every key starts with the domain's `all` prefix so a mutation can invalidate the whole
 * domain (`{ queryKey: X.all }`) or a slice (`[...X.all, "list"]`) without knowing params.
 */

export const MINUTES_1 = 60 * 1000;
export const MINUTES_5 = 5 * MINUTES_1;
export const MINUTES_15 = 15 * MINUTES_1;
export const MINUTES_30 = 30 * MINUTES_1;
export const HOURS_24 = 24 * 60 * MINUTES_1;

export const ADMIN_AUTH_QUERY_KEYS = {
  all: ["admin-auth"] as const,
  me: () => [...ADMIN_AUTH_QUERY_KEYS.all, "me"] as const,
} as const;

export const ADMIN_ADMINS_QUERY_KEYS = {
  all: ["admin-admins"] as const,
  list: (params?: object) => [...ADMIN_ADMINS_QUERY_KEYS.all, "list", params ?? {}] as const,
} as const;

export const ADMIN_ROLES_QUERY_KEYS = {
  all: ["admin-roles"] as const,
  list: () => [...ADMIN_ROLES_QUERY_KEYS.all, "list"] as const,
} as const;

export const CONTENT_QUERY_KEYS = {
  all: ["admin-content"] as const,
  list: (params?: object) => [...CONTENT_QUERY_KEYS.all, "list", params ?? {}] as const,
  full: (id: string) => [...CONTENT_QUERY_KEYS.all, "full", id] as const,
  detail: (id: string) => [...CONTENT_QUERY_KEYS.all, "detail", id] as const,
  stats: (region?: string) => [...CONTENT_QUERY_KEYS.all, "stats", region ?? "all"] as const,
  licenseSummary: () => [...CONTENT_QUERY_KEYS.all, "license-summary"] as const,
  recommendedActions: (region?: string) =>
    [...CONTENT_QUERY_KEYS.all, "recommended-actions", region ?? "all"] as const,
  licenses: (params?: object) => [...CONTENT_QUERY_KEYS.all, "licenses", params ?? {}] as const,
} as const;

export const MEDIA_QUERY_KEYS = {
  all: ["media"] as const,
  detail: (id: string) => [...MEDIA_QUERY_KEYS.all, "detail", id] as const,
  playback: (id: string) => [...MEDIA_QUERY_KEYS.all, "playback", id] as const,
} as const;

export const TAXONOMY_QUERY_KEYS = {
  all: ["content-taxonomy"] as const,
  studios: (params?: object) => [...TAXONOMY_QUERY_KEYS.all, "studios", params ?? {}] as const,
  genres: (params?: object) => [...TAXONOMY_QUERY_KEYS.all, "genres", params ?? {}] as const,
  tags: (params?: object) => [...TAXONOMY_QUERY_KEYS.all, "tags", params ?? {}] as const,
  people: (params?: object) => [...TAXONOMY_QUERY_KEYS.all, "people", params ?? {}] as const,
} as const;

export const ANALYTICS_QUERY_KEYS = {
  all: ["admin-analytics"] as const,
  contentLibrary: (params?: object) =>
    [...ANALYTICS_QUERY_KEYS.all, "content-library", params ?? {}] as const,
  realtime: (region?: string) =>
    [...ANALYTICS_QUERY_KEYS.all, "realtime", region ?? "all"] as const,
  content: (id: string, params?: object) =>
    [...ANALYTICS_QUERY_KEYS.all, "content", id, params ?? {}] as const,
} as const;

export const ADS_QUERY_KEYS = {
  all: ["admin-ads"] as const,
  campaigns: (params?: object) => [...ADS_QUERY_KEYS.all, "campaigns", params ?? {}] as const,
  campaign: (id: string) => [...ADS_QUERY_KEYS.all, "campaign", id] as const,
  performance: (id: string, params?: object) =>
    [...ADS_QUERY_KEYS.all, "performance", id, params ?? {}] as const,
  rankBoard: (params?: object) => [...ADS_QUERY_KEYS.all, "rank-board", params ?? {}] as const,
  summary: (params?: object) => [...ADS_QUERY_KEYS.all, "summary", params ?? {}] as const,
} as const;

export const REGIONS_QUERY_KEYS = {
  all: ["admin-regions"] as const,
  countries: () => [...REGIONS_QUERY_KEYS.all, "countries"] as const,
} as const;

export const GAMES_QUERY_KEYS = {
  all: ["admin-games"] as const,
  badges: () => [...GAMES_QUERY_KEYS.all, "badges"] as const,
  // under `badges()`, so every badge write refreshes the tiles too
  badgeSummary: () => [...GAMES_QUERY_KEYS.badges(), "summary"] as const,
  badgeTriggers: () => [...GAMES_QUERY_KEYS.all, "badge-triggers"] as const,
  quests: (params?: object) => [...GAMES_QUERY_KEYS.all, "quests", params ?? {}] as const,
  quest: (id: string) => [...GAMES_QUERY_KEYS.all, "quest", id] as const,
  questParticipants: (id: string, params?: object) =>
    [...GAMES_QUERY_KEYS.all, "quest-participants", id, params ?? {}] as const,
  predictions: (params?: object) => [...GAMES_QUERY_KEYS.all, "predictions", params ?? {}] as const,
  prediction: (id: string) => [...GAMES_QUERY_KEYS.all, "prediction", id] as const,
  predictionEntries: (id: string, params?: object) =>
    [...GAMES_QUERY_KEYS.all, "prediction-entries", id, params ?? {}] as const,
  rule: (ruleKey: string) => [...GAMES_QUERY_KEYS.all, "rule", ruleKey] as const,
} as const;
