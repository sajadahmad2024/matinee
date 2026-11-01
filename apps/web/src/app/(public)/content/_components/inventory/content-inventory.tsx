"use client";

import { Library } from "lucide-react";

import { useContentStats } from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { SectionHeading } from "@/components/custom/section-heading";
import { StatTile } from "@/components/custom/stat-tile";

import { type ContentRegionKey } from "../../_shared/content-types";
import { INVENTORY_COPY, INVENTORY_TILE_COUNT, buildInventoryTiles } from "./inventory-config";

interface ContentInventoryProps {
  region: ContentRegionKey;
  /** Region display name, appended to the heading when scoped. */
  regionLabel?: string;
}

/**
 * The library right now (`GET /admin/content/stats`, region-scoped — the same query as the tab
 * badges). The tiles themselves are built in `inventory-config.ts`.
 */
export function ContentInventory({ region, regionLabel }: ContentInventoryProps) {
  const { contentStatsQuery, contentStats } = useContentStats(
    region === ALL_REGIONS ? undefined : region,
  );

  const renderTiles = () => {
    if (contentStatsQuery?.isError) {
      return (
        <CustomRetryState
          title={INVENTORY_COPY.loadError}
          description={contentStatsQuery?.error?.message || INVENTORY_COPY.loadErrorFallback}
          onRetry={() => contentStatsQuery?.refetch()}
          isRetrying={contentStatsQuery?.isRefetching}
        />
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {contentStats
          ? buildInventoryTiles(contentStats)?.map((tile) => (
              <StatTile key={tile?.label} {...tile} />
            ))
          : Array.from({ length: INVENTORY_TILE_COUNT }, (_, i) => (
              <div key={i} className="bg-muted/20 h-44 animate-pulse rounded-xl" />
            ))}
      </div>
    );
  };

  return (
    <section className="space-y-3">
      <SectionHeading
        title={regionLabel ? `${INVENTORY_COPY.title} — ${regionLabel}` : INVENTORY_COPY.title}
        subtitle={INVENTORY_COPY.subtitle}
        icon={Library}
      />
      {renderTiles()}
    </section>
  );
}
