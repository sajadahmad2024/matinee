import type { Metadata } from "next";

import { VideoAnalyticsClient } from "./_components/video-analytics-client";

export const metadata: Metadata = {
  title: "Video Analytics",
  description:
    "One video's performance for a chosen window: views, watch time, engagement, retention, traffic, audience, games and BTS.",
};

interface VideoAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoAnalyticsPage({ params }: VideoAnalyticsPageProps) {
  const { id } = await params;
  return <VideoAnalyticsClient id={decodeURIComponent(id)} />;
}
