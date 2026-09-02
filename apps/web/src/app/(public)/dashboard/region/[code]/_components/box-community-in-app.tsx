"use client";

import { CommunityInApp } from "../../../_components/community-section";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxCommunityInApp({ analytics }: { analytics: RegionAnalytics }) {
  return (
    <RegionBox
      id="community-in-app"
      number={5}
      title="Community Analytics — In-App"
      subtitle="Comments, replies, reactions, and in-app sharing — our own data">
      <CommunityInApp data={analytics.community} />
    </RegionBox>
  );
}
