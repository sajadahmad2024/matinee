"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CalendarDays, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export type ViewMode = "list" | "calendar";

/**
 * Master-tab toggle between the video list and the month calendar
 * ("like opening the Mac calendar" — see live + scheduled across months).
 */
export function ViewModeToggle({ viewMode }: { viewMode: ViewMode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setMode = useCallback(
    (mode: ViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "calendar") {
        params.set("viewMode", "calendar");
      } else {
        params.delete("viewMode");
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <div className="border-border/50 flex items-center rounded-lg border p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMode("list")}>
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "calendar" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setMode("calendar")}>
            <CalendarDays className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Calendar view</TooltipContent>
      </Tooltip>
    </div>
  );
}
