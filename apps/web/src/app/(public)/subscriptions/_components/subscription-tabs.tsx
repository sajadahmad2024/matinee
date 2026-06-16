"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SubscriptionTabsProps {
  defaultTab: string;
  children: {
    analytics: React.ReactNode;
    regional: React.ReactNode;
    subscribers: React.ReactNode;
    transactions: React.ReactNode;
    plans: React.ReactNode;
  };
}

export function SubscriptionTabs({ defaultTab, children }: SubscriptionTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      // Reset pagination and search inputs on tab change to avoid state carryover
      params.delete("page");
      params.delete("q");
      params.delete("status");
      return params.toString();
    },
    [searchParams],
  );

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("tab", value)}` as Route, { scroll: false });
  };

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="border-border/50 bg-background/50 border p-1">
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-medium">
          Analytics
        </TabsTrigger>
        <TabsTrigger
          value="regional"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-medium">
          Regional
        </TabsTrigger>
        <TabsTrigger
          value="subscribers"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-medium">
          Subscribers
        </TabsTrigger>
        <TabsTrigger
          value="transactions"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-medium">
          Transactions
        </TabsTrigger>
        <TabsTrigger
          value="plans"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer font-medium">
          Plans
        </TabsTrigger>
      </TabsList>

      <TabsContent value="analytics" className="mt-0">{children.analytics}</TabsContent>
      <TabsContent value="regional" className="mt-0">{children.regional}</TabsContent>
      <TabsContent value="subscribers" className="mt-0">{children.subscribers}</TabsContent>
      <TabsContent value="transactions" className="mt-0">{children.transactions}</TabsContent>
      <TabsContent value="plans" className="mt-0">{children.plans}</TabsContent>
    </Tabs>
  );
}

