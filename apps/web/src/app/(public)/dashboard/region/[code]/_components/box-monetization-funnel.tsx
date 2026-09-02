"use client";

import { DollarSign, TrendingUp } from "lucide-react";

import { DashboardCard } from "../../../_components/dashboard-card";
import { MonetizationSection } from "../../../_components/monetization-section";
import { RevenueCompositionChart } from "../../../_components/revenue-composition-chart";
import { SubscriptionTrendChart } from "../../../_components/subscription-trend-chart";
import type { RegionAnalytics } from "../../../constants";
import { RegionBox } from "./region-box";

export function BoxMonetizationFunnel({ analytics }: { analytics: RegionAnalytics }) {
  const m = analytics.monetization;
  return (
    <RegionBox
      id="monetization"
      number={4}
      title="Monetization & Funnel"
      subtitle="Signup → subscriber funnel with drop-offs, ARPU/ARPDAU, LTV vs CAC by channel">
      <MonetizationSection data={m} />
      <div className="grid gap-4 lg:grid-cols-2">
        <DashboardCard title="Subscription Trend" icon={TrendingUp} iconColor="text-success">
          <SubscriptionTrendChart data={m.subsTrend} />
        </DashboardCard>
        <DashboardCard title="Revenue Composition" icon={DollarSign} iconColor="text-warning">
          <RevenueCompositionChart data={m.revenueTrend} />
        </DashboardCard>
      </div>
    </RegionBox>
  );
}
