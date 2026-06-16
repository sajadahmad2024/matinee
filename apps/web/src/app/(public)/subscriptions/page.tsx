import { Suspense } from "react";

import { Download, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
  q?: string;
  status?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<SubscriptionSearchParams>;
}

export default async function SubscriptionsPage({ searchParams }: PageProps) {
  const {
    tab = "analytics",
    timeRange = "30d",
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
