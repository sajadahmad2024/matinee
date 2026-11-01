"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";
import { cn } from "@/app/_libs/utils/cn";

interface QuestBannerFieldProps {
  /** The banner's media id; `null` when there's none. */
  value: string | null;
  onChange: (mediaId: string | null) => void;
  /** Reports an upload in progress, so the form can hold its submit until it lands. */
  onUploadingChange: (uploading: boolean) => void;
  /** The saved banner's URL (`QuestDto.bannerUrl`; null until the asset is ready). */
  savedUrl?: string | null;
  disabled?: boolean;
}

/**
 * The quest's app banner: uploads on pick (`useMediaUpload`, usage `banner`) and keeps its media
 * id. A just-picked image previews from the local file; a saved one from the quest's `bannerUrl`.
 * Remove clears it (`bannerMediaId: null` on update).
 */
export function QuestBannerField({
  value,
  onChange,
  onUploadingChange,
  savedUrl,
  disabled,
}: QuestBannerFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mediaUploadMutation } = useMediaUpload();
  const isUploading = mediaUploadMutation.isPending;

  // the picked file previews at once; the saved URL applies while the saved banner is still the value
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const previewUrl = localUrl ?? (value ? savedUrl : null);

  useEffect(() => onUploadingChange(isUploading), [isUploading, onUploadingChange]);
  useEffect(() => () => void (localUrl && URL.revokeObjectURL(localUrl)), [localUrl]);

  const upload = (file?: File) => {
    if (!file || disabled || isUploading) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Pick an image file");
      return;
    }
    setLocalUrl(URL.createObjectURL(file));
    mediaUploadMutation.mutate(
      { file, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.Banner },
      {
        onSuccess: (uploaded) => onChange(uploaded?.id ?? null),
        onError: (error) => {
          setLocalUrl(null);
          toast.error(error.message);
        },
      },
    );
  };

  const pick = () => !disabled && !isUploading && inputRef.current?.click();

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          upload(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      {previewUrl || value ? (
        <div className="group border-border/50 relative aspect-[16/7] overflow-hidden rounded-lg border">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Quest banner"
              fill
              unoptimized
              sizes="640px"
              className={cn("object-cover", isUploading && "opacity-50")}
            />
          ) : (
            // saved, but the asset isn't ready yet (no URL)
            <div className="text-muted-foreground flex h-full items-center justify-center text-sm">
              Banner set — preview not ready yet
            </div>
          )}
          {isUploading ? (
            <Loader2 className="text-primary absolute top-2 right-2 h-5 w-5 animate-spin" />
          ) : (
            !disabled && (
              <div className="bg-background/60 absolute inset-0 flex items-center justify-center gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={pick}
                  className="bg-background/80 text-foreground cursor-pointer rounded px-2 py-1 text-xs">
                  Replace
                </button>
                <button
                  type="button"
                  aria-label="Remove banner"
                  onClick={() => {
                    setLocalUrl(null);
                    onChange(null);
                  }}
                  className="bg-background/80 text-foreground hover:text-destructive flex cursor-pointer items-center rounded px-1.5">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            upload(e.dataTransfer.files?.[0]);
          }}
          className="border-border/60 hover:border-accent/50 hover:bg-muted/20 flex aspect-[16/7] w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors disabled:cursor-not-allowed disabled:opacity-50">
          <ImagePlus className="text-muted-foreground h-6 w-6" />
          <span className="text-muted-foreground text-sm">Drag &amp; drop or browse</span>
          <span className="text-muted-foreground text-xs">PNG or JPG, wide (16:7)</span>
        </button>
      )}
    </>
  );
}
