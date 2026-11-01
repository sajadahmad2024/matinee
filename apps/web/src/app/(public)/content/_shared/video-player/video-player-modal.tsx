"use client";

import { CustomModal } from "@/components/custom/custom-modal";
import { MediaVideoPlayer } from "@/components/custom/media-video-player";

interface VideoPlayerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  /** The video's media id (`videoMediaId`). */
  mediaId: string;
  poster?: string | null;
}

/** Watch a saved video in a modal — the list's ▶ button. */
export function VideoPlayerModal({
  open,
  onOpenChange,
  title,
  mediaId,
  poster,
}: VideoPlayerModalProps) {
  return (
    <CustomModal open={open} onOpenChange={onOpenChange} title={title} size="xl">
      {/* Mounted only while open, so closing stops playback and the next open re-signs. */}
      {open && <MediaVideoPlayer mediaId={mediaId} poster={poster ?? undefined} autoPlay />}
    </CustomModal>
  );
}
