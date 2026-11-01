import type { Metadata } from "next";

import { AdDetailsClient } from "./_components/ad-details-client";

export const metadata: Metadata = {
  title: "Ad Details",
  description: "One feed ad: its video, caption, button, regions, feed ranks and schedule.",
};

interface AdDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdDetailsPage({ params }: AdDetailsPageProps) {
  const { id } = await params;
  return <AdDetailsClient id={decodeURIComponent(id)} />;
}
