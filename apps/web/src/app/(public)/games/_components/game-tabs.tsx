"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Activity, Award, BarChart3, Gamepad2, Trophy } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GameTabsProps {
  defaultTab: string;
  children: {
    overview: React.ReactNode;
    formats: React.ReactNode;
    leveling: React.ReactNode;
    badges: React.ReactNode;
    leaderboards: React.ReactNode;
  };
}

export function GameTabs({ defaultTab, children }: GameTabsProps) {
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

  // URL-controlled so in-app links (e.g. "View leaderboard") actually switch the tab.
  const current = searchParams.get("tab") ?? defaultTab;

  return (
    <Tabs value={current} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-muted/30 h-auto flex-wrap p-1">
        <TabsTrigger
          value="overview"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Activity className="h-4 w-4" />
          Overview
        </TabsTrigger>
        <TabsTrigger
          value="formats"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Gamepad2 className="h-4 w-4" />
          Game Formats
        </TabsTrigger>
        <TabsTrigger
          value="leveling"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <BarChart3 className="h-4 w-4" />
          Leveling
        </TabsTrigger>
        <TabsTrigger
          value="badges"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Award className="h-4 w-4" />
          Badges
        </TabsTrigger>
        <TabsTrigger
          value="leaderboards"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Trophy className="h-4 w-4" />
          Leaderboards
        </TabsTrigger>
      </TabsList>

      <TabsContent value="overview">{children.overview}</TabsContent>
      <TabsContent value="formats">{children.formats}</TabsContent>
      <TabsContent value="leveling">{children.leveling}</TabsContent>
      <TabsContent value="badges">{children.badges}</TabsContent>
      <TabsContent value="leaderboards">{children.leaderboards}</TabsContent>
    </Tabs>
  );
}
