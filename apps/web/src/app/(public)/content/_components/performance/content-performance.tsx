"use client";

import { Activity } from "lucide-react";

import { useRealtimeAnalytics } from "@/app/_libs/hooks/api/use-admin-analytics";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { SectionHeading } from "@/components/custom/section-heading";
import { StatTile } from "@/components/custom/stat-tile";

import type { ContentRegionKey } from "../../_shared/content-types";
import {
  PERFORMANCE_COPY,
  PERFORMANCE_TILE_COUNT,
  buildPerformanceTiles,
} from "./performance-config";
import { useContentPerformance } from "./use-content-performance";

/**
 * Headline performance tiles for the last 30 days (`GET /admin/analytics/content-library`), each
 * with its change vs the 30 days before, plus the live "watching now" count.
 */
export function ContentPerformance({ region }: { region: ContentRegionKey }) {
  const { performanceQuery, performance } = useContentPerformance(region);
  // Needs `users:read` — the badge simply doesn't show without it. Scoped by viewer region.
  const { realtime } = useRealtimeAnalytics(region === ALL_REGIONS ? undefined : region);

  const renderTiles = () => {
    if (performanceQuery?.isError) {
      return (
        <CustomRetryState
          title={PERFORMANCE_COPY.loadError}
          description={performanceQuery?.error?.message || PERFORMANCE_COPY.loadErrorFallback}
          onRetry={() => performanceQuery?.refetch()}
          isRetrying={performanceQuery?.isRefetching}
        />
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {performance
          ? buildPerformanceTiles(performance)?.map((tile) => (
              <StatTile key={tile?.label} {...tile} />
            ))
          : Array.from({ length: PERFORMANCE_TILE_COUNT }, (_, i) => (
              <div key={i} className="bg-muted/20 h-44 animate-pulse rounded-xl" />
            ))}
      </div>
    );
  };

  return (
    <section className="space-y-3">
      <SectionHeading
        title={PERFORMANCE_COPY.title}
        subtitle={PERFORMANCE_COPY.subtitle}
        icon={Activity}
        action={
          realtime ? (
            <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <span className="bg-success h-2 w-2 animate-pulse rounded-full" />
              {PERFORMANCE_COPY.watchingNow(realtime?.liveViewers ?? 0)}
            </span>
          ) : undefined
        }
      />
      {renderTiles()}
    </section>
  );
}
