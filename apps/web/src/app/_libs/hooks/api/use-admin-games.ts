"use client";

// Game Management hooks over the SDK (spec-12 §10). Flows not moved yet still read
// `(public)/games/_libs/use-games.ts`.
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminPredictionControllerEntriesV1ResultEnum,
  AdminPredictionControllerListV1StatusEnum,
  AdminQuestControllerListV1StatusEnum,
  AdminQuestControllerParticipantsV1StatusEnum,
  CreateBadgeDto,
  CreatePredictionDto,
  CreateQuestDto,
  PaginationDetailsDto,
  UpdateBadgeDto,
  UpdatePredictionDto,
  UpdateQuestDto,
  UpdateRewardRuleDto,
} from "@/app/_libs/api/generated";
import {
  adminBadgesApi,
  adminGamesApi,
  adminTokenomicsApi,
} from "@/app/_libs/api/sdk/admin-games-api";
import { GAMES_QUERY_KEYS } from "@/app/_libs/query/query-keys";

/** Every badge write can change earned counts and the summary tiles, so it refreshes all badges. */
const useInvalidateBadges = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.badges() });
};

// ─── Instance lists (quests, predictions) ────────────────────────────────────

/** Where an infinite instance list is: which of its statuses, which page of it. */
interface StatusPageParam {
  statusIndex: number;
  page: number;
}

interface StatusPage<T> {
  items?: T[];
  pagination?: PaginationDetailsDto;
}

/**
 * One tab of an instance list, paged as it scrolls. The list endpoints filter by one status, so a
 * tab over several walks them in turn: every page of the first, then the next. Each status keeps
 * the backend's order (newest first); `"all"` is one unfiltered stream. The tab's total is each
 * status's `totalCount`, summed once every status has loaded its first page (no count requests).
 */
function useInfiniteByStatus<S extends string, T>(
  queryKey: readonly unknown[],
  statuses: readonly S[] | "all",
  limit: number,
  fetchPage: (params: {
    page: number;
    limit: number;
    status?: S;
  }) => Promise<StatusPage<T> | undefined>,
) {
  const streams: (S | undefined)[] = statuses === "all" ? [undefined] : [...statuses];
  const query = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam }) => {
      const status = streams[pageParam.statusIndex];
      const list = await fetchPage({ page: pageParam.page, limit, ...(status ? { status } : {}) });
      return { ...pageParam, list };
    },
    initialPageParam: { statusIndex: 0, page: 1 } as StatusPageParam,
    getNextPageParam: (last: StatusPageParam & { list?: StatusPage<T> }) => {
      const totalPages = last.list?.pagination?.totalPages ?? 0;
      if (last.page < totalPages) return { statusIndex: last.statusIndex, page: last.page + 1 };
      if (last.statusIndex + 1 < streams.length)
        return { statusIndex: last.statusIndex + 1, page: 1 };
      return undefined;
    },
    // always stale: opening a tab refetches it (its cached rows show meanwhile)
    staleTime: 0,
  });

  const pages = query?.data?.pages ?? [];
  const firstPages = streams?.map((_, i) =>
    pages.find((p) => p?.statusIndex === i && p?.page === 1),
  );
  const total = firstPages.every(Boolean)
    ? firstPages.reduce((sum, p) => sum + (p?.list?.pagination?.totalCount ?? 0), 0)
    : undefined;

  return { query, items: pages.flatMap((p) => p?.list?.items ?? []), total };
}

// ─── Badges ──────────────────────────────────────────────────────────────────

/** `GET /admin/badges` — every badge (inactive included) with its `earnedCount`. */
export const useBadges = () => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.badges(),
    queryFn: () => adminBadgesApi.adminBadgesControllerListV1(),
  });

  return { badgesQuery: query, badges: query?.data?.data ?? [] };
};

/** `GET /admin/badges/summary` — the header tiles: totals, players holding a badge, never earned. */
export const useBadgeSummary = () => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.badgeSummary(),
    queryFn: () => adminBadgesApi.adminBadgesControllerSummaryV1(),
  });

  return { badgeSummaryQuery: query, summary: query?.data?.data };
};

