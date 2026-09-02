"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TablePagination } from "@/components/custom/table-pagination";

import {
  CONTENT_TABS_CONFIG,
  isMasterVideo,
  MOCK_VIDEOS,
  parseMockDate,
  PENDING_VIDEOS,
  REJECTED_VIDEOS,
  type TabValue,
  type VideoItem,
} from "../constants";
import type { DateRangeValue, SortValue } from "./content-filters";
import { VideoListItem } from "./video-list-item";

// Fixed per page-load — mock date filtering needs no live clock (and render must stay pure).
const NOW = Date.now();

interface VideoListProps {
  tab: TabValue;
  searchQuery: string;
  sort: SortValue;
  range: DateRangeValue;
  page: number;
  pageSize: number;
}

export function VideoList({ tab, searchQuery, sort, range, page, pageSize }: VideoListProps) {
  const router = useRouter();

  const getFilteredVideos = (): VideoItem[] => {
    let videos: VideoItem[] = [];

    switch (tab) {
      case "requests":
        videos = PENDING_VIDEOS;
        break;
      case "master":
        // live OR scheduled — one scrolling list
        videos = MOCK_VIDEOS.filter(isMasterVideo);
        break;
      case "drafts":
        videos = MOCK_VIDEOS.filter((v) => v.status === "draft");
        break;
      case "scheduled":
        videos = MOCK_VIDEOS.filter((v) => v.status === "scheduled");
        break;
      case "boosted":
        videos = MOCK_VIDEOS.filter((v) => v.status === "boosted");
        break;
      case "rejected":
        videos = REJECTED_VIDEOS;
        break;
      case "archived":
        videos = MOCK_VIDEOS.filter((v) => v.status === "archived");
        break;
      default:
        // Live — published/boosted/live only (not drafts/scheduled/archived)
        videos = MOCK_VIDEOS.filter(
          (v) => v.status !== "draft" && v.status !== "scheduled" && v.status !== "archived",
        );
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      videos = videos.filter(
        (v) => v.title.toLowerCase().includes(q) || v.studioName.toLowerCase().includes(q),
      );
    }

    // Upload-date filter
    if (range !== "all") {
      const days = range === "30d" ? 30 : 90;
      const cutoff = NOW - days * 24 * 60 * 60 * 1000;
      videos = videos.filter((v) => {
        const uploaded = parseMockDate(v.uploadDate);
        return uploaded ? uploaded.getTime() >= cutoff : true; // items without an upload date stay
      });
    }

    return applySort(videos, sort, tab);
  };

  const filteredVideos = getFilteredVideos();
  const totalItems = filteredVideos.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const paginatedVideos = filteredVideos.slice((page - 1) * pageSize, page * pageSize);

  const activeTabConfig = CONTENT_TABS_CONFIG.find((t) => t.value === tab);

  if (totalItems === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        {activeTabConfig && (
          <activeTabConfig.icon className="text-foreground-muted mb-4 h-12 w-12" />
        )}
        <h3 className="text-foreground mb-2 text-lg font-semibold">No videos found</h3>
        <p className="text-foreground-secondary max-w-sm">
          {searchQuery
            ? "Try adjusting your search terms"
            : `No videos in ${activeTabConfig?.label.toLowerCase() || "this category"} yet`}
        </p>
        {!searchQuery && tab === "all" && (
          <Button className="mt-4" onClick={() => router.push("/content/new" as Route)}>
            <Plus className="mr-2 h-4 w-4" />
            Upload Your First Video
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {paginatedVideos.map((video) => (
          <VideoListItem
            key={video.id}
            video={video}
            variant={tab === "master" ? "master" : "default"}
            onEdit={(id) => router.push(`/content/details/${id}` as Route)}
            onAnalytics={(id) => router.push(`/content/analytics/${id}` as Route)}
          />
        ))}
      </div>

      <TablePagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={totalItems}
        onPageChange={(p) => {
          const params = new URLSearchParams(window.location.search);
          params.set("page", p.toString());
          router.push(`${window.location.pathname}?${params.toString()}` as Route, { scroll: false });
        }}
        onPageSizeChange={(s) => {
          const params = new URLSearchParams(window.location.search);
          params.set("pageSize", s.toString());
          params.set("page", "1");
          router.push(`${window.location.pathname}?${params.toString()}` as Route, { scroll: false });
        }}
      />
    </div>
  );
}

function applySort(videos: VideoItem[], sort: SortValue, tab: TabValue): VideoItem[] {
  if (sort === "most-viewed") return [...videos].sort((a, b) => b.views - a.views);
  if (sort === "least-viewed") return [...videos].sort((a, b) => a.views - b.views);

  // "Newest" default. Master tab leads with what's coming up:
  // scheduled first by scheduledAt ascending, then live by upload date descending.
  if (tab === "master") {
    const scheduled = videos
      .filter((v) => v.status === "scheduled")
      .sort(
        (a, b) =>
          (parseMockDate(a.scheduledAt)?.getTime() ?? 0) -
          (parseMockDate(b.scheduledAt)?.getTime() ?? 0),
      );
    const live = videos
      .filter((v) => v.status !== "scheduled")
      .sort(
        (a, b) =>
          (parseMockDate(b.uploadDate)?.getTime() ?? 0) -
          (parseMockDate(a.uploadDate)?.getTime() ?? 0),
      );
    return [...scheduled, ...live];
  }

  return [...videos].sort(
    (a, b) =>
      (parseMockDate(b.uploadDate)?.getTime() ?? 0) - (parseMockDate(a.uploadDate)?.getTime() ?? 0),
  );
}
