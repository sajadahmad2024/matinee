"use client";

import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { AnalyticsDateFilter } from "@/components/custom/analytics-date-filter";

import { CONTENT_ROUTES } from "../../../_shared/content-config";
import { EMPTY } from "../../../_shared/content-format";

interface VideoAnalyticsHeaderProps {
  title?: string;
  /** The picked window, e.g. "Last 30 days". */
  rangeLabel: string;
}

/** Back to the library, the video's title, the window in view and the date filter. */
export function VideoAnalyticsHeader({ title, rangeLabel }: VideoAnalyticsHeaderProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(CONTENT_ROUTES.LIST)}
          aria-label="Back to content">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="font-gaming text-foreground text-2xl font-bold">Video Analytics</h1>
          <p className="text-foreground-secondary text-sm">
            {title ?? EMPTY} - Deep Performance Insights
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-muted-foreground">Showing</span>
            <span className="bg-muted/50 text-foreground-secondary rounded px-2 py-0.5 font-medium">
              {rangeLabel}
            </span>
          </div>
        </div>
      </div>
      <AnalyticsDateFilter />
    </div>
  );
}
