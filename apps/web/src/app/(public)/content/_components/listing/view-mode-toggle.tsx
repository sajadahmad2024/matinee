"use client";

import { CalendarDays, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { CONTENT_LIST_DEFAULTS, ContentViewMode } from "./listing-config";

/**
 * Master-tab toggle between the video list and the month calendar
 * ("like opening the Mac calendar" — see live + scheduled across months).
 */
export function ViewModeToggle({ viewMode }: { viewMode: ContentViewMode }) {
  const updateSearchParams = useUpdateSearchParams();

  const setMode = (mode: ContentViewMode) =>
    updateSearchParams({ viewMode: mode === CONTENT_LIST_DEFAULTS.viewMode ? null : mode });

  return (
    <div className="border-border/50 flex items-center gap-1 rounded-lg border p-0.5">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === ContentViewMode.List ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 cursor-pointer"
            aria-label="List view"
            onClick={() => setMode(ContentViewMode.List)}>
            <List className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={viewMode === ContentViewMode.Calendar ? "secondary" : "ghost"}
            size="icon"
            className="h-8 w-8 cursor-pointer"
            aria-label="Calendar view"
            onClick={() => setMode(ContentViewMode.Calendar)}>
            <CalendarDays className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Calendar view</TooltipContent>
      </Tooltip>
    </div>
  );
}
