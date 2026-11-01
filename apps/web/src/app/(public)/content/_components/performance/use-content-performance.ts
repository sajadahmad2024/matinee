"use client";

import { useState } from "react";

import { startOfHour, subDays } from "date-fns";

import { useContentLibraryAnalytics } from "@/app/_libs/hooks/api/use-admin-analytics";
import { ALL_REGIONS } from "@/app/_libs/regions";

import type { ContentRegionKey } from "../../_shared/content-types";
import { PERFORMANCE_WINDOW_DAYS } from "./performance-config";

/**
 * The last 30 days, ending at the start of this hour — so every component that asks within the
 * same hour shares one cache entry.
 */
const performanceWindow = () => {
  const to = startOfHour(new Date());
  return { from: subDays(to, PERFORMANCE_WINDOW_DAYS).toISOString(), to: to.toISOString() };
};

/**
 * Library-wide content analytics for the Performance section and its summary card
 * (`GET /admin/analytics/content-library`). One call: the response's `previous` carries the
 * equal-length window before it for the trend %s. Region-scoped like the rest of the page.
 */
export function useContentPerformance(region: ContentRegionKey) {
  const [range] = useState(performanceWindow);

  const { contentLibraryQuery, contentLibrary } = useContentLibraryAnalytics({
    ...range,
    region: region === ALL_REGIONS ? undefined : region,
  });

  return { performanceQuery: contentLibraryQuery, performance: contentLibrary };
}
