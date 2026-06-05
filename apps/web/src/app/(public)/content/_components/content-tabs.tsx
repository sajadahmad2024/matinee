"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { CONTENT_TABS_CONFIG, type TabValue } from "../constants";

interface ContentTabsProps {
  activeTab: TabValue;
}

export function ContentTabs({ activeTab }: ContentTabsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      // Reset pagination when tab changes
      params.delete("page");
      return params.toString();
    },
    [searchParams],
  );

  const handleTabChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("tab", value)}`, { scroll: false });
  };

  return (
    <Tabs value={activeTab} onValueChange={handleTabChange}>
      <TabsList className="bg-background-secondary h-auto flex-wrap p-1">
        {CONTENT_TABS_CONFIG.map((tab) => (
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
