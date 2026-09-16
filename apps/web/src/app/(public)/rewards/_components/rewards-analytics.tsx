"use client";

import { Award, Coins, Gavel, Gift, Scale } from "lucide-react";

import type { MacroRegion } from "@/app/_libs/regions";
import { StatTile } from "@/components/custom/stat-tile";

import { formatPoints, rewardsAnalyticsForRegion } from "../constants";

interface RewardsAnalyticsProps {
  region: "global" | MacroRegion;
}

// ⚠️ Metric choice is a GeekyAnts proposal pending client sign-off (same as gaming's boxes).
export function RewardsAnalytics({ region }: RewardsAnalyticsProps) {
  const a = rewardsAnalyticsForRegion(region);

  // Where redeemed points came from — bought in-app vs earned through play.
  const sourceTotal = a.pointsPurchased + a.pointsEarned || 1;
  const purchasedPct = Math.round((a.pointsPurchased / sourceTotal) * 100);
  const earnedPct = 100 - purchasedPct;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
        subStats={[{ label: "Total bids this period", value: a.totalBidsPeriod.toLocaleString() }]}
      />
      <StatTile
        label="Purchased vs Earned Points"
        value={`${purchasedPct}% / ${earnedPct}%`}
        icon={Scale}
        accent="primary"
        subStats={[
          {
            label: "Purchased points redeemed",
            value: `${formatPoints(a.pointsPurchased)} pts`,
            accent: "success",
          },
          { label: "Earned points redeemed", value: `${formatPoints(a.pointsEarned)} pts` },
        ]}
      />
      <StatTile
        label="Top Winning Bid"
        value={`${formatPoints(a.topWinningBid)} pts`}
        icon={Award}
        accent="warning"
        subStats={[{ label: "Average winning bid", value: `${formatPoints(a.avgWinningBid)} pts` }]}
      />
    </div>
  );
}
