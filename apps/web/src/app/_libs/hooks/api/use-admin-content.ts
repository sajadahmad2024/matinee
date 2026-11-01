"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useIsFetching,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AdminContentControllerListV1Request,
  AdminContentInsightsControllerLicensesV1Request,
  AdminContentInsightsControllerRecommendedActionsV1RegionEnum,
  AdminContentInsightsControllerStatsV1RegionEnum,
  BoostContentDto,
  CreateContentDto,
  LicenseDto,
  SetRegionsDto,
  SponsorshipDto,
  UpdateContentDto,
} from "@/app/_libs/api/generated";
import { adminContentApi } from "@/app/_libs/api/sdk/admin-content-api";
import { getNextPageParam } from "@/app/_libs/query/pagination";
import { CONTENT_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type {
  AdminContentControllerListV1Request,
  BoostContentDto,
  ContentFullDto,
  ContentResponseDto,
  ContentStatsDto,
  LicenseAgreementDto,
  LicenseSummaryDto,
  RecommendedActionDto,
  CreateContentDto,
  LicenseDto,
  SetRegionsDto,
  SponsorshipDto,
  UpdateContentDto,
} from "@/app/_libs/api/generated";
export {
  CreateContentDtoAccessTierEnum as ContentAccessTierEnum,
  CreateContentDtoContentTypeEnum as ContentTypeEnum,
  CreateContentDtoRecommendationEnum as ContentRecommendationEnum,
  CreateContentDtoRightsRegionEnum as ContentRightsRegionEnum,
  WatchLinkInputDtoPlatformEnum as WatchPlatformEnum,
  LicenseDtoRenewalStatusEnum as LicenseRenewalStatusEnum,
  AdminContentControllerListV1RegionEnum as ContentListRegionEnum,
  AdminContentControllerListV1SortEnum as ContentListSortEnum,
} from "@/app/_libs/api/generated";

export const useAdminContentList = (
  params: AdminContentControllerListV1Request = {},
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.list(params),
    queryFn: () => adminContentApi.adminContentControllerListV1(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
    enabled,
  });

  return {
    contentListQuery: query,
    contents: query?.data?.data?.items ?? [],
    total: query?.data?.data?.pagination?.totalCount ?? 0,
    totalPages: query?.data?.data?.pagination?.totalPages ?? 0,
  };
};

/**
 * Tab counts, summary cards and inventory tiles (`GET /stats`), optionally region-scoped. Lives under
 * the content key, so every workflow write refreshes the counts too. Never fresh (like the list),
 * so other admins' changes show up on the next refetch — including on returning to the browser tab.
 */
export const useContentStats = (region?: AdminContentInsightsControllerStatsV1RegionEnum) => {
  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.stats(region),
    queryFn: () => adminContentApi.adminContentInsightsControllerStatsV1({ region }),
    placeholderData: keepPreviousData,
    staleTime: 0,
    refetchOnWindowFocus: true,
  });

  return { contentStatsQuery: query, contentStats: query?.data?.data };
};

/**
 * The Recommended Actions panel (`GET /recommended-actions`), optionally region-scoped: one item per
 * rule that matched (pending review, licences expiring, rejected follow-up), copy included.
 */
export const useRecommendedActions = (
  region?: AdminContentInsightsControllerRecommendedActionsV1RegionEnum,
) => {
  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.recommendedActions(region),
    queryFn: () => adminContentApi.adminContentInsightsControllerRecommendedActionsV1({ region }),
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  return { recommendedActionsQuery: query, recommendedActions: query?.data?.data ?? [] };
};

/** Licensing & Rights rollup (`GET /licenses/summary`): counts, cost, cost per stream, expiry windows. */
export const useLicenseSummary = () => {
  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.licenseSummary(),
    queryFn: () => adminContentApi.adminContentInsightsControllerLicenseSummaryV1(),
    staleTime: 0,
  });

  return { licenseSummaryQuery: query, licenseSummary: query?.data?.data };
};

/**
 * Licence agreements (`GET /licenses`): search (title / licensor), expiry window, renewal status,
 * sort. Paged — `licenses` grows as `fetchNextPage` loads the next page; `page` is the query's own.
 */
