"use client";

import { useRef, useState } from "react";

import { ImagePlus, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

interface BannerUploadProps {
  value?: string | null;
  onChange?: (url: string | null) => void;
  /** Tailwind aspect class for the app widget shape. */
  aspect?: string;
  hint?: string;
}

/** App-widget banner uploader (drag/drop or browse). Mock — object URL preview only. */
export function BannerUpload({
  value = null,
  onChange,
  aspect = "aspect-[16/6]",
  hint = "16:6 · shown as the widget banner in the app",
}: BannerUploadProps) {
  const [preview, setPreview] = useState<string | null>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const setFile = (file?: File) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    onChange?.(url);
  };

  if (preview) {
    return (
      <div className={cn("group relative overflow-hidden rounded-lg border border-border/50", aspect)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={preview} alt="Banner preview" className="h-full w-full object-cover" />
        <Button
          type="button"
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => {
            setPreview(null);
            onChange?.(null);
          }}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => {
        e.preventDefault();
        setFile(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "border-border/60 hover:border-accent/50 hover:bg-muted/20 flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed transition-colors",
        aspect,
      )}>
      <ImagePlus className="text-muted-foreground h-6 w-6" />
      <span className="text-muted-foreground text-sm">Drag &amp; drop or browse</span>
      <span className="text-muted-foreground text-xs">{hint}</span>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => setFile(e.target.files?.[0] ?? undefined)}
      />
    </button>
  );
}
