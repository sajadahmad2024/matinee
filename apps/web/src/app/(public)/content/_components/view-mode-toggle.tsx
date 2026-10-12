"use client";

import { CalendarDays, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

export type ViewMode = "list" | "calendar";

/**
 * Master-tab toggle between the video list and the month calendar
 * ("like opening the Mac calendar" — see live + scheduled across months).
 */
export function ViewModeToggle({ viewMode }: { viewMode: ViewMode }) {
  const updateSearchParams = useUpdateSearchParams();

  const setMode = (mode: ViewMode) =>
    updateSearchParams({ viewMode: mode === "calendar" ? "calendar" : null });

  return (
    <div className="border-border/50 flex items-center rounded-lg border p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === "list" ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8"
            aria-label="List view"
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
            aria-label="Calendar view"
            onClick={() => setMode("calendar")}>
            <CalendarDays className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Calendar view</TooltipContent>
      </Tooltip>
    </div>
  );
}