export const useLicenses = (
  params: Omit<AdminContentInsightsControllerLicensesV1Request, "page"> = {},
) => {
  const query = useInfiniteQuery({
    queryKey: CONTENT_QUERY_KEYS.licenses(params),
    queryFn: ({ pageParam }) =>
      adminContentApi.adminContentInsightsControllerLicensesV1({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam,
    placeholderData: keepPreviousData,
    staleTime: 0,
  });

  return {
    licensesQuery: query,
    licenses: query?.data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    total: query?.data?.pages?.[0]?.data?.pagination?.totalCount ?? 0,
  };
};

/**
 * `GET /admin/content/:id` for a handful of ids (e.g. a quest's curated videos), one cached query
 * each. `contents` keeps the ids' order and skips ids that failed or are still loading.
 */
export const useContentByIds = (ids: string[]) =>
  useQueries({
    queries:
      ids?.map((id) => ({
        queryKey: CONTENT_QUERY_KEYS.detail(id),
        queryFn: () => adminContentApi.adminContentControllerGetV1({ id }),
      })) ?? [],
    combine: (results) => ({
      contents: results?.flatMap((r) => (r?.data?.data ? [r.data.data] : [])) ?? [],
      isPending: results?.some((r) => r?.isPending) ?? false,
      failedCount: results?.filter((r) => r?.isError).length ?? 0,
    }),
  });

/** Editor bundle — content plus its licence, sponsorship and regions (`GET /:id/full`). */
export const useContentFull = (id: string) => {
  const query = useQuery({
    queryKey: CONTENT_QUERY_KEYS.full(id),
    queryFn: () => adminContentApi.adminContentControllerFullV1({ id }),
    enabled: !!id,
  });

  return { contentFullQuery: query, contentFull: query?.data?.data };
};

/** Every workflow write changes the list, tab counts and stats — refresh the whole domain. */
const useInvalidateContent = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.all });
};

/** Manual refresh: refetches the content on screen (list + tab counts); spins while any loads. */
export const useRefreshContent = () => {
  const refresh = useInvalidateContent();
  const isRefreshing = useIsFetching({ queryKey: CONTENT_QUERY_KEYS.all }) > 0;
  return { refresh, isRefreshing };
};

/** Manual refresh of the Licensing & Rights section only: every agreements filter + the summary tiles. */
export const useRefreshLicenses = () => {
  const queryClient = useQueryClient();
  const licensesKey = [...CONTENT_QUERY_KEYS.all, "licenses"] as const;
  const summaryKey = CONTENT_QUERY_KEYS.licenseSummary();
  const refresh = () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: licensesKey }),
      queryClient.invalidateQueries({ queryKey: summaryKey }),
    ]);
  const isRefreshing =
    useIsFetching({ queryKey: licensesKey }) + useIsFetching({ queryKey: summaryKey }) > 0;
  return { refresh, isRefreshing };
};

/** Creates content as a **draft**. Submit / schedule / publish are follow-up calls. */
export const useCreateContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (createContentDto: CreateContentDto) =>
      adminContentApi.adminContentControllerCreateV1({ createContentDto }),
    onSuccess: invalidate,
  });

  return { createContentMutation: mutation };
};

/** Partial update. List fields (genres, tags, cast, watch links) replace when present. */
export const useUpdateContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, updateContentDto }: { id: string; updateContentDto: UpdateContentDto }) =>
      adminContentApi.adminContentControllerUpdateV1({ id, updateContentDto }),
    onSuccess: invalidate,
  });

  return { updateContentMutation: mutation };
};

/** draft → pending_approval. */
export const useSubmitContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentApi.adminContentControllerSubmitV1({ id }),
    onSuccess: invalidate,
  });

  return { submitContentMutation: mutation };
};

/** Approve & schedule (`content:publish`). `scheduledAt` is ISO and must be in the future. */
export const useScheduleContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, scheduledAt }: { id: string; scheduledAt: string }) =>
      adminContentApi.adminContentControllerScheduleV1({
        id,
        scheduleContentDto: { scheduledAt },
      }),
    onSuccess: invalidate,
  });

  return { scheduleContentMutation: mutation };
};

