"use client";

// Phase 1 only (spec-12 §4.1): the Game Management hooks with their final signatures, fetching from
// `game-mock-api.ts`. Phase 3 moves them to `@/app/_libs/hooks/api/use-admin-games.ts` with SDK
// calls (and `.data` envelopes) in the query functions; the screens keep the same return values.
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { gameMockApi } from "./game-mock-api";
import type {
  GameRegion,
  GameRuleKey,
  ProposedGameWidgetDto,
  ProposedLeaderboardInstanceDto,
  UpdateRewardRuleDto,
} from "./game-types";

// own prefix: Phase 3's real keys (`admin-games`) must never share cache with the mock
const GAMES_QUERY_KEYS = {
  all: ["admin-games-mock"] as const,
  types: () => [...GAMES_QUERY_KEYS.all, "types"] as const,
  overview: (params: object) => [...GAMES_QUERY_KEYS.all, "overview", params] as const,
  regionalActivity: (params: object) =>
    [...GAMES_QUERY_KEYS.all, "regional-activity", params] as const,
  trends: (params: object) => [...GAMES_QUERY_KEYS.all, "trends", params] as const,
  formatAnalytics: (params: object) =>
    [...GAMES_QUERY_KEYS.all, "format-analytics", params] as const,
  rule: (key: GameRuleKey) => [...GAMES_QUERY_KEYS.all, "rule", key] as const,
  widget: (key: GameRuleKey) => [...GAMES_QUERY_KEYS.all, "widget", key] as const,
  leaderboardPlayers: (params?: object) =>
    [...GAMES_QUERY_KEYS.all, "leaderboard-players", params ?? {}] as const,
  leaderboardInstances: (params?: object) =>
    [...GAMES_QUERY_KEYS.all, "leaderboard-instances", params ?? {}] as const,
} as const;

/** A game write can move statuses, counts and the formats summary, so it refreshes the domain. */
const useInvalidateGames = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.all });
};

// ─── Master page analytics (proposed endpoints) ──────────────────────────────

interface GamesWindow {
  /** The master page's `?timeRange=` (e.g. `7d`). */
  timeRange: string;
}

/** Master tiles + per-format row stats for a window and region. */
export const useGamesOverview = (params: GamesWindow & { region: GameRegion }) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.overview(params),
    queryFn: () => gameMockApi.overview(params.region),
    placeholderData: keepPreviousData,
  });

  return { overviewQuery: query, overview: query?.data };
};

/** The master page's regional heat grid (every region, so it ignores the region lens). */
export const useGamesRegionalActivity = (params: GamesWindow) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.regionalActivity(params),
    queryFn: () => gameMockApi.regionalActivity(),
    placeholderData: keepPreviousData,
  });

  return { regionalActivityQuery: query, regionalActivity: query?.data };
};

/** Trends & Economy across all formats. */
export const useGamesTrends = (params: GamesWindow) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.trends(params),
    queryFn: () => gameMockApi.trends(),
    placeholderData: keepPreviousData,
  });

  return { trendsQuery: query, trends: query?.data };
};

/** A format's Analytics tab for a region. */
export const useGameFormatAnalytics = (params: { ruleKey: GameRuleKey; region: GameRegion }) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.formatAnalytics(params),
    queryFn: () => gameMockApi.formatAnalytics(params.ruleKey, params.region),
    placeholderData: keepPreviousData,
  });

  return { formatAnalyticsQuery: query, formatAnalytics: query?.data };
};

// ─── Formats library ─────────────────────────────────────────────────────────

/** `GET /admin/games/types` — per-format instance counts for the format rows. */
export const useGameTypesSummary = () => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.types(),
    queryFn: () => gameMockApi.typesSummary(),
  });

  return { typesSummaryQuery: query, typesSummary: query?.data };
};

// ─── Reward rules ────────────────────────────────────────────────────────────

/** `GET /admin/rewards/rules/:ruleKey` — a format's config and on/off switch. */
export const useRewardRule = (ruleKey: GameRuleKey) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.rule(ruleKey),
    queryFn: () => gameMockApi.getRule(ruleKey),
  });

  return { ruleQuery: query, rule: query?.data };
};

/** `PATCH /admin/rewards/rules/:ruleKey` — saves a new rule version. */
export const useUpdateRewardRule = () => {
  const invalidate = useInvalidateGames();
  const mutation = useMutation({
    mutationFn: ({ ruleKey, dto }: { ruleKey: GameRuleKey; dto: UpdateRewardRuleDto }) =>
      gameMockApi.updateRule(ruleKey, dto),
    onSuccess: () => invalidate(),
  });

  return { updateRuleMutation: mutation };
};

// ─── Widgets (proposed endpoints) ──────────────────────────────────────

/** Proposed `GET /admin/games/widgets/:gameKey` — how a format appears in the customer app. */
export const useGameWidget = (gameKey: GameRuleKey) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.widget(gameKey),
    queryFn: () => gameMockApi.getWidget(gameKey),
  });

  return { widgetQuery: query, widget: query?.data };
};

/** Proposed `PATCH /admin/games/widgets/:gameKey`. */
export const useUpdateGameWidget = () => {
  const invalidate = useInvalidateGames();
  const mutation = useMutation({
    mutationFn: ({
      gameKey,
      patch,
    }: {
      gameKey: GameRuleKey;
      patch: Partial<Omit<ProposedGameWidgetDto, "gameKey">>;
    }) => gameMockApi.updateWidget(gameKey, patch),
    onSuccess: () => invalidate(),
  });

  return { updateWidgetMutation: mutation };
};

// ─── Leaderboards ────────────────────────────────────────────────────────────

/** `GET /admin/leaderboard` — ranked by current points balance. */
export const useLeaderboardPlayers = (params: { page?: number; limit?: number } = {}) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.leaderboardPlayers(params),
    queryFn: () => gameMockApi.leaderboardPlayers(params),
    placeholderData: keepPreviousData,
  });

  return {
    playersQuery: query,
    players: query?.data?.items ?? [],
    total: query?.data?.pagination?.totalCount ?? 0,
  };
};

/** Proposed `GET /admin/games/leaderboard/instances` — "Top Games" by competition health. */
export const useLeaderboardInstances = (
  params: { format?: ProposedLeaderboardInstanceDto["format"] } = {},
) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.leaderboardInstances(params),
    queryFn: () => gameMockApi.leaderboardInstances(params.format),
    placeholderData: keepPreviousData,
  });

  return { instancesQuery: query, instances: query?.data ?? [] };
};
