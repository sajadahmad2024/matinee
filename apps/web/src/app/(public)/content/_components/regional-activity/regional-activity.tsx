"use client";

import { Suspense } from "react";

import { Globe } from "lucide-react";

import { useContentStats } from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { RegionBoxFilter } from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import type { ContentRegionKey } from "../../_shared/content-types";
import { CONTENT_REGION_OPTIONS, buildContentRegionMetrics } from "./regional-activity-config";

const SKELETON = <div className="bg-muted/10 h-32.5 w-full animate-pulse rounded-lg" />;

/**
 * Regional lens — dashboard activity-map treatment; scopes everything below it. Reads the
 * unscoped stats (`byRegion` ignores `?region=`, and "All" needs the library-wide count) — the
 * same query the page makes with no region picked, so it's usually already cached.
 */
export function RegionalActivity({ region }: { region: ContentRegionKey }) {
  const { contentStats } = useContentStats();

  return (
    <section className="border-border bg-card space-y-3 rounded-xl border p-4">
      <SectionHeading
        title="Regional Activity"
        subtitle="Live videos, views or watch time per region — click a region to scope the library below"
        icon={Globe}
      />
      {contentStats ? (
        <Suspense fallback={SKELETON}>
          <RegionBoxFilter
            active={region}
            options={CONTENT_REGION_OPTIONS}
            allCode={ALL_REGIONS}
            metrics={buildContentRegionMetrics(contentStats)}
          />
        </Suspense>
      ) : (
        SKELETON
      )}
    </section>
  );
}
