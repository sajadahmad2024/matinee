"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ArrowLeft, BarChart3, SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useTabParam } from "@/app/_libs/use-tab-param";

import { PlatformConfig } from "./platform-config";
import { PlatformStats } from "./platform-stats";

const TABS = [
  { value: "config", label: "Configuration", icon: SlidersHorizontal, Content: PlatformConfig },
  { value: "stats", label: "Statistics", icon: BarChart3, Content: PlatformStats },
];

/** Platform-level ads (spec-09): rules for every feed ad + analytics across all of them. */
export function PlatformAdsView() {
  const router = useRouter();
  const [tabParam, setTab] = useTabParam("config");
  const activeTab = TABS.some((t) => t.value === tabParam) ? tabParam : "config";

  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" aria-label="Back" onClick={() => router.push("/ads" as Route)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-gaming text-foreground text-2xl font-bold">Platform Ads</h1>
          <p className="text-foreground-secondary text-sm">Rules and performance across every feed ad</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setTab} className="space-y-6">
        <TabsList className="border-border/50 bg-background/50 border p-1">
          {TABS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map(({ value, Content }) => (
          <TabsContent key={value} value={value} className="mt-0">
            <Content />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
