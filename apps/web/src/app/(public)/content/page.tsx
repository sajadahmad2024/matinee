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
import { ContentFilters } from "./_components/content-filters";
import { ContentInventory } from "./_components/content-inventory";
import { ContentPerformance } from "./_components/content-performance";
import { ContentTabs } from "./_components/content-tabs";
import { ContentViewTabs } from "./_components/content-view-tabs";
import { LicensingRights } from "./_components/licensing-rights";
import { VideoList } from "./_components/video-list";
import type { TabValue } from "./constants";

export type ContentSearchParams = {
  view?: string;
  tab?: TabValue;
  country?: string;
  q?: string;
  page?: string;
  pageSize?: string;
};

interface PageProps {
  searchParams: Promise<ContentSearchParams>;
}

// Highest-priority content tasks — move admins from insight to action.
const CONTENT_ACTIONS: RecommendedAction[] = [
  { title: "8 videos awaiting review", detail: "In-review queue building up — assign a reviewer to keep the pipeline moving", severity: "high", cta: "Review queue", href: "/content?view=library&tab=requests" },
  { title: "7 licenses expiring ≤30 days", detail: "Renew or archive to avoid content going dark", severity: "medium", cta: "View licenses", href: "/content?view=analytics" },
  { title: "2 rejected videos need follow-up", detail: "Notify creators or re-submit with fixes", severity: "low", cta: "Open rejected", href: "/content?view=library&tab=rejected" },
];

export default async function ContentManagementPage({ searchParams }: PageProps) {
  const {
    view = "library",
    tab = "all",
    country = "all",
    q = "",
    page = "1",
    pageSize = "10",
  } = await searchParams;

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

      {/* Top-level split: operate (Library) vs report (Analytics) — no longer one long scroll */}
      <ContentViewTabs activeView={view} />

      {view === "library" ? (
        <>
          {/* Inventory snapshot */}
          <ContentInventory />

          {/* Recommended Actions — highest-priority content tasks */}
          <RecommendedActions actions={CONTENT_ACTIONS} />

          {/* Video library — the primary working surface */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <ContentTabs activeTab={tab} />
              <ContentFilters searchQuery={q} />
            </div>

            <Suspense
              fallback={<div className="bg-muted/10 h-[400px] w-full animate-pulse rounded-xl" />}>
              <VideoList
                tab={tab}
                searchQuery={q}
                page={Number(page)}
                pageSize={Number(pageSize)}
              />
            </Suspense>
          </div>
        </>
      ) : (
        <>
          {/* Analytics — licensing, performance, engagement (its own view, not stacked) */}
          <LicensingRights />
          <ContentPerformance />
          <Suspense
            fallback={<div className="bg-muted/20 h-[200px] w-full animate-pulse rounded-xl" />}>
            <ContentAnalytics />
          </Suspense>
        </>
      )}
    </div>
  );
}