/** `GET /admin/badges/triggers` — the metrics a badge can be awarded on. */
export const useBadgeTriggers = () => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.badgeTriggers(),
    queryFn: () => adminBadgesApi.adminBadgesControllerTriggersV1(),
    staleTime: Infinity,
  });

  return { badgeTriggersQuery: query, triggers: query?.data?.data ?? [] };
};

/** `POST /admin/badges` — the backend also awards it to everyone already past the threshold. */
export const useCreateBadge = () => {
  const invalidate = useInvalidateBadges();
  const mutation = useMutation({
    mutationFn: async (createBadgeDto: CreateBadgeDto) =>
      (await adminBadgesApi.adminBadgesControllerCreateV1({ createBadgeDto }))?.data,
    onSuccess: () => invalidate(),
  });

  return { createBadgeMutation: mutation };
};

/**
 * `PATCH /admin/badges/:id` — also turns a badge on or off (`isActive`). A rename keeps the
 * badge's `slug`, so streak / quest awards by slug survive it.
 */
export const useUpdateBadge = () => {
  const invalidate = useInvalidateBadges();
  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateBadgeDto }) =>
      (await adminBadgesApi.adminBadgesControllerUpdateV1({ id, updateBadgeDto: dto }))?.data,
    onSuccess: () => invalidate(),
  });

  return { updateBadgeMutation: mutation };
};

/** `DELETE /admin/badges/:id` — soft delete: the badge leaves the catalog and is no longer awarded. */
export const useDeleteBadge = () => {
  const invalidate = useInvalidateBadges();
  const mutation = useMutation({
    mutationFn: (id: string) => adminBadgesApi.adminBadgesControllerRemoveV1({ id }),
    onSuccess: () => invalidate(),
  });

  return { deleteBadgeMutation: mutation };
};

// ─── Weekly Quests ───────────────────────────────────────────────────────────

/**
 * Targeted refreshes after a quest write. Only mounted queries refetch (the open tab); other tabs
 * are marked stale and reload when opened. The tab's count comes from its own list response.
 */
const useInvalidateQuests = () => {
  const queryClient = useQueryClient();
  // keys match element by element, so each family has its own prefix
  const prefix = (key: readonly unknown[]) => ({ queryKey: key.slice(0, 2) });
  return {
    lists: () => queryClient.invalidateQueries(prefix(GAMES_QUERY_KEYS.quests())),
    detail: (id: string) => queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.quest(id) }),
    // End / cancel pay out completed participations, so the results change too
    participants: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: GAMES_QUERY_KEYS.questParticipants(id).slice(0, 3),
      }),
  };
};

type QuestListStatus = AdminQuestControllerListV1StatusEnum;

/**
 * One tab of the quest list, paged as it scrolls. `GET /admin/quests` filters by one status, so a
 * tab over several (`["scheduled", "draft"]`) walks them in turn (`useInfiniteByStatus`).
 */
export const useInfiniteQuests = (statuses: readonly QuestListStatus[] | "all", limit = 20) => {
  const { query, items, total } = useInfiniteByStatus(
    GAMES_QUERY_KEYS.quests({ statuses, limit, infinite: true }),
    statuses,
    limit,
    async (params: { page: number; limit: number; status?: QuestListStatus }) =>
      (await adminGamesApi.adminQuestControllerListV1(params))?.data,
  );

  return { questsQuery: query, quests: items, total };
};

/** `GET /admin/quests/:id` — the quest with its actions (the video set). */
export const useQuest = (id?: string) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.quest(id ?? ""),
    queryFn: () => adminGamesApi.adminQuestControllerGetV1({ id: id ?? "" }),
    enabled: !!id,
    staleTime: 0,
  });

  return { questQuery: query, quest: query?.data?.data };
};

/**
 * `GET /admin/quests/:id/participants` — a quest's results, paged as the table scrolls: one row per
 * player who started it (filter by `in_progress` / `completed` / `claimed`), plus `summary` totals
 * for the whole quest (unaffected by the filter), read from the first page.
 */
