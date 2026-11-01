"use client";

import { useContentAnalytics } from "@/app/_libs/hooks/api/use-admin-analytics";
import { useContentFull } from "@/app/_libs/hooks/api/use-admin-content";
import { useAnalyticsDateRange } from "@/components/custom/analytics-date-filter";
import { CustomRetryState } from "@/components/custom/custom-retry-state";

import { BtsCard } from "./cards/bts-card";
import { DemographicsCard } from "./cards/demographics-card";
import { GamificationCard } from "./cards/gamification-card";
import { GeoCard } from "./cards/geo-card";
import { RetentionCard } from "./cards/retention-card";
import { TrafficSourcesCard } from "./cards/traffic-sources-card";
import { KeyMetricsStrip } from "./key-metrics-strip";
import { VideoAnalyticsHeader } from "./video-analytics-header";

/**
 * One video's analytics for the window picked in the date filter
 * (`GET /admin/analytics/content/:id`), plus its title and duration from the shared
 * `useContentFull` query.
 */
export function VideoAnalyticsClient({ id }: { id: string }) {
  const { label: rangeLabel, window: analyticsWindow } = useAnalyticsDateRange();
  const { contentFull } = useContentFull(id);
  const { contentAnalyticsQuery, contentAnalytics: analytics } = useContentAnalytics(
    id,
    analyticsWindow,
  );
  const video = contentFull?.content;

  if (contentAnalyticsQuery?.isError) {
    return (
      <CustomRetryState
        title="Unable to load this video's analytics"
        description={contentAnalyticsQuery?.error?.message || "Please try again."}
        onRetry={() => contentAnalyticsQuery?.refetch()}
        isRetrying={contentAnalyticsQuery?.isRefetching}
      />
    );
  }

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <VideoAnalyticsHeader title={video?.title} rangeLabel={rangeLabel} />
      <KeyMetricsStrip analytics={analytics} />
      <div className="grid gap-6 lg:grid-cols-2">
        <RetentionCard analytics={analytics} durationSeconds={video?.durationSeconds} />
        <TrafficSourcesCard analytics={analytics} />
        <DemographicsCard analytics={analytics} />
        <GeoCard analytics={analytics} />
        <GamificationCard analytics={analytics} />
        <BtsCard analytics={analytics} />
      </div>
    </div>
  );
}
