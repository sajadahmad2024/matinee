"use client";

import { Coins, Gamepad2, LineChart, Repeat, Users } from "lucide-react";

import { StatTile } from "@/components/custom/stat-tile";

import { DashboardCard } from "../../../_components/dashboard-card";
import { GameplayVelocityChart } from "../../../_components/gameplay-velocity-chart";
import { KFactorChart } from "../../../_components/k-factor-chart";
import { RetentionCohortChart } from "../../../_components/retention-cohort-chart";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

const jumpTo = (id: string) =>
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

export function BoxGraphsTrends({ analytics }: { analytics: RegionAnalytics }) {
  const g = analytics.graphs;
  const funnel = analytics.monetization.funnel;
  const redemption = analytics.gamification.redemptionTrend;
  const latestRedemption = redemption[redemption.length - 1]!.rate;
  return (
    <RegionBox
      id="graphs-trends"
      number={7}
      title="Graphs & Trends"
      subtitle="Retention leads — the single most important chart for any consumer app">
      {/* Retention full width */}
      <DashboardCard title="Retention Cohort (D1 / D7 / D30)" icon={LineChart} iconColor="text-primary">
        <RetentionCohortChart retention={g.retention} />
      </DashboardCard>

      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="K-Factor (Viral Coefficient)" icon={Repeat} iconColor="text-featured">
          <KFactorChart data={g.kFactor} />
        </DashboardCard>
        <DashboardCard title="Gameplay Velocity (DAP)" icon={Gamepad2} iconColor="text-accent">
          <GameplayVelocityChart data={g.velocity} />
        </DashboardCard>
      </div>

      {/* Compact cross-links instead of duplicate charts (same data twice confused the client) */}
      <div className="grid gap-4 sm:grid-cols-2">
        <StatTile
          label="Points redemption rate"
          value={`${latestRedemption}%`}
          icon={Coins}
          accent="success"
          sparkline={redemption.map((r) => r.rate)}
          subStats={[{ label: "Full chart in Box 2 — Gamification & Points Economy", accent: "primary" }]}
          onClick={() => jumpTo("gamification")}
        />
        <StatTile
          label="Conversion funnel"
          value={`${((funnel.subscribed / funnel.signups) * 100).toFixed(1)}%`}
          icon={Users}
          accent="primary"
          sparkline={[funnel.signups, funnel.firstSession, funnel.engaged, funnel.subscribed]}
          subStats={[{ label: "Full funnel in Box 4 — Monetization & Funnel", accent: "primary" }]}
          onClick={() => jumpTo("monetization")}
        />
      </div>
    </RegionBox>
  );
}
