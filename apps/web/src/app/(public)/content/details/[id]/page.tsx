import { Suspense } from "react";

import { VideoForm } from "../../new/_components/video-form";
import { ChangeHistoryCard } from "./_components/change-history-card";
import { VideoComments } from "./_components/video-comments";

interface PageProps {
  params: Promise<{ id: string }>;
}

const mockHistory = [
  {
    id: "1",
    admin: "John Owner",
    role: "Owner",
    action: "Published video",
    timestamp: "2026-01-21 14:32 UTC",
  },
  {
    id: "2",
    admin: "Sarah Admin",
    role: "Super Admin",
    action: "Updated metadata",
    timestamp: "2026-01-21 12:15 UTC",
  },
  {
    id: "3",
    admin: "Mike Content",
    role: "Admin",
    action: "Uploaded video file",
    timestamp: "2026-01-20 18:45 UTC",
  },
  {
    id: "4",
    admin: "Mike Content",
    role: "Admin",
    action: "Created draft",
    timestamp: "2026-01-20 16:30 UTC",
  },
];

export default async function VideoDetailsPage({ params }: PageProps) {
  const { id } = await params;

  // In the future: const video = await fetchVideo(id);
  const mockInitialData = {
    id,
    title: "K-Drama Romance: Episode 1",
    studioName: "Seoul Studios",
    description: "An epic romance story...",
    genre: "drama",
    tags: "romance, korean, drama, love",
    cast: ["Actor A", "Actor B"],
    isPublished: id === "1",
  };

  return (
    <div className="animate-fade-in pb-24">
      <Suspense
        fallback={<div className="bg-muted/20 h-[600px] w-full animate-pulse rounded-xl" />}>
        <VideoForm
          initialData={mockInitialData}
          sidebar={
            <div className="space-y-6">
              <VideoComments videoId={id} />
              <ChangeHistoryCard history={mockHistory} />
            </div>
          }
        />
      </Suspense>
    </div>
  );
}
