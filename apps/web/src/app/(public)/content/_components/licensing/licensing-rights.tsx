"use client";

import { Scale } from "lucide-react";

import { useLicenseSummary } from "@/app/_libs/hooks/api/use-admin-content";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { SectionHeading } from "@/components/custom/section-heading";
import { StatTile } from "@/components/custom/stat-tile";

import { LICENSING_COPY, LICENSING_TILE_COUNT, buildLicensingTiles } from "./licensing-config";
import { LicensingTable } from "./licensing-table";

/**
 * Licensing & Rights: summary tiles (`GET /admin/content/licenses/summary`, the same query as the
 * summary card) over the agreements table. Library-wide — the endpoints take no region.
 */
export function LicensingRights() {
  const { licenseSummaryQuery, licenseSummary } = useLicenseSummary();

  const renderTiles = () => {
    if (licenseSummaryQuery?.isError) {
      return (
        <CustomRetryState
          title={LICENSING_COPY.loadError}
          description={licenseSummaryQuery?.error?.message || LICENSING_COPY.loadErrorFallback}
          onRetry={() => licenseSummaryQuery?.refetch()}
          isRetrying={licenseSummaryQuery?.isRefetching}
        />
      );
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {licenseSummary
          ? buildLicensingTiles(licenseSummary)?.map((tile) => (
              <StatTile key={tile?.label} {...tile} />
            ))
          : Array.from({ length: LICENSING_TILE_COUNT }, (_, i) => (
              <div key={i} className="bg-muted/20 h-44 animate-pulse rounded-xl" />
            ))}
      </div>
    );
  };

  return (
    <section className="space-y-3">
      <SectionHeading
        title={LICENSING_COPY.title}
        subtitle={LICENSING_COPY.subtitle}
        icon={Scale}
      />
      {renderTiles()}
      <LicensingTable />
    </section>
  );
}