export const useQuestParticipants = (
  id?: string,
  status?: AdminQuestControllerParticipantsV1StatusEnum,
  limit = 20,
) => {
  const query = useInfiniteQuery({
    queryKey: GAMES_QUERY_KEYS.questParticipants(id ?? "", { status, limit }),
    queryFn: async ({ pageParam }) =>
      (
        await adminGamesApi.adminQuestControllerParticipantsV1({
          id: id ?? "",
          page: pageParam,
          limit,
          ...(status ? { status } : {}),
        })
      )?.data,
    initialPageParam: 1,
    getNextPageParam: (last, _all, page) =>
      page < (last?.pagination?.totalPages ?? 0) ? page + 1 : undefined,
    enabled: !!id,
    staleTime: 0,
  });

  const pages = query?.data?.pages ?? [];
  return {
    participantsQuery: query,
    participants: pages.flatMap((p) => p?.items ?? []),
    summary: pages[0]?.summary,
  };
};

/**
 * `POST /admin/quests` then `POST /:id/publish`: the backend creates every quest as a draft, and
 * the form has no draft step. Publish makes it `active` when its start has passed (Publish now),
 * `scheduled` otherwise. If publish fails the quest stays a draft (listed under "All", with
 * Publish in its menu), and the error says so. Resolves with the published status.
 */
export const useCreateQuest = () => {
  const invalidate = useInvalidateQuests();
  const mutation = useMutation({
    mutationFn: async (createQuestDto: CreateQuestDto) => {
      const created = (await adminGamesApi.adminQuestControllerCreateV1({ createQuestDto }))?.data;
      if (!created?.id) throw new Error("The quest wasn't created");
      try {
        return (await adminGamesApi.adminQuestControllerPublishV1({ id: created.id }))?.data;
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        throw new Error(`Saved as a draft, but couldn't publish it: ${reason}`);
      }
    },
    // refresh on failure too: a failed publish still left a draft behind
    onSettled: () => invalidate.lists(),
  });

  return { createQuestMutation: mutation };
};

/**
 * `PATCH /admin/quests/:id` — send only the changed fields: the backend rejects any field its
 * status locks when it is present, changed or not (`409 INSTANCE_LOCKED_FIELD`, spec-12 §10.2).
 * `bannerMediaId: null` removes the banner.
 */
export const useUpdateQuest = () => {
  const invalidate = useInvalidateQuests();
  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdateQuestDto }) =>
      (await adminGamesApi.adminQuestControllerUpdateV1({ id, updateQuestDto: dto }))?.data,
    onSuccess: (_data, { id }) => Promise.all([invalidate.lists(), invalidate.detail(id)]),
  });

  return { updateQuestMutation: mutation };
};

export type QuestAction =
  | "publish"
  | "clone"
  | "activate"
  | "end"
  | "cancel"
  | "archive"
  | "delete";

// Each action answers with its own shape; callers only need success or the backend's error.
const runQuestAction = (id: string, action: QuestAction): Promise<unknown> => {
  switch (action) {
    case "publish":
      return adminGamesApi.adminQuestControllerPublishV1({ id });
    case "clone":
      return adminGamesApi.adminQuestControllerCloneV1({ id });
    case "activate":
      return adminGamesApi.adminQuestControllerActivateV1({ id });
    case "end":
      return adminGamesApi.adminQuestControllerEndV1({ id });
    case "cancel":
      return adminGamesApi.adminQuestControllerCancelV1({ id });
    case "archive":
      return adminGamesApi.adminQuestControllerArchiveV1({ id });
    case "delete":
      return adminGamesApi.adminQuestControllerRemoveV1({ id });
  }
};

/** `POST /admin/quests/:id/{publish,clone,activate,end,cancel,archive}` and `DELETE /:id`. */
export const useQuestAction = () => {
  const invalidate = useInvalidateQuests();
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: QuestAction }) => runQuestAction(id, action),
    onSuccess: (_data, { id }) =>
      Promise.all([invalidate.lists(), invalidate.detail(id), invalidate.participants(id)]),
  });

  return { questActionMutation: mutation };
};

// ─── Predictions ─────────────────────────────────────────────────────────────

/** Targeted refreshes after a prediction write, as for quests: the open tab and the detail. */
const useInvalidatePredictions = () => {
  const queryClient = useQueryClient();
  return {
    lists: () =>
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.predictions().slice(0, 2) }),
    detail: (id: string) =>
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.prediction(id) }),
    // resolve / cancel / reverse change every entry's result and payout
    entries: (id: string) =>
      queryClient.invalidateQueries({
        queryKey: GAMES_QUERY_KEYS.predictionEntries(id).slice(0, 3),
      }),
  };
};

