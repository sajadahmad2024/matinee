import * as React from "react";

import Image from "next/image";

import { Film, ImageIcon, Play } from "lucide-react";

import type { ContentResponseDto } from "@/app/_libs/hooks/api/use-admin-content";
import { CustomButton } from "@/components/custom/custom-button";
import { DetailRow } from "@/components/custom/detail-row";

import { formatDuration } from "../../../../_components/listing/listing-config";
import { EMPTY } from "../../../../_shared/content-format";
import { DetailsCard } from "../details-card";
import { DETAILS_COPY } from "../details-config";

export interface MediaSectionProps {
  content: ContentResponseDto;
  /** Opens the player; only offered when a video is attached. */
  onPlay: () => void;
}

/** Wizard step 3: the video (played in the shared player modal) and its thumbnail. */
export const MediaSection: React.FC<MediaSectionProps> = ({ content, onPlay }) => {
  const hasVideo = !!content?.videoMediaId;
  const resolution =
    content?.videoWidth && content?.videoHeight
      ? `${content.videoWidth} × ${content.videoHeight}`
      : EMPTY;

  return (
    <DetailsCard title="Media Files" icon={Film}>
      <DetailRow label="Video">
        {hasVideo ? (
          <CustomButton
            variant="outline"
            size="sm"
            leftIcon={<Play className="h-4 w-4" />}
            onClick={onPlay}>
            Play video
          </CustomButton>
        ) : (
          DETAILS_COPY.noVideo
        )}
      </DetailRow>
      <DetailRow label="Thumbnail">
        <div className="border-border bg-background-tertiary relative aspect-video w-full max-w-sm overflow-hidden rounded-lg border">
          {content?.thumbnailUrl ? (
            <Image
              src={content.thumbnailUrl}
              alt={`${content?.title} thumbnail`}
              fill
              unoptimized
              sizes="384px"
              className="object-cover"
            />
          ) : (
            <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-2 text-xs">
              <ImageIcon className="h-6 w-6" />
              {DETAILS_COPY.noThumbnail}
            </div>
          )}
        </div>
      </DetailRow>
      <DetailRow label="Duration">{formatDuration(content?.durationSeconds)}</DetailRow>
      <DetailRow label="Resolution">{resolution}</DetailRow>
    </DetailsCard>
  );
};

MediaSection.displayName = "MediaSection";
