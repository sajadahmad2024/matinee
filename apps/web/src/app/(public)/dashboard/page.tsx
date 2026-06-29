"use client";

import { useEffect, useState } from "react";

import { useSearchParams } from "next/navigation";

import {
  Activity,
  AlertTriangle,
  Coins,
  DollarSign,
  Download,
  Eye,
  Gamepad2,
  Gauge,
  Globe,
  Heart,
  LayoutDashboard,
  LineChart,
  MessagesSquare,
  Repeat,
  Target,
  Timer,
  TrendingUp,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";
import { CountryFilter } from "@/components/custom/country-filter";
import { RegionFilter } from "@/components/custom/region-filter";
import { TimeRangeSelector } from "@/components/custom/time-range-selector";

// Primary, "improving/declining at a glance" KPIs per sub-tab — consistent with the rest of the admin.
const ENGAGEMENT_PRIMARY: HealthStat[] = [
  { label: "Watch Rate", value: "82%", insight: "+1.4% vs last period", trend: "up", tone: "good", icon: Eye },
  { label: "Completion Rate", value: "54%", insight: "+2.3% — content resonating", trend: "up", tone: "good", icon: Target },
  { label: "Avg Session Length", value: "24:38", insight: "+0.5 min", trend: "up", tone: "good", icon: Timer },
  { label: "Re-watch / Loops", value: "2.1×", insight: "steady", tone: "neutral", icon: Repeat },
];

const ECONOMY_STATUS: HealthStat[] = [
  { label: "Economy Status", value: "Healthy", insight: "balanced mint vs redeem", tone: "good", icon: Gauge },
  { label: "Redemption Rate", value: "49%", insight: "+3% — above 40% target", trend: "up", tone: "good", icon: Coins },
  { label: "Points Outstanding", value: "8.4M", insight: "hoarding within range", tone: "neutral", icon: Coins },
  { label: "Inflation Risk", value: "Low", insight: "mint tracking redemption", tone: "good", icon: AlertTriangle },
];

const COMMUNITY_PRIMARY: HealthStat[] = [
  { label: "Active Participants", value: "1.8", insight: "comments / user / week", tone: "neutral", icon: Users },
  { label: "Reply Rate", value: "42%", insight: "+3% — healthy conversation", trend: "up", tone: "good", icon: MessagesSquare },
  { label: "Sentiment P/N/Neg", value: "68/22/10", insight: "net positive", tone: "good", icon: Heart },
  { label: "Earned Media Value", value: "$182K", insight: "+12%", trend: "up", tone: "good", icon: DollarSign },
];

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
  const [signedUpUsers] = useState(248500);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveUsers((prev) => prev + Math.floor(Math.random() * 20) - 10);
      setLiveGameSessions((prev) => prev + Math.floor(Math.random() * 10) - 5);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Platform total (incl. guests) is distinct from Signed Up.
  const totalUsers = 312000;

  const [tab, setTab] = useTabParam("overview");
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? "30d";
  const region = searchParams.get("region") ?? "global";
  const country = searchParams.get("country") ?? "all";
  const tabTrigger =
    "data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2";

  // Active-context labels so the data scope is always visible (not just buried in dropdowns).
  const regionLabel = region === "global" ? "Global" : region.toUpperCase();
  const timeRangeLabel =
    (
      { "7d": "Last 7 days", "30d": "Last 30 days", "90d": "Last 90 days" } as Record<string, string>
    )[timeRange] ?? timeRange;

  // Export all dashboard statistics (header-level so it clearly covers the whole dashboard).
  const exportDashboard = () => {
    const rows: [string, string][] = [
      ["Metric", "Value"],
      ["Total Users", String(totalUsers)],
      ["Signed Up", String(signedUpUsers)],
      ["Subscribed", String(subscribedUsers)],
      ["Online Now", String(liveUsers)],
      ["Playing Games", String(liveGameSessions)],
      ["Region", regionLabel],
      ["Country", country === "all" ? "All" : country],
      ["Period", timeRangeLabel],
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "dashboard-statistics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Dashboard</h1>
          <p className="text-foreground-secondary mt-1 text-sm">Executive Overview & Live Command</p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Showing</span>
            <span className="bg-primary/10 text-primary rounded px-2 py-0.5 font-medium">
              {regionLabel}
            </span>
            {country !== "all" && (
              <span className="bg-accent/10 text-accent rounded px-2 py-0.5 font-medium">
                {country}
              </span>
            )}
            <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
              {timeRangeLabel}
            </span>
          </div>
        </div>
        {/* Filters + a single Export that applies to ALL dashboard statistics */}
        <div className="flex flex-wrap items-center gap-2">
          <RegionFilter defaultValue={region} />
          <CountryFilter defaultValue={country} />
          <TimeRangeSelector defaultValue={timeRange} />
          <Button variant="outline" className="gap-2" onClick={exportDashboard}>
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
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

        {/* OVERVIEW — flow: live pulse → highlights → health → core business metrics → regional */}
        <TabsContent value="overview" className="mt-0 space-y-6">
          <RealTimePulse
            totalUsers={totalUsers}
            signedUpUsers={signedUpUsers}
            subscribedUsers={subscribedUsers}
            liveUsers={liveUsers}
            liveGameSessions={liveGameSessions}
          />

          {/* Highlights — key trends summarised so admins don't have to read every chart */}
          <section>
            <h2 className="text-foreground mb-4 text-lg font-semibold">Highlights</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Highlight
                icon={LineChart}
                label="D30 Retention"
                value="38%"
                delta="+3 pts vs last period"
                tone="success"
              />
              <Highlight
                icon={Users}
                label="Visitor → Subscriber"
                value="4.0%"
                delta="+0.4 pts vs last period"
                tone="success"
              />
              <Highlight
                icon={TrendingUp}
                label="Churn"
                value="4.2%"
                delta="-0.8 pts (improving)"
                tone="success"
              />
            </div>
          </section>

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

          {/* Core business metrics — promoted above the fold (most critical) */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard
              title="Retention Cohort (D1 / D7 / D30)"
              icon={LineChart}
              iconColor="text-primary">
              <RetentionCohortChart />
            </DashboardCard>
            <DashboardCard title="Conversion Funnel" icon={Users} iconColor="text-accent">
              <ConversionFunnelChart />
            </DashboardCard>
          </div>

          {/* Regional breakdown — exploratory, moved lower and renamed (it's a regional ranking) */}
          <DashboardCard
            title="Activity by Region (Top Markets)"
            icon={Globe}
            iconColor="text-primary"
            className="gap-0">
            <GlobalActivityMap />
          </DashboardCard>
        </TabsContent>

        {/* ENGAGEMENT — lead with primary KPIs, detailed analytics below */}
        <TabsContent value="engagement" className="mt-0 space-y-6">
          <section className="space-y-4">
            <SectionTitle icon={Activity} color="text-accent">Engagement Health</SectionTitle>
            <AdminHealthSummary stats={ENGAGEMENT_PRIMARY} />
          </section>
          <SectionTitle icon={Timer} color="text-primary">Detailed User Analytics</SectionTitle>
          <UserAnalyticsSection />
          <SectionTitle icon={Activity} color="text-accent">Screen Time & Session Quality</SectionTitle>
          <SessionQualitySection />
        </TabsContent>

        {/* GAMIFICATION — Economy Status + risks first, trends promoted, breakdown grouped */}
        <TabsContent value="gamification" className="mt-0 space-y-6">
          <section className="space-y-4">
            <SectionTitle icon={Gauge} color="text-warning">Economy Status</SectionTitle>
            <AdminHealthSummary stats={ECONOMY_STATUS} />
            <div className="bg-warning/10 border-warning/20 flex items-start gap-2 rounded-lg border p-3">
              <AlertTriangle className="text-warning mt-0.5 h-4 w-4 shrink-0" />
              <p className="text-muted-foreground text-sm">
                <span className="text-warning font-medium">Watch for:</span> redemption below 40%
                signals hoarding; mint growth outpacing redemption signals inflation. Both currently
                within a healthy range.
              </p>
            </div>
          </section>

          {/* Ecosystem-health trends promoted higher */}
          <div className="grid gap-4 lg:grid-cols-2">
            <DashboardCard title="Points Economy Trend" icon={Coins} iconColor="text-featured">
              <PointsEconomyChart />
            </DashboardCard>
            <DashboardCard title="Points Redemption Rate" icon={Coins} iconColor="text-success">
              <RedemptionRateTrend />
            </DashboardCard>
          </div>

          {/* Points Economy Breakdown — sources, distribution & leaderboard grouped together */}
          <SectionTitle icon={Coins} color="text-warning">Points Economy Breakdown</SectionTitle>
          <PointsEconomySection />

          <DashboardCard title="Gameplay Velocity (DAP)" icon={Gamepad2} iconColor="text-accent">
            <GameplayVelocityChart />
          </DashboardCard>
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

        {/* COMMUNITY — primary health first, then detailed analytics */}
        <TabsContent value="community" className="mt-0 space-y-6">
          <section className="space-y-4">
            <SectionTitle icon={MessagesSquare} color="text-featured">Community Health</SectionTitle>
            <AdminHealthSummary stats={COMMUNITY_PRIMARY} />
          </section>
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

function Highlight({
  icon: Icon,
  label,
  value,
  delta,
  tone,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  delta: string;
  tone: "success" | "warning" | "accent";
}) {
  const toneText =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-accent";
  return (
    <div className="border-border/50 bg-background/50 rounded-xl border p-4">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs">{label}</span>
        <Icon className={`h-4 w-4 ${toneText}`} />
      </div>
      <p className="text-foreground mt-2 text-2xl font-bold">{value}</p>
      <p className={`mt-1 text-xs ${toneText}`}>{delta}</p>
    </div>
  );
}