type PredictionListStatus = AdminPredictionControllerListV1StatusEnum;

/** One tab of the prediction list, paged as it scrolls (`useInfiniteByStatus`). */
export const useInfinitePredictions = (
  statuses: readonly PredictionListStatus[] | "all",
  limit = 20,
) => {
  const { query, items, total } = useInfiniteByStatus(
    GAMES_QUERY_KEYS.predictions({ statuses, limit, infinite: true }),
    statuses,
    limit,
    async (params: { page: number; limit: number; status?: PredictionListStatus }) =>
      (await adminGamesApi.adminPredictionControllerListV1(params))?.data,
  );

  return { predictionsQuery: query, predictions: items, total };
};

/** `GET /admin/predictions/:id` — the prediction with its options. */
export const usePrediction = (id?: string) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.prediction(id ?? ""),
    queryFn: () => adminGamesApi.adminPredictionControllerGetV1({ id: id ?? "" }),
    enabled: !!id,
    staleTime: 0,
  });

  return { predictionQuery: query, prediction: query?.data?.data };
};

/**
 * `GET /admin/predictions/:id/entries` — a prediction's results, paged as the table scrolls: one row
 * per entry (filter by `correct` / `incorrect` / `pending`), plus `summary` totals and the pick
 * breakdown for the whole prediction (unaffected by the filter), read from the first page.
 * `limit: 1` fetches just the summary.
 */
export const usePredictionEntries = (
  id?: string,
  result?: AdminPredictionControllerEntriesV1ResultEnum,
  limit = 20,
) => {
  const query = useInfiniteQuery({
    queryKey: GAMES_QUERY_KEYS.predictionEntries(id ?? "", { result, limit }),
    queryFn: async ({ pageParam }) =>
      (
        await adminGamesApi.adminPredictionControllerEntriesV1({
          id: id ?? "",
          page: pageParam,
          limit,
          ...(result ? { result } : {}),
        })
      )?.data,
    initialPageParam: 1,
    getNextPageParam: (last, _all, page) =>
      page < (last?.pagination?.totalPages ?? 0) ? page + 1 : undefined,
    enabled: !!id,
    staleTime: 0,
  });

  const pages = query?.data?.pages ?? [];
  return {
    entriesQuery: query,
    entries: pages.flatMap((p) => p?.items ?? []),
    summary: pages[0]?.summary,
  };
};

/**
 * `POST /admin/predictions` then `POST /:id/publish`, as for quests: the backend creates every
 * prediction as a draft, and the form has no draft step. Publish opens it when its start has passed
 * (Publish now), schedules it otherwise. If publish fails the prediction stays a draft, and the
 * error says so.
 */
export const useCreatePrediction = () => {
  const invalidate = useInvalidatePredictions();
  const mutation = useMutation({
    mutationFn: async (createPredictionDto: CreatePredictionDto) => {
      const created = (
        await adminGamesApi.adminPredictionControllerCreateV1({ createPredictionDto })
      )?.data;
      if (!created?.id) throw new Error("The prediction wasn't created");
      try {
        await adminGamesApi.adminPredictionControllerPublishV1({ id: created.id });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "unknown error";
        throw new Error(`Saved as a draft, but couldn't publish it: ${reason}`);
      }
      return created;
    },
    // refresh on failure too: a failed publish still left a draft behind
    onSettled: () => invalidate.lists(),
  });

  return { createPredictionMutation: mutation };
};

/**
 * `PATCH /admin/predictions/:id` — send only the changed fields: the backend rejects any field its
 * status locks when it is present, changed or not (`409 INSTANCE_LOCKED_FIELD`).
 */
export const useUpdatePrediction = () => {
  const invalidate = useInvalidatePredictions();
  const mutation = useMutation({
    mutationFn: async ({ id, dto }: { id: string; dto: UpdatePredictionDto }) =>
      (await adminGamesApi.adminPredictionControllerUpdateV1({ id, updatePredictionDto: dto }))
        ?.data,
    onSuccess: (_data, { id }) => Promise.all([invalidate.lists(), invalidate.detail(id)]),
  });

  return { updatePredictionMutation: mutation };
};

