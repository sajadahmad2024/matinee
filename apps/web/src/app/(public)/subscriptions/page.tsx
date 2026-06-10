"use client";

import { useState } from "react";

import { Download, Shield } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { PlanConfiguration } from "./_components/plan-configuration";
import { SubscriberList } from "./_components/subscriber-list";
import { SubscriptionAnalytics } from "./_components/subscription-analytics";
import { SubscriptionRegionalAnalytics } from "./_components/subscription-regional-analytics";
import { TransactionLedger } from "./_components/transaction-ledger";

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [timeFilter, setTimeFilter] = useState("30d");

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
          <Select value={timeFilter} onValueChange={setTimeFilter}>
            <SelectTrigger className="bg-background/50 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card">
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="border-border/50 bg-background/50 border p-1">
          <TabsTrigger
            value="analytics"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="regional"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Regional
          </TabsTrigger>
          <TabsTrigger
            value="subscribers"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Subscribers
          </TabsTrigger>
          <TabsTrigger
            value="transactions"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Transactions
          </TabsTrigger>
          <TabsTrigger
            value="plans"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
            Plans
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-0">
          <SubscriptionAnalytics />
        </TabsContent>

        <TabsContent value="regional" className="mt-0">
          <SubscriptionRegionalAnalytics />
        </TabsContent>

        <TabsContent value="subscribers" className="mt-0">
          <SubscriberList />
        </TabsContent>

        <TabsContent value="transactions" className="mt-0">
          <TransactionLedger />
        </TabsContent>

        <TabsContent value="plans" className="mt-0">
          <PlanConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}
