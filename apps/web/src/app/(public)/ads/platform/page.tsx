import { PlatformAdsView } from "./_components/platform-ads-view";

interface PageProps {
  searchParams: Promise<{ tab?: string }>;
}

export default async function PlatformAdsPage({ searchParams }: PageProps) {
  await searchParams;
  return <PlatformAdsView />;
}
