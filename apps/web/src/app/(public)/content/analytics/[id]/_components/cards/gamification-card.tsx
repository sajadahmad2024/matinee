import { Coins, Trophy } from "lucide-react";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { formatPct } from "../../../../_components/performance/performance-config";
import { EMPTY } from "../../../../_shared/content-format";
import { questCompletionRate } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";

/** Linked games: participation and completion rates, and the points they paid out. */
export function GamificationCard({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const games = analytics?.games;

  return (
    <AnalyticsCard
      title="Gamification Performance"
      icon={Trophy}
      tone="text-warning"
      contentClassName="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <p className="font-gaming text-foreground text-2xl font-bold">
            {analytics ? formatPct(games?.participationPct) : EMPTY}
          </p>
          <p className="text-foreground-secondary text-xs">Participation Rate</p>
        </div>
        <div className="bg-background-tertiary rounded-lg p-3 text-center">
          <p className="font-gaming text-foreground text-2xl font-bold">
            {analytics ? questCompletionRate(analytics) : EMPTY}
          </p>
          <p className="text-foreground-secondary text-xs">Completion Rate</p>
        </div>
      </div>
      <div className="from-accent/20 to-accent/5 border-accent/20 rounded-lg border bg-gradient-to-br p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-foreground flex items-center gap-2 text-sm font-medium">
            <Coins className="text-warning h-4 w-4" />
            Points Distributed
          </span>
          <span className="font-gaming text-foreground text-lg font-bold">
            {analytics ? (games?.pointsDistributed ?? 0)?.toLocaleString() : EMPTY}
          </span>
        </div>
      </div>
    </AnalyticsCard>
  );
}
