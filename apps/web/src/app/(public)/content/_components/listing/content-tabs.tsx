"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useContentStats } from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { type ContentRegionKey } from "../../_shared/content-types";
import { CONTENT_TABS_CONFIG, ContentTab, TAB_STATUSES } from "./listing-config";

interface ContentTabsProps {
  activeTab: ContentTab;
  region: ContentRegionKey;
}

export function ContentTabs({ activeTab, region }: ContentTabsProps) {
  const updateSearchParams = useUpdateSearchParams();
  // Region-scoped like the list, so each badge matches what its tab lists.
  const { contentStatsQuery, contentStats } = useContentStats(
    region === ALL_REGIONS ? undefined : region,
  );

  /** A tab's badge: the sum of its statuses; none until the stats load. */
  const countFor = (tab: ContentTab) => {
    const byStatus = contentStats?.byStatus;
    if (!byStatus) return undefined;
    return TAB_STATUSES[tab].reduce((sum, status) => sum + (byStatus[status] ?? 0), 0);
  };

  // The list refetches on every tab switch; the badges follow, so other admins' changes show up.
  const handleTabChange = (value: string) => {
    updateSearchParams({ tab: value });
    void contentStatsQuery.refetch();
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange} activationMode="manual">
      <TabsList className="bg-background-secondary h-auto flex-wrap p-1">
        {CONTENT_TABS_CONFIG.map((tab) => {
          const count = countFor(tab.value);
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="cursor-pointer gap-2">
              <tab.icon className="h-4 w-4" />
              {tab.label}
              {count !== undefined && (
                <span className="bg-primary/20 text-primary ml-1 rounded-full px-1.5 py-0.5 text-xs">
                  {count}
                </span>
              )}
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}
