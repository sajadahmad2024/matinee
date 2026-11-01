"use client";

import { AlertTriangle, Loader2 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import {
  MediaStatusEnum,
  useMedia,
  useMediaPlayback,
} from "@/app/_libs/hooks/api/use-media-upload";
import { cn } from "@/app/_libs/utils/cn";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { CustomVideoPlayer } from "@/components/custom/custom-video-player";

interface MediaVideoPlayerProps {
  /** The saved video's media id. */
  mediaId: string;
  poster?: string;
  autoPlay?: boolean;
  className?: string;
}

const FRAME_CLASS =
  "bg-background-tertiary/40 border-border flex aspect-video w-full flex-col items-center justify-center gap-3 rounded-lg border p-6 text-center";

/**
 * Plays a saved video by its media id: waits for processing (polling `GET /media/:id`), then
 * asks for signed playback (`GET /media/:id/playback`).
 */
export function MediaVideoPlayer({ mediaId, poster, autoPlay, className }: MediaVideoPlayerProps) {
  const { mediaQuery, media } = useMedia(mediaId, { pollWhileProcessing: true });
  const isReady = media?.status === MediaStatusEnum.Ready;
  const { playbackQuery, playback } = useMediaPlayback(isReady ? mediaId : null);

  if (mediaQuery?.isPending || (isReady && playbackQuery?.isPending)) {
    return (
      <div className={cn(FRAME_CLASS, className)}>
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
      </div>
    );
  }

  const failedQuery = mediaQuery?.isError ? mediaQuery : playbackQuery?.isError && playbackQuery;
  if (failedQuery) {
    return (
      <CustomRetryState
        className={cn(FRAME_CLASS, className)}
        title="Couldn't load the video"
        description={failedQuery?.error?.message || "Please try again."}
        onRetry={() => failedQuery?.refetch()}
        isRetrying={failedQuery?.isRefetching}
      />
    );
  }

  if (media?.status === MediaStatusEnum.Failed) {
    return (
      <div className={cn(FRAME_CLASS, className)}>
        <AlertTriangle className="text-destructive h-6 w-6" />
        <p className="text-foreground text-sm font-medium">Processing failed</p>
        <p className="text-muted-foreground text-xs">Upload the video again to retry.</p>
      </div>
    );
  }

  if (!isReady || !playback) {
    const progress = media?.processingProgress;
    return (
      <div className={cn(FRAME_CLASS, className)}>
        <Loader2 className="text-primary h-6 w-6 animate-spin" />
        <p className="text-foreground text-sm font-medium">
          Processing{progress != null ? `… ${progress}%` : "…"}
        </p>
        {progress != null && <Progress value={progress} className="h-1.5 w-48" />}
        <p className="text-muted-foreground text-xs">
          The video becomes playable once processing finishes.
        </p>
      </div>
    );
  }

  return (
    <CustomVideoPlayer
      src={playback.url}
      kind={playback.kind}
      cookies={playback.cookies}
      poster={poster}
      autoPlay={autoPlay}
      className={className}
    />
  );
}
