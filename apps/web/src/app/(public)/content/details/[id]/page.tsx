import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getVideoById } from "../../constants";
import { ContentDetailsView } from "./_components/content-details-view";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const video = getVideoById(decodeURIComponent(id));

  if (!video) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-foreground text-lg font-semibold">Video not found</p>
        <Button asChild variant="outline">
          <Link href={"/content" as Route}>Back to Content</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <ContentDetailsView video={video} />
    </div>
  );
}
