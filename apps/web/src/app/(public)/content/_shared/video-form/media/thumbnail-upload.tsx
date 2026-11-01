"use client";

import { useRef, useState } from "react";

import Image from "next/image";

import { Check, ImageIcon, Loader2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { useMedia } from "@/app/_libs/hooks/api/use-media-upload";
import type { ContentCreateFormValues } from "@/app/_libs/schemas";
import { cn } from "@/app/_libs/utils/cn";

import { useVideoFormContext } from "../../../_libs/video-form/context";

/**
 * Custom thumbnail: uploads on pick; click again to replace (the backend can't clear it).
 * Transcoder posters / stills need a processed video, so they're picked in edit mode.
 */
export function ThumbnailUpload() {
  const { control } = useFormContext<ContentCreateFormValues>();
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const { uploadThumbnail, pendingThumbnailUrl } = useVideoFormContext().media;
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // A saved thumbnail (edit) without a URL — read it from the media row.
  const { media: savedThumbnail } = useMedia(
    thumbnail && !thumbnail.previewUrl ? thumbnail.mediaId : null,
  );
  const previewUrl = pendingThumbnailUrl ?? (thumbnail?.previewUrl || savedThumbnail?.url);
  const isUploading = !!pendingThumbnailUrl;

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadThumbnail(file);
          e.target.value = "";
        }}
      />

      <div
        role="button"
        tabIndex={0}
        aria-label={previewUrl ? "Replace thumbnail" : "Upload thumbnail"}
        onClick={() => !isUploading && inputRef.current?.click()}
        onKeyDown={(e) => {
          if (!isUploading && (e.key === "Enter" || e.key === " ")) inputRef.current?.click();
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          const file = e.dataTransfer.files[0];
          if (file && !isUploading) uploadThumbnail(file);
        }}
        className={cn(
          "border-border hover:border-primary/50 group relative flex aspect-video w-full max-w-xs cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all",
          thumbnail && !isUploading && "border-success border-solid",
          isDragging && "border-primary bg-primary/10",
          isUploading && "cursor-wait",
        )}>
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Thumbnail"
              fill
              unoptimized
              sizes="320px"
              className={cn("object-cover", isUploading && "opacity-50")}
            />
            <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full">
              {isUploading ? (
                <Loader2 className="text-primary h-4 w-4 animate-spin" />
              ) : (
                <span className="bg-success flex h-5 w-5 items-center justify-center rounded-full">
                  <Check className="text-success-foreground h-3 w-3" />
                </span>
              )}
            </div>
            {!isUploading && (
              <span className="bg-background/80 text-foreground absolute bottom-1.5 left-1.5 rounded px-2 py-0.5 text-xs opacity-0 transition-opacity group-hover:opacity-100">
                Click to replace
              </span>
            )}
          </>
        ) : thumbnail ? (
          // Saved, but no preview yet (still processing) — still replaceable.
          <>
            <Check className="text-success mb-1 h-5 w-5" />
            <span className="text-foreground-secondary text-sm">Thumbnail set</span>
            <span className="text-foreground-muted text-xs">Click to replace</span>
          </>
        ) : (
          <>
            <ImageIcon className="text-foreground-muted mb-1 h-6 w-6" />
            <span className="text-foreground-secondary text-sm">
              Drop an image or <span className="text-primary">browse</span>
            </span>
            <span className="text-foreground-muted text-xs">16:9 recommended</span>
          </>
        )}
      </div>
    </div>
  );
}
