"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BarChart3, Gamepad2, Settings } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface FormatTabsProps {
  defaultTab: string;
  gameCount: number;
  children: {
    settings: React.ReactNode;
    analytics: React.ReactNode;
    games: React.ReactNode;
  };
}

export function FormatTabs({ defaultTab, gameCount, children }: FormatTabsProps) {
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
    router.push(`${pathname}?${createQueryString("tab", value)}`, { scroll: false });
  };

  return (
    <Tabs defaultValue={defaultTab} onValueChange={handleTabChange} className="space-y-6">
      <TabsList className="bg-muted/30 p-1">
        <TabsTrigger
          value="settings"
          className="data-[state=active]:bg-background cursor-pointer gap-2">
          <Settings className="h-4 w-4" />
          Settings
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-background cursor-pointer gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
        <TabsTrigger
          value="games"
          className="data-[state=active]:bg-background cursor-pointer gap-2">
          <Gamepad2 className="h-4 w-4" />
          Games ({gameCount})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="settings">{children.settings}</TabsContent>
      <TabsContent value="analytics">{children.analytics}</TabsContent>
      <TabsContent value="games">{children.games}</TabsContent>
    </Tabs>
  );
}