export type PredictionAction = "publish" | "void" | "reverse" | "delete";

// Each action answers with its own shape; callers only need success or the backend's error.
const runPredictionAction = (id: string, action: PredictionAction): Promise<unknown> => {
  switch (action) {
    case "publish":
      return adminGamesApi.adminPredictionControllerPublishV1({ id });
    case "void":
      return adminGamesApi.adminPredictionControllerVoidPredictionV1({ id });
    case "reverse":
      return adminGamesApi.adminPredictionControllerReverseResolutionV1({ id });
    case "delete":
      return adminGamesApi.adminPredictionControllerRemoveV1({ id });
  }
};

/** `POST /admin/predictions/:id/{publish,void,reverse-resolution}` and `DELETE /:id`. */
export const usePredictionAction = () => {
  const invalidate = useInvalidatePredictions();
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: PredictionAction }) =>
      runPredictionAction(id, action),
    onSuccess: (_data, { id }) =>
      Promise.all([invalidate.lists(), invalidate.detail(id), invalidate.entries(id)]),
  });

  return { predictionActionMutation: mutation };
};

/** `POST /admin/predictions/:id/resolve` — step 1: preview the payout, returns a `previewToken`. */
export const usePreviewResolvePrediction = () => {
  const mutation = useMutation({
    mutationFn: async ({ id, correctOptionId }: { id: string; correctOptionId: string }) =>
      (
        await adminGamesApi.adminPredictionControllerPreviewResolveV1({
          id,
          resolvePredictionDto: { correctOptionId },
        })
      )?.data,
  });

  return { previewResolveMutation: mutation };
};

/**
 * `POST /admin/predictions/:id/resolve/confirm` — step 2: pay the winners. Fails (409) while the
 * prediction's resolve hold hasn't elapsed or once the preview expired, and (403) when a payout over
 * the engine's multiplier limit is confirmed by the admin who previewed it.
 */
export const useConfirmResolvePrediction = () => {
  const invalidate = useInvalidatePredictions();
  const mutation = useMutation({
    mutationFn: async ({ id, previewToken }: { id: string; previewToken: string }) =>
      (
        await adminGamesApi.adminPredictionControllerConfirmResolveV1({
          id,
          confirmResolveDto: { previewToken },
        })
      )?.data,
    onSuccess: (_data, { id }) =>
      Promise.all([invalidate.lists(), invalidate.detail(id), invalidate.entries(id)]),
  });

  return { confirmResolveMutation: mutation };
};

// ─── Reward rules ────────────────────────────────────────────────────────────

/** `GET /admin/rewards/rules/:ruleKey` — a game's on/off switch and config. */
export const useGameRewardRule = (ruleKey: string) => {
  const query = useQuery({
    queryKey: GAMES_QUERY_KEYS.rule(ruleKey),
    queryFn: () => adminTokenomicsApi.adminRewardRuleControllerGetV1({ ruleKey }),
    staleTime: 0,
  });

  return { ruleQuery: query, rule: query?.data?.data };
};

/**
 * `PATCH /admin/rewards/rules/:ruleKey` — saves a new rule version, effective now. The backend
 * replaces `config` wholesale, so `dto.config` must be the whole config (merge your edits into the
 * current one), or keys the screen doesn't show are wiped (spec-12 §10.9).
 */
export const useUpdateGameRewardRule = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: async ({ ruleKey, dto }: { ruleKey: string; dto: UpdateRewardRuleDto }) =>
      (
        await adminTokenomicsApi.adminRewardRuleControllerUpdateV1({
          ruleKey,
          updateRewardRuleDto: dto,
        })
      )?.data,
    // refetch on failure too: the backend's audit write can fail (500) after the new version is
    // already saved (spec-12 §10.9), so the card should show what was stored
    onSettled: (_data, _error, { ruleKey }) =>
      queryClient.invalidateQueries({ queryKey: GAMES_QUERY_KEYS.rule(ruleKey) }),
  });

  return { updateRuleMutation: mutation };
};
