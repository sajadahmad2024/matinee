import { Suspense } from "react";

import Link from "next/link";

import { Library, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { ALL_REGIONS, regionLabel } from "@/app/_libs/regions";

import { ContentInventory } from "./_components/inventory/content-inventory";
import { LicensingRights } from "./_components/licensing/licensing-rights";
import { ContentCalendar } from "./_components/listing/content-calendar";
import { ContentFilters } from "./_components/listing/content-filters";
import { ContentTabs } from "./_components/listing/content-tabs";
import {
  CONTENT_CALENDAR_ENABLED,
  CONTENT_LIST_DEFAULTS,
  ContentDateRange,
  type ContentSort,
  ContentTab,
  ContentViewMode,
} from "./_components/listing/listing-config";
import { VideoList } from "./_components/listing/video-list";
import { ViewModeToggle } from "./_components/listing/view-mode-toggle";
import { ContentAnalytics } from "./_components/performance/content-analytics";
import { ContentPerformance } from "./_components/performance/content-performance";
import { ContentRecommendedActions } from "./_components/recommended-actions/content-recommended-actions";
import { RegionalActivity } from "./_components/regional-activity/regional-activity";
import { ContentSummaryCards } from "./_components/summary-cards/content-summary-cards";
import { CONTENT_PAGE_DEFAULTS, CONTENT_ROUTES, ContentSection } from "./_shared/content-config";
import { normalizeContentRegion } from "./_shared/content-types";

export type ContentSearchParams = {
  section?: ContentSection;
  region?: string;
  tab?: ContentTab;
  q?: string;
  sort?: ContentSort;
  range?: ContentDateRange;
  viewMode?: ContentViewMode;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<ContentSearchParams>;
}

export default async function ContentManagementPage({ searchParams }: PageProps) {
  const {
    section = CONTENT_PAGE_DEFAULTS.section,
    tab = CONTENT_LIST_DEFAULTS.tab,
    q = "",
    sort = CONTENT_LIST_DEFAULTS.sort,
    range = CONTENT_LIST_DEFAULTS.range,
    viewMode = CONTENT_LIST_DEFAULTS.viewMode,
    region: regionParam,
    page = String(CONTENT_LIST_DEFAULTS.page),
    pageSize = String(CONTENT_LIST_DEFAULTS.pageSize),
  } = await searchParams;

  // The content APIs filter by macro-region only, so the Regional Activity map (?region=) is the
  // page's geographic scope — there's no country filter here.
  const region = normalizeContentRegion(regionParam);
  const scopeLabel = region === ALL_REGIONS ? undefined : regionLabel(region);
  const showCalendar =
    CONTENT_CALENDAR_ENABLED && tab === ContentTab.Master && viewMode === ContentViewMode.Calendar;

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
          <Button asChild variant="outline" className="gap-2">
            <Link href={CONTENT_ROUTES.TAXONOMY}>
              <Library className="h-4 w-4" />
              Library
            </Link>
          </Button>
          <Button asChild className="gap-2">
            <Link href={CONTENT_ROUTES.NEW}>
              <Plus className="h-4 w-4" />
              Add Video
            </Link>
          </Button>
        </div>
      </div>

      {/* Three clickable summary cards — detail appears only on click */}
      <Suspense fallback={<div className="bg-muted/10 h-27.5 w-full animate-pulse rounded-xl" />}>
        <ContentSummaryCards activeSection={section} region={region} />
      </Suspense>

      <RegionalActivity region={region} />

      {/* Expanded section area — belongs to the active card */}
      {section !== ContentSection.None && (
        <div className="border-primary/30 animate-fade-in space-y-6 border-l-2 pl-4">
          {section === ContentSection.Inventory && (
            <>
              <ContentInventory region={region} regionLabel={scopeLabel} />
              <div className="space-y-4">
                {/* Tabs, then the toolbar on its own row — it stays put whether the calendar's
                    narrower toolbar would fit beside the tabs or not. */}
                <div className="space-y-4">
                  <ContentTabs activeTab={tab} region={region} />
                  <div className="flex flex-wrap items-center gap-2">
                    <ContentFilters
                      searchQuery={q}
                      sort={sort}
                      range={range}
                      isCalendarView={showCalendar}
                    />
                    {CONTENT_CALENDAR_ENABLED && tab === ContentTab.Master && (
                      <Suspense fallback={null}>
                        <ViewModeToggle viewMode={viewMode} />
                      </Suspense>
                    )}
                  </div>
                </div>

                {showCalendar ? (
                  <ContentCalendar searchQuery={q} region={region} />
                ) : (
                  <Suspense
                    fallback={
                      <div className="bg-muted/10 h-100 w-full animate-pulse rounded-xl" />
                    }>
                    <VideoList
                      tab={tab}
                      searchQuery={q}
                      sort={sort}
                      range={range}
                      region={region}
                      page={Number(page)}
                      pageSize={Number(pageSize)}
                    />
                  </Suspense>
                )}
              </div>
            </>
          )}
          {section === ContentSection.Licensing && <LicensingRights />}
          {section === ContentSection.Performance && (
            <>
              <ContentPerformance region={region} />
              <Suspense
                fallback={<div className="bg-muted/20 h-50 w-full animate-pulse rounded-xl" />}>
                <ContentAnalytics region={region} />
              </Suspense>
            </>
          )}
        </div>
      )}

      <ContentRecommendedActions region={region} />
    </div>
  );
}
