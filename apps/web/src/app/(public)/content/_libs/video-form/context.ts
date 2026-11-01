"use client";

import { createContext, useContext } from "react";

import type { VideoMediaUploads } from "./hooks/use-video-media-uploads";

/** Page state the step cards need beyond the form values. Provided by `VideoFormShell`. */
export interface VideoFormContextValue {
  /** The saved video's id — `null` in the add flow until the first save. */
  contentId: string | null;
  /** The page's Media step uploads (`useVideoMediaUploads`). */
  media: VideoMediaUploads;
}

export const VideoFormContext = createContext<VideoFormContextValue | null>(null);

export function useVideoFormContext() {
  const value = useContext(VideoFormContext);
  if (!value) throw new Error("Step cards must be rendered inside VideoFormShell");
  return value;
}