/** Approve & publish now (`content:publish`). */
export const usePublishContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentApi.adminContentControllerPublishV1({ id }),
    onSuccess: invalidate,
  });

  return { publishContentMutation: mutation };
};

/**
 * Boost a video in the feed (window + channels), or clear it with `{ boosted: false }`
 * (`content:write`).
 */
export const useBoostContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, boostContentDto }: { id: string; boostContentDto: BoostContentDto }) =>
      adminContentApi.adminContentControllerBoostV1({ id, boostContentDto }),
    onSuccess: invalidate,
  });

  return { boostContentMutation: mutation };
};

/** Cancel a scheduled go-live (`content:publish`) — scheduled → pending_approval. */
export const useUnscheduleContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentApi.adminContentControllerUnscheduleV1({ id }),
    onSuccess: invalidate,
  });

  return { unscheduleContentMutation: mutation };
};

/** Reject a submission (`content:publish`). `reason` is 3–500 characters. */
export const useRejectContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adminContentApi.adminContentControllerRejectV1({ id, rejectContentDto: { reason } }),
    onSuccess: invalidate,
  });

  return { rejectContentMutation: mutation };
};

/** Archive / unpublish. */
export const useArchiveContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      adminContentApi.adminContentControllerArchiveV1({
        id,
        archiveContentDto: { archived: true },
      }),
    onSuccess: invalidate,
  });

  return { archiveContentMutation: mutation };
};

/**
 * Restore out of the archive (`archived: false`): back to published when the video was live
 * before, else to draft (it goes through review again).
 */
export const useRestoreContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      adminContentApi.adminContentControllerArchiveV1({
        id,
        archiveContentDto: { archived: false },
      }),
    onSuccess: invalidate,
  });

  return { restoreContentMutation: mutation };
};

/** Soft-delete. */
export const useDeleteContent = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentApi.adminContentControllerRemoveV1({ id }),
    onSuccess: invalidate,
  });

  return { deleteContentMutation: mutation };
};

// ─── Licence ─────────────────────────────────────────────────────────────────

/** Set / renew the licence (the content becomes "licensed"). */
export const useSetContentLicense = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, licenseDto }: { id: string; licenseDto: LicenseDto }) =>
      adminContentApi.adminContentExtrasControllerSetLicenseV1({ id, licenseDto }),
    onSuccess: invalidate,
  });

  return { setContentLicenseMutation: mutation };
};

/** Remove the licence — the content is "original" again. */
export const useRemoveContentLicense = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentApi.adminContentExtrasControllerRemoveLicenseV1({ id }),
    onSuccess: invalidate,
  });

  return { removeContentLicenseMutation: mutation };
};

// ─── Publish regions ─────────────────────────────────────────────────────────

/** Replace the publish regions; `offRegions` are selected but switched Off. */
export const useSetContentRegions = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, setRegionsDto }: { id: string; setRegionsDto: SetRegionsDto }) =>
      adminContentApi.adminContentExtrasControllerSetRegionsV1({ id, setRegionsDto }),
    onSuccess: invalidate,
  });

  return { setContentRegionsMutation: mutation };
};

// ─── Sponsorship ─────────────────────────────────────────────────────────────

/** Set the sponsorship — replaces the active one. */
export const useSetContentSponsorship = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: ({ id, sponsorshipDto }: { id: string; sponsorshipDto: SponsorshipDto }) =>
      adminContentApi.adminContentExtrasControllerSetSponsorshipV1({ id, sponsorshipDto }),
    onSuccess: invalidate,
  });

  return { setContentSponsorshipMutation: mutation };
};

/** Remove the sponsorship — the content is organic again. */
export const useRemoveContentSponsorship = () => {
  const invalidate = useInvalidateContent();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      adminContentApi.adminContentExtrasControllerRemoveSponsorshipV1({ id }),
    onSuccess: invalidate,
  });

  return { removeContentSponsorshipMutation: mutation };
};
