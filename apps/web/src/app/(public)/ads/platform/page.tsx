import { Suspense } from "react";

import { PageHeader } from "@/components/custom/page-header";

import { PlatformStatsSkeleton } from "../_components/ad-skeletons";
import { AD_ROUTES } from "../_libs/ad-config";
import { PlatformStats } from "./_components/platform-stats";

/** Platform-level ads (spec-09): analytics across every feed ad. */
export default function PlatformAdsPage() {
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <PageHeader
        title="Platform Ads"
        subtitle="Performance across every feed ad"
        backHref={AD_ROUTES.LIST}
        backLabel="Back to Ads"
      />
      <Suspense fallback={<PlatformStatsSkeleton />}>
        <PlatformStats />
      </Suspense>
    </div>
  );
}
