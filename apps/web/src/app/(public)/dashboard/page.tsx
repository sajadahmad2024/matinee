"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import {
  Activity,
  Coins,
  DollarSign,
  Gamepad2,
  Globe,
  LayoutDashboard,
  LineChart,
  MessagesSquare,
  Repeat,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { TimeRangeSelector } from "@/components/custom/time-range-selector";

import { useTabParam } from "@/app/_libs/use-tab-param";

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

  const [tab, setTab] = useTabParam("overview");
  const timeRange = useSearchParams().get("timeRange") ?? "30d";
  const tabTrigger =
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Dashboard</h1>
          <p className="text-foreground-secondary mt-1 text-sm">Executive Overview & Live Command</p>
        </div>
        <TimeRangeSelector defaultValue={timeRange} />
      </div>

      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <TabsList className="border-border/50 bg-background/50 flex h-auto flex-wrap border p-1">
          <TabsTrigger value="overview" className={tabTrigger}>
            <LayoutDashboard className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="engagement" className={tabTrigger}>
            <Activity className="h-4 w-4" /> Engagement
          </TabsTrigger>
          <TabsTrigger value="gamification" className={tabTrigger}>
            <Coins className="h-4 w-4" /> Gamification
          </TabsTrigger>
          <TabsTrigger value="monetization" className={tabTrigger}>
            <DollarSign className="h-4 w-4" /> Monetization
          </TabsTrigger>
          <TabsTrigger value="community" className={tabTrigger}>
            <MessagesSquare className="h-4 w-4" /> Community
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW — the executive snapshot */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <RealTimePulse
            liveUsers={liveUsers}
            liveGameSessions={liveGameSessions}
            subscribedUsers={subscribedUsers}
            signedUpUsers={signedUpUsers}
          />
          <section>
            <h2 className="text-foreground mb-4 text-lg font-semibold">Critical Health Metrics</h2>
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
          <DashboardCard title="Global Activity Map" icon={Globe} iconColor="text-primary" className="gap-0">
            <GlobalActivityMap />
          </DashboardCard>
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard title="Retention Cohort (D1 / D7 / D30)" icon={LineChart} iconColor="text-primary">
              <RetentionCohortChart />
            </DashboardCard>
            <DashboardCard title="Conversion Funnel" icon={Users} iconColor="text-accent">
              <ConversionFunnelChart />
            </DashboardCard>
          </div>
        </TabsContent>

        {/* ENGAGEMENT — content quality + session quality */}
        <TabsContent value="engagement" className="mt-0 space-y-6">
          <SectionTitle icon={Timer} color="text-primary">User Analytics</SectionTitle>
          <UserAnalyticsSection />
          <SectionTitle icon={Activity} color="text-accent">Screen Time & Session Quality</SectionTitle>
          <SessionQualitySection />
        </TabsContent>

        {/* GAMIFICATION */}
        <TabsContent value="gamification" className="mt-0 space-y-6">
          <SectionTitle icon={Coins} color="text-warning">Points Economy</SectionTitle>
          <PointsEconomySection />
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard title="Gameplay Velocity (DAP)" icon={Gamepad2} iconColor="text-accent">
              <GameplayVelocityChart />
            </DashboardCard>
            <DashboardCard title="Points Economy Trend" icon={Coins} iconColor="text-featured">
              <PointsEconomyChart />
            </DashboardCard>
            <DashboardCard title="Points Redemption Rate" icon={Coins} iconColor="text-success">
              <RedemptionRateTrend />
            </DashboardCard>
          </div>
        </TabsContent>

        {/* MONETIZATION */}
        <TabsContent value="monetization" className="mt-0 space-y-6">
          <SectionTitle icon={DollarSign} color="text-success">Monetization & Funnel</SectionTitle>
          <MonetizationSection />
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard title="Subscription Trend" icon={TrendingUp} iconColor="text-success">
              <SubscriptionTrendChart />
            </DashboardCard>
            <DashboardCard title="Revenue Composition" icon={DollarSign} iconColor="text-warning">
              <RevenueCompositionChart />
            </DashboardCard>
            <DashboardCard title="K-Factor (Viral Coefficient)" icon={Repeat} iconColor="text-featured">
              <KFactorChart />
            </DashboardCard>
          </div>
        </TabsContent>

        {/* COMMUNITY */}
        <TabsContent value="community" className="mt-0 space-y-6">
          <SectionTitle icon={MessagesSquare} color="text-featured">Community Analytics</SectionTitle>
          <CommunitySection />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SectionTitle({ icon: Icon, color, children }: { icon: React.ElementType; color: string; children: React.ReactNode }) {
  return (
    <h2 className="text-foreground flex items-center gap-2 text-lg font-semibold">
      <Icon className={`h-5 w-5 ${color}`} /> {children}
    </h2>
  );
}
