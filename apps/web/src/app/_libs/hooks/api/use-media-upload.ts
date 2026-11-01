"use client";

import { useState } from "react";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  type MediaDto,
  MediaDtoStatusEnum,
  type RequestUploadDtoMediaTypeEnum,
  type RequestUploadDtoUsageTypeEnum,
} from "@/app/_libs/api/generated";
import { mediaUrl, registerFile } from "@/app/_libs/api/sdk/_demo/media-store";
import { mediaApi } from "@/app/_libs/api/sdk/media-api";
import { MEDIA_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type { MediaDto, PlaybackDto } from "@/app/_libs/api/generated";
export {
  MediaDtoStatusEnum as MediaStatusEnum,
  PlaybackDtoKindEnum as PlaybackKindEnum,
  RequestUploadDtoMediaTypeEnum as MediaTypeEnum,
  RequestUploadDtoUsageTypeEnum as MediaUsageEnum,
} from "@/app/_libs/api/generated";

export interface MediaUploadInput {
  file: File;
  mediaType: RequestUploadDtoMediaTypeEnum;
  /** What the asset is for — drives its default access tier (e.g. `studio_logo` is public). */
  usageType: RequestUploadDtoUsageTypeEnum;
  altText?: string;
}

/*
 * UI demo build: uploads stay in this browser tab. The real hook asks the API for a presigned
 * target and PUTs the file to storage; here the picked file is registered locally
 * (`_demo/media-store`) and plays from its object URL wherever the API would return a CDN URL.
 */
const DEMO_UPLOAD_STEPS = 5;
const DEMO_STEP_MS = 120;

/**
 * Media upload — same contract as the real hook: resolves with the media row, whose `id` goes on
 * the owning resource (`bannerMediaId`, `activeIconMediaId`, `videoMediaId`, …).
 */
export const useMediaUpload = () => {
  const [progress, setProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: async ({ file, mediaType, usageType, altText }: MediaUploadInput) => {
      setProgress(0);
      for (let step = 1; step <= DEMO_UPLOAD_STEPS; step++) {
        await new Promise((resolve) => setTimeout(resolve, DEMO_STEP_MS));
        setProgress(Math.round((step / DEMO_UPLOAD_STEPS) * 100));
      }
      const id = registerFile(file);
      const media: MediaDto = {
        id,
        mediaType: mediaType as unknown as MediaDto["mediaType"],
        usageType: usageType as unknown as MediaDto["usageType"],
        accessLevel: "public" as MediaDto["accessLevel"],
        status: MediaDtoStatusEnum.Ready,
        mimeType: file.type,
        originalFilename: file.name,
        fileSizeBytes: file.size,
        isHls: false,
        altText: altText ?? null,
        createdAt: new Date().toISOString(),
        url: mediaUrl(id),
      };
      return media;
    },
  });

  return { mediaUploadMutation: mutation, progress };
};

/** Statuses on the way to `ready` — worth polling while the transcoder works. */
const IN_PROGRESS_STATUSES: string[] = [
  MediaDtoStatusEnum.Pending,
  MediaDtoStatusEnum.Uploading,
  MediaDtoStatusEnum.Uploaded,
  MediaDtoStatusEnum.Processing,
];
const PROCESSING_POLL_MS = 5000;

/**
 * One media row — status, file name, size and (for public, ready assets) its URL. Used to show a
 * saved file whose details aren't on the owning resource. `id` empty → no request.
 * `pollWhileProcessing` refetches until the asset is ready (or failed).
 */
export const useMedia = (id?: string | null, { pollWhileProcessing = false } = {}) => {
  const query = useQuery({
    queryKey: MEDIA_QUERY_KEYS.detail(id ?? ""),
    queryFn: () => mediaApi.mediaControllerGetByIdV1({ id: id ?? "" }),
    enabled: !!id,
    refetchInterval: (q) =>
      pollWhileProcessing && IN_PROGRESS_STATUSES.includes(q.state.data?.data?.status ?? "")
        ? PROCESSING_POLL_MS
        : false,
  });

  return { mediaQuery: query, media: query?.data?.data };
};

/**
 * Signed playback for a ready asset: an HLS master (with CDN cookies when protected) or a file
 * URL. Only call once the media is `ready` — the API rejects anything else.
 */
export const useMediaPlayback = (id?: string | null) => {
  const query = useQuery({
    queryKey: MEDIA_QUERY_KEYS.playback(id ?? ""),
    queryFn: () => mediaApi.mediaControllerGetPlaybackV1({ id: id ?? "" }),
    enabled: !!id,
    // The grant expires; fetch a fresh one each time the player opens.
    staleTime: 0,
    gcTime: 0,
  });

  return { playbackQuery: query, playback: query?.data?.data };
};
