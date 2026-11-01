import { Film } from "lucide-react";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { EMPTY } from "../../../../_shared/content-format";
import { btsTotalViews, formatSignedPct, pointsChange } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";

/**
 * Behind-the-scenes upsell: click-through to the title's BTS videos, their views, and the
 * click-through change in percentage points (shown only when the title has BTS videos).
 */
export function BtsCard({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const bts = analytics?.bts;
  const change = bts?.children?.length
    ? pointsChange((bts?.ctr ?? 0) * 100, (bts?.prevCtr ?? 0) * 100)
    : undefined;

  return (
    <AnalyticsCard
      title="Behind the Scenes Performance"
      icon={Film}
      tone="text-featured"
      contentClassName="space-y-4">
      <div className="border-featured/20 bg-featured/10 flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="text-foreground-secondary text-sm">BTS Click-Through</p>
          <p className="font-gaming text-foreground text-3xl font-bold">
            {analytics ? `${Math.round((bts?.ctr ?? 0) * 1000) / 10}%` : EMPTY}
          </p>
        </div>
        <div className="text-right">
          <p className="text-foreground-secondary text-sm">Total BTS Views</p>
          <p className="font-gaming text-foreground text-3xl font-bold">
            {analytics ? btsTotalViews(analytics) : EMPTY}
          </p>
        </div>
      </div>
      {change != null && (
        <p className="text-foreground-secondary text-sm">
          <span className={`font-medium ${change >= 0 ? "text-success" : "text-destructive"}`}>
            {formatSignedPct(change)}
          </span>{" "}
          click-through vs. the previous period
        </p>
      )}
    </AnalyticsCard>
  );
}
