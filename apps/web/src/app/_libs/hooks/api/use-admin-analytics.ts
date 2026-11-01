"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";

import type {
  AdminAnalyticsControllerContentLibraryV1Request,
  AdminAnalyticsControllerContentV1Request,
} from "@/app/_libs/api/generated";
import { adminAnalyticsApi } from "@/app/_libs/api/sdk/admin-analytics-api";
import { ANALYTICS_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type {
  ContentAnalyticsDto,
  ContentLibraryAnalyticsDto,
  RealtimeAnalyticsDto,
} from "@/app/_libs/api/generated";

/**
 * Catalog-wide content analytics for a window (`GET /admin/analytics/content-library`): totals,
 * per-region, hit rate, funnel, revenue, BTS, sentiment, top content. The window defaults to the
 * last 30 days.
 */
export const useContentLibraryAnalytics = (
  params: AdminAnalyticsControllerContentLibraryV1Request = {},
) => {
  const query = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.contentLibrary(params),
    queryFn: () => adminAnalyticsApi.adminAnalyticsControllerContentLibraryV1(params),
    placeholderData: keepPreviousData,
  });

  return { contentLibraryQuery: query, contentLibrary: query?.data?.data };
};

/** How often the realtime pulse refreshes while it's on screen. */
const REALTIME_REFRESH_MS = 120_000;

/**
 * Realtime pulse (`GET /admin/analytics/realtime`): live viewers, views in the last hour, signups
 * and points today. Refreshes every 2 min while mounted. Needs `users:read`; library-wide.
 */
export const useRealtimeAnalytics = (region?: string) => {
  const query = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.realtime(region),
    queryFn: () => adminAnalyticsApi.adminAnalyticsControllerRealtimeV1({ region }),
    refetchInterval: REALTIME_REFRESH_MS,
    staleTime: 0,
  });

  return { realtimeQuery: query, realtime: query?.data?.data };
};

/**
 * One video's analytics (`GET /admin/analytics/content/:id`) for a window (default: last 30 days):
 * lifetime counters, windowed views / watch time + change vs the previous window, retention,
 * traffic sources, demographics, geo, linked games and BTS.
 */
export const useContentAnalytics = (
  id: string,
  window: Omit<AdminAnalyticsControllerContentV1Request, "id"> = {},
) => {
  const query = useQuery({
    queryKey: ANALYTICS_QUERY_KEYS.content(id, window),
    queryFn: () => adminAnalyticsApi.adminAnalyticsControllerContentV1({ id, ...window }),
    placeholderData: keepPreviousData,
    enabled: !!id,
  });

  return { contentAnalyticsQuery: query, contentAnalytics: query?.data?.data };
};
