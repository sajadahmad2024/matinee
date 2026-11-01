"use client";

import * as React from "react";
import { useState } from "react";

import { useRouter } from "next/navigation";

import { FileQuestion } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ApiError } from "@/app/_libs/api/api-error";
import { useContentFull } from "@/app/_libs/hooks/api/use-admin-content";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { EmptyState } from "@/components/custom/empty-state";

import { VIDEO_FORM_STEPS, VideoFormStep } from "../../../_libs/video-form/steps";
import { CONTENT_ROUTES } from "../../../_shared/content-config";
import { VideoPlayerModal } from "../../../_shared/video-player/video-player-modal";
import { ChangeHistoryCard } from "./change-history-card";
import { ContentDetailsHeader } from "./content-details-header";
import { ContentStatusBanner } from "./content-status-banner";
import { DETAILS_COPY } from "./details-config";
import { AdSalesSection } from "./sections/ad-sales-section";
import { DetailsSection } from "./sections/details-section";
import { DistributionSection } from "./sections/distribution-section";
import { MediaSection } from "./sections/media-section";
import { RightsSection } from "./sections/rights-section";

export interface ContentDetailsClientProps {
  id: string;
}

/** A missing video (404), or an id the API rejects as malformed (400). */
const isNotFound = (error: unknown) =>
  error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 400);

/**
 * Read-only view of one video (`GET /:id/full`, shared with the edit page's cache) — header +
 * status, one tab per wizard step, change history. Editing and status changes happen at
 * /content/edit/[id] and on the list card.
 */
export const ContentDetailsClient: React.FC<ContentDetailsClientProps> = ({ id }) => {
  const router = useRouter();
  const [playerOpen, setPlayerOpen] = useState(false);
  const { contentFullQuery, contentFull } = useContentFull(id);

  if (contentFullQuery?.isPending) return <ContentDetailsSkeleton />;

  if (isNotFound(contentFullQuery?.error)) {
    return (
      <EmptyState
        icon={<FileQuestion className="text-foreground-muted h-10 w-10" />}
        title={DETAILS_COPY.notFound}
        description={DETAILS_COPY.notFoundDescription}
        actionLabel={DETAILS_COPY.backLabel}
        onAction={() => router.push(CONTENT_ROUTES.LIST)}
      />
    );
  }

  if (contentFullQuery?.isError || !contentFull) {
    return (
      <CustomRetryState
        title={DETAILS_COPY.loadError}
        description={contentFullQuery?.error?.message || DETAILS_COPY.loadErrorFallback}
        onRetry={() => contentFullQuery?.refetch()}
        isRetrying={contentFullQuery?.isRefetching}
      />
    );
  }

  const { content, license, sponsorship, adPerformance, regions, history, linkedGames } =
    contentFull;

  return (
    <div className="animate-fade-in space-y-6">
      <ContentDetailsHeader content={content} />
      <ContentStatusBanner content={content} />

      <Tabs defaultValue={VideoFormStep.Details} className="space-y-4">
        <TabsList className="bg-background-secondary h-auto flex-wrap p-1">
          {VIDEO_FORM_STEPS.map((step) => (
            <TabsTrigger key={step.key} value={step.key} className="cursor-pointer gap-2">
              <step.icon className="h-4 w-4" />
              {step.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={VideoFormStep.Details}>
          <DetailsSection content={content} />
        </TabsContent>
        <TabsContent value={VideoFormStep.Rights}>
          <RightsSection license={license} />
        </TabsContent>
        <TabsContent value={VideoFormStep.Media}>
          <MediaSection content={content} onPlay={() => setPlayerOpen(true)} />
        </TabsContent>
        <TabsContent value={VideoFormStep.Distribution}>
          <DistributionSection content={content} regions={regions} linkedGames={linkedGames} />
        </TabsContent>
        <TabsContent value={VideoFormStep.AdSales}>
          <AdSalesSection sponsorship={sponsorship} adPerformance={adPerformance} />
        </TabsContent>
      </Tabs>

      <ChangeHistoryCard history={history} />

      {content?.videoMediaId && (
        <VideoPlayerModal
          open={playerOpen}
          onOpenChange={setPlayerOpen}
          title={content?.title}
          mediaId={content.videoMediaId}
          poster={content?.thumbnailUrl}
        />
      )}
    </div>
  );
};

ContentDetailsClient.displayName = "ContentDetailsClient";

/** Header, tabs and a card's worth of placeholder while the video loads. */
const ContentDetailsSkeleton = () => (
  <div className="space-y-6" aria-busy="true" aria-label="Loading video">
    <div className="space-y-2">
      <div className="bg-muted h-4 w-28 animate-pulse rounded" />
      <div className="bg-muted h-8 w-2/3 max-w-md animate-pulse rounded" />
      <div className="bg-muted h-4 w-48 animate-pulse rounded" />
    </div>
    <div className="bg-muted h-10 w-full max-w-xl animate-pulse rounded-lg" />
    <div className="bg-muted h-96 w-full animate-pulse rounded-xl" />
  </div>
);
