"use client";

import { AlertTriangle, Coins, Gauge } from "lucide-react";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";

import { DashboardCard } from "../../../_components/dashboard-card";
import { PointsEconomyChart } from "../../../_components/points-economy-chart";
import { PointsEconomySection } from "../../../_components/points-economy-section";
import { RedemptionRateTrend } from "../../../_components/redemption-rate-trend";
import { fmtCount, type RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxGamificationEconomy({ analytics }: { analytics: RegionAnalytics }) {
  const g = analytics.gamification;
  const healthy = g.redemptionPct >= 40;
  // Economy Status health row (from the old Gamification tab) tops the box.
  const economyStatus: HealthStat[] = [
    {
      label: "Economy Status",
      value: healthy ? "Healthy" : "Watch",
      insight: healthy ? "balanced mint vs redeem" : "redemption under 40% target",
      tone: healthy ? "good" : "warning",
      icon: Gauge,
    },
    {
      label: "Redemption Rate",
      value: `${g.redemptionPct}%`,
      insight: healthy ? "above 40% target" : "below 40% target",
      trend: "up",
      tone: healthy ? "good" : "warning",
      icon: Coins,
    },
    {
      label: "Points Outstanding",
      value: fmtCount(g.pointsOutstanding),
      insight: "hoarding within range",
      tone: "neutral",
      icon: Coins,
    },
    {
      label: "Inflation Risk",
      value: healthy ? "Low" : "Medium",
      insight: "mint tracking redemption",
      tone: healthy ? "good" : "warning",
      icon: AlertTriangle,
    },
  ];

  return (
    <RegionBox
      id="gamification"
      number={2}
      title="Gamification & Points Economy"
      subtitle="Which actions drive engagement vs inflate balances — earn, spend, streaks, leaderboard">
      <AdminHealthSummary stats={economyStatus} />
      <PointsEconomySection data={g} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Points Economy Trend" icon={Coins} iconColor="text-featured">
          <PointsEconomyChart data={g.economyTrend} />
        </DashboardCard>
        <DashboardCard title="Points Redemption Rate" icon={Coins} iconColor="text-success">
          <RedemptionRateTrend data={g.redemptionTrend} />
        </DashboardCard>
      </div>
    </RegionBox>
  );
}
