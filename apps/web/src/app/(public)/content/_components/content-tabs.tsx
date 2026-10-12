"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { type ContentRegionKey, type TabValue, contentTabsForRegion } from "../constants";

interface ContentTabsProps {
  activeTab: TabValue;
  region: ContentRegionKey;
}

export function ContentTabs({ activeTab, region }: ContentTabsProps) {
  const tabs = contentTabsForRegion(region);
  const updateSearchParams = useUpdateSearchParams();

  const handleTabChange = (value: string) => updateSearchParams({ tab: value });

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="bg-background-secondary h-auto flex-wrap p-1">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer gap-2">
            <tab.icon className="h-4 w-4" />
            {tab.label}
            {tab.count !== undefined && (
              <span className="bg-primary/20 text-primary ml-1 rounded-full px-1.5 py-0.5 text-xs">
                {tab.count}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
