"use client";

import { CommunityExternal } from "../../../_components/community-section";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxCommunityExternal({ analytics }: { analytics: RegionAnalytics }) {
  return (
    <RegionBox
      id="community-external"
      number={6}
      title="Community Analytics — External"
      subtitle="Social listening & earned media — pending Google Analytics / social integration">
      <CommunityExternal data={analytics.community} />
    </RegionBox>
  );
}
