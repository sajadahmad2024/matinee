"use client";

import { useRef } from "react";

import Image from "next/image";

import { ImagePlus, Loader2, X } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";

import { useMedia } from "@/app/_libs/hooks/api/use-media-upload";
import type { ContentCreateFormValues } from "@/app/_libs/schemas";
import { cn } from "@/app/_libs/utils/cn";

import { useVideoFormContext } from "../../../_libs/video-form/context";

/**
 * Sponsor logo (square, shown in a corner of the video): uploads on pick. Removing it is fine —
 * every sponsorship save replaces the active one, so a missing `bannerMediaId` clears it.
 */
export function SponsorBannerUpload() {
  const { control, setValue } = useFormContext<ContentCreateFormValues>();
  const banner = useWatch({ control, name: "sponsorship.banner" });
  const { uploadBanner, pendingBannerUrl } = useVideoFormContext().media;
  const inputRef = useRef<HTMLInputElement>(null);

  // A saved banner (edit) carries only its id — read its URL from the media row.
  const { media: savedBanner } = useMedia(banner && !banner.previewUrl ? banner.mediaId : null);
  const previewUrl = pendingBannerUrl ?? (banner?.previewUrl || savedBanner?.url);
  const isUploading = !!pendingBannerUrl;

  const pickFile = () => !isUploading && inputRef.current?.click();

  return (
    <div className="space-y-1.5">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadBanner(file);
          e.target.value = "";
        }}
      />

      {previewUrl || banner ? (
        <div className="group border-border/50 relative size-28 shrink-0 overflow-hidden rounded-lg border">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Sponsor logo"
              fill
              unoptimized
              sizes="112px"
              className={cn("object-contain", isUploading && "opacity-50")}
            />
          ) : (
            // Saved, but no preview URL (not public / still processing).
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Logo set
            </div>
          )}
          {isUploading ? (
            <Loader2 className="text-primary absolute top-2 right-2 h-5 w-5 animate-spin" />
          ) : (
            <div className="bg-background/60 absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                onClick={pickFile}
                className="bg-background/80 text-foreground cursor-pointer rounded px-2 py-1 text-xs">
                Replace
              </button>
              <button
                type="button"
                aria-label="Remove logo"
                onClick={() => setValue("sponsorship.banner", null, { shouldDirty: true })}
                className="bg-background/80 text-foreground hover:text-destructive flex cursor-pointer items-center rounded px-1.5">
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={pickFile}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files[0];
            if (file) uploadBanner(file);
          }}
          className="border-border hover:border-primary/50 text-muted-foreground flex size-28 shrink-0 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-2 text-xs transition-colors">
          <ImagePlus className="h-6 w-6" />
          <span>
            Drop or <span className="text-primary">browse</span>
          </span>
        </button>
      )}
      <p className="text-muted-foreground text-xs">
        Square (1:1) · the &ldquo;Sponsored by&rdquo; logo shown in a corner of the video
      </p>
    </div>
  );
}
