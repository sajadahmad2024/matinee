"use client";

import { useEffect, useRef, useState } from "react";

import Image from "next/image";

import { ImageIcon, Loader2, Upload, X } from "lucide-react";
import { toast } from "sonner";

import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";
import { cn } from "@/app/_libs/utils/cn";

interface BadgeIconFieldProps {
  /** "Active" (earned) or "Inactive" (locked). */
  label: string;
  /** The icon's media id; `null` when there's none. */
  value: string | null;
  onChange: (mediaId: string | null) => void;
  /** The saved icon's CDN URL from `BadgeDto` (null until the asset is ready). */
  savedUrl?: string | null;
  /** Reports an upload in progress, so the form can hold its submit until it lands. */
  onUploadingChange: (uploading: boolean) => void;
  /** Accent styling for the earned-state slot, muted for the locked one. */
  accent?: boolean;
  disabled?: boolean;
}

/**
 * One badge icon slot: uploads on pick (`useMediaUpload`, usage `badge_icon`) and keeps its media
 * id. A just-picked image previews from the local file; a saved one from the badge's icon URL.
 */
export function BadgeIconField({
  label,
  value,
  onChange,
  savedUrl,
  onUploadingChange,
  accent,
  disabled,
}: BadgeIconFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { mediaUploadMutation } = useMediaUpload();
  const isUploading = mediaUploadMutation.isPending;

  const [localUrl, setLocalUrl] = useState<string | null>(null);
  // the saved URL only applies while the saved icon is still the value (not replaced or removed)
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
      { file, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.BadgeIcon },
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
    <div className="flex items-center gap-2">
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
      <div className="group relative">
        <button
          type="button"
          onClick={pick}
          disabled={disabled}
          aria-label={
            value ? `Replace ${label.toLowerCase()} icon` : `Upload ${label.toLowerCase()} icon`
          }
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            upload(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "relative flex h-12 w-12 cursor-pointer items-center justify-center overflow-hidden rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50",
            value || localUrl ? "border-border" : "border-dashed",
            accent
              ? "bg-accent/10 border-accent/30 hover:border-accent/60"
              : "bg-muted/50 border-border hover:border-foreground/30",
          )}>
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt={`${label} icon`}
              fill
              unoptimized
              sizes="48px"
              className={cn("object-contain p-1", isUploading && "opacity-50")}
            />
          ) : value ? (
            // saved, but the asset isn't ready yet (no URL)
            <ImageIcon className="text-muted-foreground h-5 w-5" />
          ) : (
            <Upload className={cn("h-5 w-5", accent ? "text-accent" : "text-muted-foreground")} />
          )}
          {isUploading && <Loader2 className="text-primary absolute h-5 w-5 animate-spin" />}
        </button>
        {value && !isUploading && !disabled && (
          <button
            type="button"
            aria-label={`Remove ${label.toLowerCase()} icon`}
            onClick={() => {
              setLocalUrl(null);
              onChange(null);
            }}
            className="bg-background border-border text-muted-foreground hover:text-destructive absolute -top-1.5 -right-1.5 flex h-5 w-5 cursor-pointer items-center justify-center rounded-full border opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100">
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <span className="text-muted-foreground text-xs">{label}</span>
    </div>
  );
}
