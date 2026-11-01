"use client";

import { useState } from "react";

import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";
import type { ContentCreateFormValues } from "@/app/_libs/schemas";
import { videoFileError } from "@/components/custom/custom-video-upload";

const uploadFailed = (what: string) => (error: Error) =>
  toast.error(`The ${what} didn't upload`, { description: error?.message });

/**
 * The form's uploads — Media step video + thumbnail, and the Ad Sales sponsor banner. A picked
 * file uploads right away and its media id goes into the form, where the step's save sends it. Called by the page (not the card) so an upload keeps going while the
 * user is on another step.
 */
export function useVideoMediaUploads(form: UseFormReturn<ContentCreateFormValues>) {
  const { mediaUploadMutation: videoMutation, progress: videoProgress } = useMediaUpload();
  const { mediaUploadMutation: thumbnailMutation } = useMediaUpload();
  const { mediaUploadMutation: bannerMutation } = useMediaUpload();
  // The file being uploaded — shown until the form holds the finished upload.
  const [pendingVideo, setPendingVideo] = useState<File | null>(null);
  // The picked video as a local URL — playable right away, before processing finishes.
  const [localVideo, setLocalVideo] = useState<{ mediaId: string; url: string } | null>(null);
  const [pendingThumbnailUrl, setPendingThumbnailUrl] = useState<string | null>(null);
  const [pendingBannerUrl, setPendingBannerUrl] = useState<string | null>(null);

  const uploadVideo = (file: File) => {
    const invalid = videoFileError(file);
    if (invalid) return toast.error(invalid);

    setPendingVideo(file);
    videoMutation.mutate(
      { file, mediaType: MediaTypeEnum.Video, usageType: MediaUsageEnum.ContentVideo },
      {
        onSuccess: (media) => {
          form.setValue(
            "video",
            { mediaId: media?.id, fileName: file.name, sizeBytes: file.size },
            { shouldDirty: true },
          );
          setLocalVideo((previous) => {
            if (previous) URL.revokeObjectURL(previous.url);
            return { mediaId: media?.id, url: URL.createObjectURL(file) };
          });
        },
        onError: uploadFailed("video"),
        onSettled: () => setPendingVideo(null),
      },
    );
  };

  const uploadThumbnail = (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");

    const previewUrl = URL.createObjectURL(file);
    setPendingThumbnailUrl(previewUrl);
    thumbnailMutation.mutate(
      { file, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.ContentThumbnail },
      {
        onSuccess: (media) =>
          form.setValue("thumbnail", { mediaId: media?.id, previewUrl }, { shouldDirty: true }),
        onError: uploadFailed("thumbnail"),
        onSettled: () => setPendingThumbnailUrl(null),
      },
    );
  };

  const uploadBanner = (file: File) => {
    if (!file.type.startsWith("image/")) return toast.error("Pick an image file");

    const previewUrl = URL.createObjectURL(file);
    setPendingBannerUrl(previewUrl);
    bannerMutation.mutate(
      { file, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.Banner },
      {
        onSuccess: (media) =>
          form.setValue(
            "sponsorship.banner",
            { mediaId: media?.id, previewUrl },
            { shouldDirty: true },
          ),
        onError: uploadFailed("sponsor banner"),
        onSettled: () => setPendingBannerUrl(null),
      },
    );
  };

  return {
    uploadVideo,
    uploadBanner,
    uploadThumbnail,
    pendingVideo,
    videoProgress,
    localVideo,
    pendingThumbnailUrl,
    pendingBannerUrl,
    isUploading: videoMutation.isPending || thumbnailMutation.isPending || bannerMutation.isPending,
  };
}

export type VideoMediaUploads = ReturnType<typeof useVideoMediaUploads>;
