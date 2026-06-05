"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { TablePagination } from "@/components/custom/table-pagination";

import {
  CONTENT_TABS_CONFIG,
  MOCK_VIDEOS,
  PENDING_VIDEOS,
  REJECTED_VIDEOS,
  TabValue,
  VideoItem,
} from "../constants";
import { LeaderboardModal } from "./leaderboard-modal";
import { VideoListItem } from "./video-list-item";

interface VideoListProps {
  tab: TabValue;
  searchQuery: string;
  page: number;
  pageSize: number;
}

export function VideoList({ tab, searchQuery, page, pageSize }: VideoListProps) {
  const router = useRouter();
  const [leaderboardModal, setLeaderboardModal] = useState<{ isOpen: boolean; videoTitle: string }>(
    {
      isOpen: false,
      videoTitle: "",
    },
  );

  const getFilteredVideos = (): VideoItem[] => {
    let videos: VideoItem[] = [];

    switch (tab) {
      case "requests":
        videos = PENDING_VIDEOS;
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

    return videos;
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
            onEdit={(id) => router.push(`/content/details/${id}` as Route)}
            onAnalytics={(id) => router.push(`/content/analytics/${id}` as Route)}
            onLeaderboards={(id) => {
              const v = filteredVideos.find((v) => v.id === id);
              setLeaderboardModal({ isOpen: true, videoTitle: v?.title || "" });
            }}
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
          router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }}
        onPageSizeChange={(s) => {
          const params = new URLSearchParams(window.location.search);
          params.set("pageSize", s.toString());
          params.set("page", "1");
          router.push(`${window.location.pathname}?${params.toString()}`, { scroll: false });
        }}
      />

      <LeaderboardModal
        isOpen={leaderboardModal.isOpen}
        onClose={() => setLeaderboardModal({ isOpen: false, videoTitle: "" })}
        videoTitle={leaderboardModal.videoTitle}
      />
    </div>
  );
}
