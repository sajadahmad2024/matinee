"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BarChart3, Library } from "lucide-react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

/**
 * Top-level Content view switch. Separates the operational job (Library: inventory +
 * workflow queue + video list) from the reporting job (Analytics: licensing, performance,
 * engagement) so the working surface isn't a long scroll mixing both.
 */
export function ContentViewTabs({ activeView }: { activeView: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", value);
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Tabs value={activeView} onValueChange={onChange}>
      <TabsList className="bg-muted/30">
        <TabsTrigger
          value="library"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <Library className="h-4 w-4" />
          Library
        </TabsTrigger>
        <TabsTrigger
          value="analytics"
          className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground cursor-pointer gap-2">
          <BarChart3 className="h-4 w-4" />
          Analytics
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
