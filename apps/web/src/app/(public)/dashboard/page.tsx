"use client";

import { useEffect, useState } from "react";

import { Coins, DollarSign, Gamepad2, Globe, TrendingUp } from "lucide-react";

import { CriticalKPIs } from "./_components/critical-kpis";
import { DashboardCard } from "./_components/dashboard-card";
import { GameplayVelocityChart } from "./_components/gameplay-velocity-chart";
import { GlobalActivityMap } from "./_components/global-activity-map";
import { PointsEconomyChart } from "./_components/points-economy-chart";
import { RealTimePulse } from "./_components/real-time-pulse";
import { RevenueCompositionChart } from "./_components/revenue-composition-chart";
import { SubscriptionTrendChart } from "./_components/subscription-trend-chart";

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

      {/* Business Intelligence Graphs */}
      <section>
        <h2 className="text-foreground mb-4 text-lg font-semibold">Business Intelligence</h2>

        <div className="grid gap-4 lg:grid-cols-2">
          <DashboardCard
            title="Global Activity Map"
            icon={Globe}
            iconColor="text-primary"
            className="gap-0 lg:col-span-2">
            <GlobalActivityMap />
          </DashboardCard>

          <DashboardCard title="Subscription Trend" icon={TrendingUp} iconColor="text-success">
            <SubscriptionTrendChart />
          </DashboardCard>

          <DashboardCard title="Revenue Composition" icon={DollarSign} iconColor="text-warning">
            <RevenueCompositionChart />
          </DashboardCard>

          <DashboardCard title="Gameplay Velocity (DAP)" icon={Gamepad2} iconColor="text-accent">
            <GameplayVelocityChart />
          </DashboardCard>

          <DashboardCard title="Points Economy" icon={Coins} iconColor="text-featured">
            <PointsEconomyChart />
          </DashboardCard>
        </div>
      </section>
    </div>
  );
}
