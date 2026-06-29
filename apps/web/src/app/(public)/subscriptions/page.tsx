import { Suspense } from "react";

import { Clock, DollarSign, Download, Shield, TrendingDown, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { AdminHealthSummary, type HealthStat } from "@/components/custom/admin-health-summary";
import { CountryFilter } from "@/components/custom/country-filter";
import {
  RecommendedActions,
  type RecommendedAction,
} from "@/components/custom/recommended-actions";

import { PlanConfiguration } from "./_components/plan-configuration";
import { SubscriberList } from "./_components/subscriber-list";
import { SubscriptionAnalytics } from "./_components/subscription-analytics";
import { SubscriptionRegionalAnalytics } from "./_components/subscription-regional-analytics";
import { SubscriptionTabs } from "./_components/subscription-tabs";
import { TimeRangeSelector } from "./_components/time-range-selector";
import { TransactionLedger } from "./_components/transaction-ledger";

export type SubscriptionSearchParams = {
  tab?: "analytics" | "regional" | "subscribers" | "transactions" | "plans";
  timeRange?: string;
  country?: string;
  q?: string;
  status?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<SubscriptionSearchParams>;
}

// Revenue health at a glance (subscription journey: revenue → conversion → retention).
const SUB_HEALTH: HealthStat[] = [
  { label: "Current MRR", value: "$94,200", insight: "+12.4% vs last period", trend: "up", tone: "good", icon: DollarSign },
  { label: "Avg LTV", value: "$186", insight: "+8.2%", trend: "up", tone: "good", icon: Users },
  { label: "Churn Rate", value: "4.2%", insight: "-0.8 pts (improving)", trend: "down", tone: "good", icon: TrendingDown },
  { label: "Avg Time to Convert", value: "5.2 days", insight: "-1.2 days", trend: "down", tone: "good", icon: Clock },
];

const SUB_ACTIONS: RecommendedAction[] = [
  { title: "Churn rising in a key region", detail: "Day-28 cancellations spike — launch a trial-period retention campaign", severity: "high", cta: "View by region", href: "/subscriptions?tab=regional" },
  { title: "Annual plan underpriced vs LTV", detail: "LTV $186 well above annual price — test a pricing adjustment", severity: "medium", cta: "Review pricing", href: "/subscriptions?tab=plans" },
  { title: "High-intent users not converting", detail: "Users with 10+ watch hours not subscribed — target with an offer", severity: "low", cta: "View subscribers", href: "/subscriptions?tab=subscribers" },
];

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const {
    tab = "analytics",
    timeRange = "30d",
    country = "all",
    q = "",
    status = "all",
    page = "1",
    pageSize = "10",
  } = await searchParams;

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-gaming text-foreground text-3xl font-bold">
              Subscription Management
            </h1>
            <Badge variant="outline" className="bg-warning/20 border-warning/30 text-warning">
              <Shield className="mr-1 h-3 w-3" />
              Owner Only
            </Badge>
          </div>
          <p className="text-foreground-secondary mt-1">
            Manage plans, billing, and revenue analytics. Data synced from Stripe.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <CountryFilter defaultValue={country} />
          <Suspense
            fallback={<div className="bg-muted/20 h-10 w-[140px] animate-pulse rounded-md" />}>
            <TimeRangeSelector defaultValue={timeRange} />
          </Suspense>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Revenue health summary + recommended actions — consistent intelligence band */}
      <AdminHealthSummary stats={SUB_HEALTH} />
      <RecommendedActions actions={SUB_ACTIONS} />

      {/* Tabs Navigation */}
      <SubscriptionTabs defaultTab={tab}>
        {{
          analytics: (
            <Suspense fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <SubscriptionAnalytics timeRange={timeRange} />
            </Suspense>
          ),
          regional: (
            <Suspense fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <SubscriptionRegionalAnalytics timeRange={timeRange} />
            </Suspense>
          ),
          subscribers: (
            <Suspense fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <SubscriberList
                searchQuery={q}
                statusFilter={status}
                page={Number(page)}
                pageSize={Number(pageSize)}
              />
            </Suspense>
          ),
          transactions: (
            <Suspense fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <TransactionLedger
                searchQuery={q}
                statusFilter={status}
                page={Number(page)}
                pageSize={Number(pageSize)}
              />
            </Suspense>
          ),
          plans: (
            <Suspense fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <PlanConfiguration />
            </Suspense>
          ),
        }}
      </SubscriptionTabs>
    </div>
  );
}
