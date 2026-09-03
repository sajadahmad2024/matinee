import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Globe, Library, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { MACRO_REGIONS, regionForCountry, regionLabel } from "@/app/_libs/regions";
import { CountryFilter } from "@/components/custom/country-filter";
import {
  type RecommendedAction,
  RecommendedActions,
} from "@/components/custom/recommended-actions";
import {
  RegionBoxFilter,
  type RegionBoxMetric,
  type RegionBoxOption,
} from "@/components/custom/region-box-filter";
import { SectionHeading } from "@/components/custom/section-heading";

import { ContentAnalytics } from "./_components/content-analytics";
import { ContentCalendar } from "./_components/content-calendar";
import { ContentFilters, type DateRangeValue, type SortValue } from "./_components/content-filters";
import { ContentInventory } from "./_components/content-inventory";
import { ContentPerformance } from "./_components/content-performance";
import { ContentSummaryCards, type SummarySection } from "./_components/content-summary-cards";
import { ContentTabs } from "./_components/content-tabs";
import { LicensingRights } from "./_components/licensing-rights";
import { VideoList } from "./_components/video-list";
import { type ViewMode, ViewModeToggle } from "./_components/view-mode-toggle";
import {
  CONTENT_REGION_METRICS,
  type TabValue,
  normalizeContentRegion,
  scaleActionCount,
} from "./constants";

export type ContentSearchParams = {
  section?: SummarySection;
  region?: string;
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

const REGION_BOXES: RegionBoxOption[] = [
  { code: "all", label: "All regions" },
  ...MACRO_REGIONS.map((r) => ({ code: r.code, label: r.label })),
];

// Metric modes for the master-page grid — same treatment as the dashboard map.
const REGION_METRICS: RegionBoxMetric[] = [
  { key: "live", label: "Live videos", hue: 217, values: CONTENT_REGION_METRICS.liveVideos },
  { key: "views", label: "Views", hue: 270, values: CONTENT_REGION_METRICS.views },
  { key: "uploads", label: "Uploads this month", hue: 142, values: CONTENT_REGION_METRICS.uploads },
];

// Highest-priority content tasks — move admins from insight to action.
const contentActions = (region: ReturnType<typeof normalizeContentRegion>): RecommendedAction[] => [
  {
    title: `${scaleActionCount(8, region)} videos awaiting review`,
    detail: "In-review queue building up — assign a reviewer to keep the pipeline moving",
    severity: "high",
    cta: "Review queue",
    href: "/content?tab=requests",
  },
  {
    title: `${scaleActionCount(7, region)} licenses expiring ≤30 days`,
    detail: "Renew or archive to avoid content going dark",
    severity: "medium",
    cta: "View licenses",
    href: "/content?section=licensing",
  },
  {
    title: `${scaleActionCount(2, region)} rejected videos need follow-up`,
    detail: "Notify creators or re-submit with fixes",
    severity: "low",
    cta: "Open rejected",
    href: "/content?tab=rejected",
  },
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
    region: regionParam,
    page = "1",
    pageSize = "10",
  } = await searchParams;

  // Grid = macro-region lens, header dropdown = country drill. If a country is picked it
  // wins, and the grid highlights its parent macro-region as active (spec-05 §1.2).
  const region =
    country !== "all" ? regionForCountry(country) : normalizeContentRegion(regionParam);
  const scopeLabel = region === "all" ? undefined : regionLabel(region);

  // Calendar view on hold pending Adi (Sep 2 call) — see spec-05 §1.3.
  const CALENDAR_ENABLED = false;
  const showCalendar = CALENDAR_ENABLED && tab === "master" && viewMode === "calendar";

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
      <Suspense
        fallback={<div className="bg-muted/10 h-[110px] w-full animate-pulse rounded-xl" />}>
        <ContentSummaryCards activeSection={section} />
      </Suspense>

      {/* Regional lens — dashboard activity-map treatment; scopes everything below it */}
      <section className="border-border bg-card space-y-3 rounded-xl border p-4">
        <SectionHeading
          title="Regional Activity"
          subtitle="Heat by live videos, views, or uploads — click a region to scope the library below"
          icon={Globe}
        />
        <Suspense
          fallback={<div className="bg-muted/10 h-[130px] w-full animate-pulse rounded-lg" />}>
          <RegionBoxFilter
            active={region}
            options={REGION_BOXES}
            allCode="all"
            metrics={REGION_METRICS}
          />
        </Suspense>
      </section>

      {/* Expanded section area — belongs to the active card */}
      {section !== "none" && (
        <div className="border-primary/30 animate-fade-in space-y-6 border-l-2 pl-4">
          {section === "inventory" && (
            <>
              <ContentInventory region={region} regionLabel={scopeLabel} />

              {/* Recommended Actions — highest-priority content tasks (client: keep) */}
              <RecommendedActions actions={contentActions(region)} />

              {/* Video timeline — the primary working surface, owned by Content Inventory */}
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <ContentTabs activeTab={tab} region={region} />
                  <div className="flex flex-wrap items-center gap-2">
                    <ContentFilters searchQuery={q} sort={sort} range={range} />
                    {CALENDAR_ENABLED && tab === "master" && (
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
                      region={region}
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
                fallback={
                  <div className="bg-muted/20 h-[200px] w-full animate-pulse rounded-xl" />
                }>
                <ContentAnalytics />
              </Suspense>
            </>
          )}
        </div>
      )}
    </div>
  );
}
