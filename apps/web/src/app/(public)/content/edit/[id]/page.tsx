import { Suspense } from "react";

import { mockContentFormData } from "../../constants";
import { VideoForm } from "../../new/_components/video-form";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditVideoPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="animate-fade-in pb-24">
      <Suspense
        fallback={<div className="bg-muted/20 h-[600px] w-full animate-pulse rounded-xl" />}>
        <VideoForm initialData={mockContentFormData(id)} />
      </Suspense>
    </div>
  );
}
