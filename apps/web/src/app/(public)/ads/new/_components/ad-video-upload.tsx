"use client";

import { useEffect, useState } from "react";

import { toast } from "sonner";

import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";
import { CustomVideoPlayer } from "@/components/custom/custom-video-player";
import { CustomVideoUpload, videoFileError } from "@/components/custom/custom-video-upload";
import { MediaVideoPlayer } from "@/components/custom/media-video-player";

export interface AdCreative {
  creativeMediaId: string | null;
  durationSeconds: number | null;
}

interface AdVideoUploadProps {
  value: AdCreative;
  onChange: (value: AdCreative) => void;
  /** Lets the form block saving while a file is still uploading. */
  onUploadingChange?: (uploading: boolean) => void;
  invalid?: boolean;
}

/** The video's length for `durationSeconds`; `null` when the browser can't read it. */
function readDuration(file: File): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    const done = (duration: number | null) => {
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    v.onloadedmetadata = () => done(Number.isFinite(v.duration) ? Math.round(v.duration) : null);
    v.onerror = () => done(null);
    v.src = url;
  });
}

/**
 * The ad's creative, on the same upload component and rules as a content video. A picked file
 * uploads right away (`useMediaUpload`, usage `generic`: playable by the feed, unlike content
 * videos) and its media id goes into the form. The backend only books an ad once the video has
 * finished processing, so saving straight after an upload can come back "not ready yet".
 */
export function AdVideoUpload({ value, onChange, onUploadingChange, invalid }: AdVideoUploadProps) {
  const { mediaUploadMutation, progress } = useMediaUpload();
  const [pending, setPending] = useState<File | null>(null);
  // the file picked in this session — playable locally; an existing ad only has its media id
  const [local, setLocal] = useState<{ url: string; name: string; sizeBytes: number } | null>(null);

  useEffect(() => () => void (local && URL.revokeObjectURL(local.url)), [local]);
  const uploading = mediaUploadMutation?.isPending ?? false;
  useEffect(() => onUploadingChange?.(uploading), [onUploadingChange, uploading]);

  const handleFile = async (file: File) => {
    const error = videoFileError(file);
    if (error) return toast.error(error);

    const durationSeconds = await readDuration(file);
    setPending(file);
    mediaUploadMutation.mutate(
      { file, mediaType: MediaTypeEnum.Video, usageType: MediaUsageEnum.Generic },
      {
        onSuccess: (media) => {
          if (!media?.id) return void toast.error("The video didn't upload");
          setLocal({ url: URL.createObjectURL(file), name: file.name, sizeBytes: file.size });
          onChange({ creativeMediaId: media.id, durationSeconds });
        },
        onError: (err) => toast.error("The video didn't upload", { description: err?.message }),
        onSettled: () => setPending(null),
      },
    );
  };

  return (
    <CustomVideoUpload
      onFile={(file) => void handleFile(file)}
      pending={pending ? { name: pending.name, sizeBytes: pending.size, progress } : null}
      uploaded={
        value?.creativeMediaId
          ? { name: local?.name ?? "Current video", sizeBytes: local?.sizeBytes ?? null }
          : null
      }
      preview={
        local ? (
          <CustomVideoPlayer src={local.url} kind="file" />
        ) : value?.creativeMediaId ? (
          <MediaVideoPlayer mediaId={value.creativeMediaId} />
        ) : null
      }
      invalid={invalid}
      // empty drop zone grows to the card's height with its prompt centred
      className={
        !pending && !value?.creativeMediaId
          ? "flex flex-1 flex-col items-center justify-center"
          : undefined
      }
    />
  );
}
