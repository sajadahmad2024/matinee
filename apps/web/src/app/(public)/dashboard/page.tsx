"use client";

import { useEffect, useState } from "react";

import {
  Coins,
  DollarSign,
  Gamepad2,
  Globe,
  LineChart,
  MessagesSquare,
  Repeat,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

import { CommunitySection } from "./_components/community-section";
import { ConversionFunnelChart } from "./_components/conversion-funnel-chart";
import { CriticalKPIs } from "./_components/critical-kpis";
import { DashboardCard } from "./_components/dashboard-card";
import { GameplayVelocityChart } from "./_components/gameplay-velocity-chart";
import { GlobalActivityMap } from "./_components/global-activity-map";
import { KFactorChart } from "./_components/k-factor-chart";
import { MonetizationSection } from "./_components/monetization-section";
import { PointsEconomyChart } from "./_components/points-economy-chart";
import { PointsEconomySection } from "./_components/points-economy-section";
import { RealTimePulse } from "./_components/real-time-pulse";
import { RedemptionRateTrend } from "./_components/redemption-rate-trend";
import { RetentionCohortChart } from "./_components/retention-cohort-chart";
import { RevenueCompositionChart } from "./_components/revenue-composition-chart";
import { SessionQualitySection } from "./_components/session-quality-section";
import { SubscriptionTrendChart } from "./_components/subscription-trend-chart";
import { UserAnalyticsSection } from "./_components/user-analytics-section";

export default function DashboardPage() {
  // Simulate live updating numbers
  const [liveUsers, setLiveUsers] = useState(12405);
  const [liveGameSessions, setLiveGameSessions] = useState(3847);
  const [subscribedUsers] = useState(8923);
  const [signedUpUsers] = useState(24817);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
      setLiveGameSessions((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Dashboard</h1>
          <p className="text-foreground-secondary mt-1 text-sm">
            Executive Overview & Live Command
          </p>
        </div>
      </div>

      {/* Real-Time Pulse Strip */}
      <div className="pt-2">
        <RealTimePulse
          liveUsers={liveUsers}
          liveGameSessions={liveGameSessions}
          subscribedUsers={subscribedUsers}
          signedUpUsers={signedUpUsers}
        />
      </div>

      {/* Critical Health KPIs */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-foreground text-lg font-semibold">Critical Health Metrics</h2>
        </div>
        <CriticalKPIs
          pendingReports={156}
          churnRate={4.2}
          churnChange={-0.8}
          totalUsers={248500}
          activeUsers={198000}
          dormantUsers={50500}
          monthlyRevenue={127400}
          mrr={98500}
          revenueGrowth={18.7}
          avgSessionDuration="24:38"
          avgDailySessions={3.2}
        />
      </section>

      {/* Global Activity Map */}
      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Global Activity</h2>
        <DashboardCard title="Global Activity Map" icon={Globe} iconColor="text-primary" className="gap-0">
          <GlobalActivityMap />
        </DashboardCard>
      </section>

      {/* Core Data Graphs */}
      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Core Data Graphs</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title="Gameplay Velocity (DAP)" icon={Gamepad2} iconColor="text-accent">
            <GameplayVelocityChart />
          </DashboardCard>
          <DashboardCard title="Retention Cohort (D1 / D7 / D30)" icon={LineChart} iconColor="text-primary">
            <RetentionCohortChart />
          </DashboardCard>
          <DashboardCard title="Points Redemption Rate" icon={Coins} iconColor="text-success">
            <RedemptionRateTrend />
          </DashboardCard>
          <DashboardCard title="K-Factor (Viral Coefficient)" icon={Repeat} iconColor="text-featured">
            <KFactorChart />
          </DashboardCard>
          <DashboardCard title="Conversion Funnel" icon={Users} iconColor="text-accent">
            <ConversionFunnelChart />
          </DashboardCard>
          <DashboardCard title="Points Economy" icon={Coins} iconColor="text-featured">
            <PointsEconomyChart />
          </DashboardCard>
        </div>
      </section>

      {/* User Analytics — content quality */}
      <section>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Timer className="text-primary h-5 w-5" /> User Analytics
        </h2>
        <UserAnalyticsSection />
      </section>

      {/* Gamification & Points Economy */}
      <section>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Coins className="text-warning h-5 w-5" /> Gamification & Points Economy
        </h2>
        <PointsEconomySection />
      </section>

      {/* Screen Time & Session Quality */}
      <section>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <Timer className="text-accent h-5 w-5" /> Screen Time & Session Quality
        </h2>
        <SessionQualitySection />
      </section>

      {/* Monetization & Funnel */}
      <section>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <DollarSign className="text-success h-5 w-5" /> Monetization & Funnel
        </h2>
        <MonetizationSection />
      </section>

      {/* Community Analytics */}
      <section>
        <h2 className="text-foreground mb-4 flex items-center gap-2 text-lg font-semibold">
          <MessagesSquare className="text-featured h-5 w-5" /> Community Analytics
        </h2>
        <CommunitySection />
      </section>

      {/* Subscription & Revenue trend (kept) */}
      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Revenue Intelligence</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard title="Subscription Trend" icon={TrendingUp} iconColor="text-success">
            <SubscriptionTrendChart />
          </DashboardCard>
          <DashboardCard title="Revenue Composition" icon={DollarSign} iconColor="text-warning">
            <RevenueCompositionChart />
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
