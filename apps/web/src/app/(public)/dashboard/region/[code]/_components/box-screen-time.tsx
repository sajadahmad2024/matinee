"use client";

import { SessionQualitySection } from "../../../_components/session-quality-section";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxScreenTime({ analytics }: { analytics: RegionAnalytics }) {
  return (
    <RegionBox
      id="screen-time"
      number={3}
      title="Screen Time & Session Quality"
      subtitle="Viewers vs gamified, session length distribution, time-of-day usage, drop-out proxies">
      <SessionQualitySection data={analytics.screenTime} />
    </RegionBox>
  );
}
