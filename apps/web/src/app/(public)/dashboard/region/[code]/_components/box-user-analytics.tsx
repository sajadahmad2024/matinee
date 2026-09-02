"use client";

import { UserAnalyticsSection } from "../../../_components/user-analytics-section";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxUserAnalytics({ analytics }: { analytics: RegionAnalytics }) {
  return (
    <RegionBox
      id="user-analytics"
      number={1}
      title="User Analytics"
      subtitle="Content-quality signals — starts→completes is your single best one">
      <UserAnalyticsSection data={analytics.userAnalytics} />
    </RegionBox>
  );
}
