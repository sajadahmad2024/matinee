import { Suspense } from "react";

import { ModerationAnalytics } from "./_components/moderation-analytics";
import { ModerationDashboardClient } from "./_components/moderation-dashboard-client";
import { TimeRangeSelector } from "./_components/time-range-selector";

export type ModerationSearchParams = {
  timeRange?: string;
  q?: string;
  type?: string;
  severity?: string;
  category?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<ModerationSearchParams>;
}

export default async function ModerationQueuePage({ searchParams }: PageProps) {
  const {
    timeRange = "24h",
    q = "",
    type = "all",
    severity = "all",
    category = "all",
    page = "1",
    pageSize = "10",
  } = await searchParams;

  const pendingCount = 67; // This would normally come from the server based on timeRange

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Moderation Queue</h1>
          <p className="text-foreground-secondary mt-1">
            Review and manage flagged content, users, and community reports.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Suspense fallback={<div className="bg-muted h-10 w-[140px] animate-pulse rounded-md" />}>
            <TimeRangeSelector defaultValue={timeRange} />
          </Suspense>
        </div>
      </div>

      {/* Analytics Section */}
      <Suspense
        fallback={<div className="bg-muted/20 h-[300px] w-full animate-pulse rounded-xl" />}>
        <ModerationAnalytics pendingCount={pendingCount} />
      </Suspense>

      {/* Ticket List and Client State */}
      <Suspense
        fallback={<div className="bg-muted/10 h-[600px] w-full animate-pulse rounded-xl" />}>
        <ModerationDashboardClient
          searchQuery={q}
          typeFilter={type}
          severityFilter={severity}
          categoryFilter={category}
          page={Number(page)}
          pageSize={Number(pageSize)}
        />
      </Suspense>
    </div>
  );
}
