"use client";

import { Award, Coins, Gavel, Gift } from "lucide-react";

import { StatTile } from "@/components/custom/stat-tile";

import type { MacroRegion } from "@/app/_libs/regions";

import { formatPoints, rewardsAnalyticsForRegion } from "../constants";

interface RewardsAnalyticsProps {
  region: "global" | MacroRegion;
}

// ⚠️ Metric choice is a GeekyAnts proposal pending client sign-off (same as gaming's boxes).
export function RewardsAnalytics({ region }: RewardsAnalyticsProps) {
  const a = rewardsAnalyticsForRegion(region);

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Active Rewards"
        value={a.activeRewards}
        icon={Gift}
        accent="primary"
        subStats={[
          { label: "Bidding live", value: String(a.biddingLive), accent: "success" },
          { label: "Unlock content live", value: String(a.unlockLive), accent: "success" },
          { label: "Scheduled next quarter", value: String(a.scheduledNextQuarter) },
        ]}
      />
      <StatTile
        label="Points Redeemed (period)"
        value={`${formatPoints(a.pointsRedeemed)} pts`}
        icon={Coins}
        accent="accent"
        trend={{ ...a.pointsRedeemedTrend, good: true }}
        subStats={[{ label: "Unlocks + settled auction bids" }]}
      />
      <StatTile
        label="Active Bidders"
        value={a.activeBidders.toLocaleString()}
        icon={Gavel}
        accent="success"
        subStats={[
          { label: "Total bids this period", value: a.totalBidsPeriod.toLocaleString() },
        ]}
      />
      <StatTile
        label="Top Winning Bid"
        value={`${formatPoints(a.topWinningBid)} pts`}
        icon={Award}
        accent="warning"
        subStats={[
          { label: "Average winning bid", value: `${formatPoints(a.avgWinningBid)} pts` },
        ]}
      />
    </div>
  );
}
