import { Suspense } from "react";
import { FormatDetailsClient } from "../_components/format-details-client";

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function GameFormatDetailsPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const { tab = "settings" } = await searchParams;

  return (
    <div className="animate-fade-in pb-24">
      <Suspense fallback={<div className="h-[600px] w-full animate-pulse rounded-xl bg-muted/20" />}>
        <FormatDetailsClient id={id} tab={tab} />
      </Suspense>
    </div>
  );
}
