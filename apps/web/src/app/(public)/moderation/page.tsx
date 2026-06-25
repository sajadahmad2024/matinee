import { Suspense } from "react";

import {
  RecommendedActions,
  type RecommendedAction,
} from "@/components/custom/recommended-actions";

import { ModerationAnalytics } from "./_components/moderation-analytics";
import { ModerationDashboardClient } from "./_components/moderation-dashboard-client";
import { TimeRangeSelector } from "./_components/time-range-selector";

// Actionable moderation insights (not passive stats) — each routes to the filtered ticket queue.
const MOD_ACTIONS: RecommendedAction[] = [
  { title: "Backlog elevated (67 open)", detail: "Queue trending upward — assign reviewers to keep resolution time under SLA", severity: "high", cta: "Open high-severity", href: "/moderation?severity=high" },
  { title: "Spam reports trending up", detail: "Spam category +18% in 24h — review automated filters", severity: "medium", cta: "Filter spam", href: "/moderation?category=spam" },
  { title: "Repeat offenders detected", detail: "3 users with multiple high-severity reports — consider escalation", severity: "high", cta: "Review users", href: "/moderation?type=user" },
];

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

      {/* Insight → action */}
      <RecommendedActions actions={MOD_ACTIONS} />

      {/* Moderation Intelligence — report volume, violations & safety trends,
          grouped separately from ticket management below */}
      <section className="space-y-4">
        <h2 className="text-foreground text-lg font-semibold">Moderation Intelligence</h2>
        <Suspense
          fallback={<div className="bg-muted/20 h-[300px] w-full animate-pulse rounded-xl" />}>
          <ModerationAnalytics pendingCount={pendingCount} />
        </Suspense>
      </section>

      {/* Ticket management — separate from the intelligence section above */}
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
