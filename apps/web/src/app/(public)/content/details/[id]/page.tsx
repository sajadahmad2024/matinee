import type { Metadata } from "next";

import { ContentDetailsClient } from "./_components/content-details-client";

export const metadata: Metadata = {
  title: "Video Details",
  description:
    "Read-only view of a video: details, rights, media, distribution, ad sales and change history.",
};

interface VideoDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailsPage({ params }: VideoDetailsPageProps) {
  const { id } = await params;
  return <ContentDetailsClient id={decodeURIComponent(id)} />;
}
