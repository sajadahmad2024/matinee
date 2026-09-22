"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BarChart3, Settings } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormatTabsProps {
  defaultTab: string;
  children: {
    settings: React.ReactNode;
    analytics: React.ReactNode;
  };
}

/** Two tabs only — the former Gamification tab is merged into Settings (client decision). */
export function FormatTabs({ defaultTab, children }: FormatTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("tab", value)}` as Route, { scroll: false });
  };

  // Legacy deep links (?tab=gamification) fall back to settings.
  const activeTab = defaultTab === "analytics" ? "analytics" : "settings";

  return (
    <Tabs defaultValue={activeTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-muted/30 p-1">
        <TabsTrigger
          value="settings"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">{children.settings}</TabsContent>
      <TabsContent value="analytics">{children.analytics}</TabsContent>
    </Tabs>
  );
}
