"use client";

import { useFormContext, useWatch } from "react-hook-form";

import { useMedia } from "@/app/_libs/hooks/api/use-media-upload";
import type { ContentCreateFormValues } from "@/app/_libs/schemas";
import { CustomVideoPlayer } from "@/components/custom/custom-video-player";
import { CustomVideoUpload } from "@/components/custom/custom-video-upload";
import { MediaVideoPlayer } from "@/components/custom/media-video-player";

import { useVideoFormContext } from "../../../_libs/video-form/context";

/** Video file: uploads on pick; once uploaded it can be replaced (the backend can't clear it). */
export function VideoUploadZone() {
  const { control } = useFormContext<ContentCreateFormValues>();
  const video = useWatch({ control, name: "video" });
  const { uploadVideo, pendingVideo, videoProgress, localVideo } = useVideoFormContext().media;
  // A saved video (edit) carries only its id — read its name and size from the media row.
  const { media: savedVideo } = useMedia(video && !video.fileName ? video.mediaId : null);

  return (
    <CustomVideoUpload
      onFile={uploadVideo}
      pending={
        pendingVideo
          ? { name: pendingVideo.name, sizeBytes: pendingVideo.size, progress: videoProgress }
          : null
      }
      uploaded={
        video
          ? {
              name: video.fileName || savedVideo?.originalFilename || "Current video",
              sizeBytes: video.sizeBytes || (savedVideo?.fileSizeBytes ?? 0),
            }
          : null
      }
      preview={
        // Just picked → play the local file; saved earlier → the processed stream. Sized like a
        // phone screen (~390px wide, 16:9), so it previews as it plays in the app's feed.
        video &&
        (localVideo?.mediaId === video.mediaId ? (
          <CustomVideoPlayer src={localVideo.url} kind="file" />
        ) : (
          <MediaVideoPlayer mediaId={video.mediaId} />
        ))
      }
    />
  );
}
