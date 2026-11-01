"use client";

import {
  keepPreviousData,
  useIsFetching,
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AdminAdSalesControllerListCampaignsV1Request,
  AdminAdSalesControllerSummaryV1Request,
  CreateAdCampaignDto,
  RankBoardDto,
  SwapRanksDto,
  UpdateAdCampaignDto,
} from "@/app/_libs/api/generated";
import { adminAdSalesApi } from "@/app/_libs/api/sdk/admin-ads-api";
import { ADS_QUERY_KEYS } from "@/app/_libs/query/query-keys";
import type { MacroRegion } from "@/app/_libs/regions";

export type {
  AdminAdSalesControllerListCampaignsV1Request as AdCampaignListParams,
  AdminAdSalesControllerSummaryV1Request as AdSummaryParams,
} from "@/app/_libs/api/generated";

interface AdWindow {
  from: string;
  to: string;
}

/** Every ads write can move ranks, statuses and totals, so it refreshes the whole domain. */
const useInvalidateAds = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ADS_QUERY_KEYS.all });
};

/** Manual refresh of the ads screens (list + summary tiles) — picks up other admins' changes. */
export const useRefreshAds = () => {
  const refresh = useInvalidateAds();
  const isRefreshing = useIsFetching({ queryKey: ADS_QUERY_KEYS.all }) > 0;
  return { refresh, isRefreshing };
};

/** `GET /admin/ads/campaigns` — with `region`, rows come back in feed order with `rank` set. */
export const useAdCampaigns = (
  params: AdminAdSalesControllerListCampaignsV1Request,
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const query = useQuery({
    queryKey: ADS_QUERY_KEYS.campaigns(params),
    queryFn: () => adminAdSalesApi.adminAdSalesControllerListCampaignsV1(params),
    placeholderData: keepPreviousData,
    staleTime: 0,
    enabled,
  });

  return {
    campaignsQuery: query,
    campaigns: query?.data?.data?.items ?? [],
    total: query?.data?.data?.pagination?.totalCount ?? 0,
    totalPages: query?.data?.data?.pagination?.totalPages ?? 0,
  };
};

/** `GET /admin/ads/campaigns/:id` — the ad with lifetime delivery, linked videos and ledger totals. */
export const useAdCampaign = (id?: string) => {
  const query = useQuery({
    queryKey: ADS_QUERY_KEYS.campaign(id ?? ""),
    queryFn: () => adminAdSalesApi.adminAdSalesControllerGetCampaignV1({ id: id ?? "" }),
    enabled: !!id,
    staleTime: 0,
  });

  return { campaignQuery: query, campaign: query?.data?.data };
};

/** `GET /admin/ads/campaigns/:id/performance` — window totals and daily series, lifetime, pacing. */
export const useAdCampaignPerformance = (id: string | undefined, window: AdWindow) => {
  const query = useQuery({
    queryKey: ADS_QUERY_KEYS.performance(id ?? "", window),
    queryFn: () =>
      adminAdSalesApi.adminAdSalesControllerCampaignPerformanceV1({
        id: id ?? "",
        from: window?.from,
        to: window?.to,
      }),
    enabled: !!id,
    placeholderData: keepPreviousData,
  });

  return { performanceQuery: query, performance: query?.data?.data };
};

/** `GET /admin/ads/summary` — revenue, delivery split by commercial / sponsorship, live counts. */
export const useAdSalesSummary = (params: AdminAdSalesControllerSummaryV1Request) => {
  const query = useQuery({
    queryKey: ADS_QUERY_KEYS.summary(params),
    queryFn: () => adminAdSalesApi.adminAdSalesControllerSummaryV1(params),
    placeholderData: keepPreviousData,
  });

  return { summaryQuery: query, summary: query?.data?.data };
};

/**
 * `GET /admin/ads/ranks` for each region over the ad's flight — the form's rank board and
 * next-free-rank prefill. Disabled until the flight is a valid window.
 */
export const useAdRankBoards = (regions: MacroRegion[], window: AdWindow | null) =>
  useQueries({
    queries:
      regions?.map((region) => ({
        queryKey: ADS_QUERY_KEYS.rankBoard({ region, ...window }),
        queryFn: () =>
          adminAdSalesApi.adminAdSalesControllerRankBoardV1({
            region,
            from: window?.from,
            to: window?.to,
          }),
        enabled: !!window,
        placeholderData: keepPreviousData,
      })) ?? [],
    // structurally shared by TanStack: `rankBoards` keeps its identity until a board changes,
    // so effects that depend on it don't re-run on every render
    combine: (results) => {
      const rankBoards: Partial<Record<MacroRegion, RankBoardDto>> = {};
      results?.forEach((result, i) => {
        const region = regions?.[i];
        const board = result?.data?.data;
        if (region && board) rankBoards[region] = board;
      });
      return { rankBoards, isFetching: results?.some((r) => r?.isFetching) ?? false };
    },
  });

/**
 * `POST /admin/ads/campaigns` — books the ranks and returns the ad already `scheduled` or `active`.
 * Resolves with the created ad.
 */
export const useCreateAdCampaign = () => {
  const invalidate = useInvalidateAds();
  const mutation = useMutation({
    mutationFn: async (createAdCampaignDto: CreateAdCampaignDto) =>
      (await adminAdSalesApi.adminAdSalesControllerCreateCampaignV1({ createAdCampaignDto }))?.data,
    onSuccess: () => invalidate(),
  });

  return { createAdCampaignMutation: mutation };
};

/** `PATCH /admin/ads/campaigns/:id` — moves the rank bookings with the flight. */
export const useUpdateAdCampaign = () => {
  const invalidate = useInvalidateAds();
  const mutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateAdCampaignDto }) =>
      adminAdSalesApi.adminAdSalesControllerUpdateCampaignV1({ id, updateAdCampaignDto: dto }),
    onSuccess: () => invalidate(),
  });

  return { updateAdCampaignMutation: mutation };
};

export type AdCampaignAction = "activate" | "pause" | "resume" | "end";

const runAction = (id: string, action: AdCampaignAction) => {
  switch (action) {
    case "activate":
      return adminAdSalesApi.adminAdSalesControllerActivateV1({ id });
    case "pause":
      return adminAdSalesApi.adminAdSalesControllerPauseV1({ id });
    case "resume":
      return adminAdSalesApi.adminAdSalesControllerResumeV1({ id });
    case "end":
      return adminAdSalesApi.adminAdSalesControllerEndV1({ id, campaignEndDto: {} });
  }
};

/** `POST /admin/ads/campaigns/:id/{activate,pause,resume,end}`. */
export const useAdCampaignAction = () => {
  const invalidate = useInvalidateAds();
  const mutation = useMutation({
    mutationFn: ({ id, action }: { id: string; action: AdCampaignAction }) => runAction(id, action),
    onSuccess: () => invalidate(),
  });

  return { adCampaignActionMutation: mutation };
};

/** `POST /admin/ads/ranks/swap` — the backend rejects swaps that would clash with a third ad (409). */
export const useSwapAdRanks = () => {
  const invalidate = useInvalidateAds();
  const mutation = useMutation({
    mutationFn: (swapRanksDto: SwapRanksDto) =>
      adminAdSalesApi.adminAdSalesControllerSwapRanksV1({ swapRanksDto }),
    onSuccess: () => invalidate(),
  });

  return { swapAdRanksMutation: mutation };
};
