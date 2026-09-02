import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Library, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { CountryFilter } from "@/components/custom/country-filter";
import {
  RecommendedActions,
  type RecommendedAction,
} from "@/components/custom/recommended-actions";

import { ContentAnalytics } from "./_components/content-analytics";
import { ContentCalendar } from "./_components/content-calendar";
import { ContentFilters, type DateRangeValue, type SortValue } from "./_components/content-filters";
import { ContentInventory } from "./_components/content-inventory";
import { ContentPerformance } from "./_components/content-performance";
import { ContentSummaryCards, type SummarySection } from "./_components/content-summary-cards";
import { ContentTabs } from "./_components/content-tabs";
import { LicensingRights } from "./_components/licensing-rights";
import { VideoList } from "./_components/video-list";
import { ViewModeToggle, type ViewMode } from "./_components/view-mode-toggle";
import type { TabValue } from "./constants";

export type ContentSearchParams = {
  section?: SummarySection;
  tab?: TabValue;
  country?: string;
  q?: string;
  sort?: SortValue;
  range?: DateRangeValue;
  viewMode?: ViewMode;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<ContentSearchParams>;
}

// Highest-priority content tasks — move admins from insight to action.
const CONTENT_ACTIONS: RecommendedAction[] = [
  { title: "8 videos awaiting review", detail: "In-review queue building up — assign a reviewer to keep the pipeline moving", severity: "high", cta: "Review queue", href: "/content?tab=requests" },
  { title: "7 licenses expiring ≤30 days", detail: "Renew or archive to avoid content going dark", severity: "medium", cta: "View licenses", href: "/content?section=licensing" },
  { title: "2 rejected videos need follow-up", detail: "Notify creators or re-submit with fixes", severity: "low", cta: "Open rejected", href: "/content?tab=rejected" },
];

export default async function ContentManagementPage({ searchParams }: PageProps) {
  const {
    section = "inventory",
    tab = "master",
    country = "all",
    q = "",
    sort = "newest",
    range = "all",
    viewMode = "list",
    page = "1",
    pageSize = "10",
  } = await searchParams;

  const showCalendar = tab === "master" && viewMode === "calendar";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Content Management</h1>
          <p className="text-foreground-secondary mt-1">
            Manage your video library, games, and content performance
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CountryFilter defaultValue={country} />
          <Button asChild variant="outline" className="gap-2">
            <Link href={"/content/taxonomy" as Route}>
              <Library className="h-4 w-4" />
              Library
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href={"/content/new" as Route}>
              <Plus className="h-4 w-4" />
              Add Video
            </Link>
          </Button>
        </div>
      </div>

      {/* Three clickable summary cards — detail appears only on click */}
      <Suspense fallback={<div className="bg-muted/10 h-[110px] w-full animate-pulse rounded-xl" />}>
        <ContentSummaryCards activeSection={section} />
      </Suspense>

      {/* Expanded section area — belongs to the active card */}
      {section !== "none" && (
        <div className="border-primary/30 animate-fade-in space-y-6 border-l-2 pl-4">
          {section === "inventory" && (
            <>
              <ContentInventory />

              {/* Recommended Actions — highest-priority content tasks (client: keep) */}
              <RecommendedActions actions={CONTENT_ACTIONS} />

              {/* Video timeline — the primary working surface, owned by Content Inventory */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <ContentTabs activeTab={tab} />
                  <div className="flex flex-wrap items-center gap-2">
                    <ContentFilters searchQuery={q} sort={sort} range={range} />
                    {tab === "master" && (
                      <Suspense fallback={null}>
                        <ViewModeToggle viewMode={viewMode} />
                      </Suspense>
                    )}
                  </div>
                </div>

                {showCalendar ? (
                  <ContentCalendar />
                ) : (
                  <Suspense
                    fallback={
                      <div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />
                    }>
                    <VideoList
                      tab={tab}
                      searchQuery={q}
                      sort={sort}
                      range={range}
                      page={Number(page)}
                      pageSize={Number(pageSize)}
                    />
                  </Suspense>
                )}
              </div>
            </>
          )}
          {section === "licensing" && <LicensingRights />}
          {section === "performance" && (
            <>
              <ContentPerformance />
              <Suspense
                fallback={<div className="bg-muted/20 h-[200px] w-full animate-pulse rounded-xl" />}>
                <ContentAnalytics />
              </Suspense>
            </>
          )}
        </div>
      )}
    </div>
  );
}
