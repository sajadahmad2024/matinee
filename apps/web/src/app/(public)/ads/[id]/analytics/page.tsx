import type { Metadata } from "next";

import { AdAnalyticsClient } from "./_components/ad-analytics-client";

export const metadata: Metadata = {
  title: "Ad Analytics",
  description:
    "One feed ad's delivery for a chosen window: impressions, reach, clicks, completion and pacing.",
};

interface AdAnalyticsPageProps {
  params: Promise<{ id: string }>;
}

export default async function AdAnalyticsPage({ params }: AdAnalyticsPageProps) {
  const { id } = await params;
  return <AdAnalyticsClient id={decodeURIComponent(id)} />;
}
