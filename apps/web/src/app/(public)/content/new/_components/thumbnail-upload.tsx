"use client";

import { useRef, useState } from "react";

import { Check, Image, X } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

interface ThumbnailUploadProps {
  onSelect?: (file: File, preview: string) => void;
}

export function ThumbnailUpload({ onSelect }: ThumbnailUploadProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [customPreview, setCustomPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Mock auto-generated thumbnails
  const autoThumbnails = [
    { id: 1, time: "00:15" },
    { id: 2, time: "01:30" },
    { id: 3, time: "05:45" },
  ];

  const handleCustomUpload = (file: File) => {
    if (file.type.startsWith("image/")) {
      const preview = URL.createObjectURL(file);
      setCustomPreview(preview);
      setSelectedIndex(null);
      onSelect?.(file, preview);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleCustomUpload(file);
  };

  const selectAutoThumbnail = (index: number) => {
    setSelectedIndex(index);
    setCustomPreview(null);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={inputRef}
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleCustomUpload(file);
        }}
      />

      <div className="grid grid-cols-4 gap-3">
        {/* Auto-generated thumbnails */}
        {autoThumbnails.map((thumb, index) => (
          <div
            key={thumb.id}
            onClick={() => selectAutoThumbnail(index)}
            className={cn(
              "bg-background-tertiary hover:border-primary/50 border-border relative flex aspect-[9/16] cursor-pointer items-center justify-center rounded-lg border-2 transition-all",
              selectedIndex === index ? "border-primary ring-primary/30 ring-2" : "",
            )}>
            <div className="text-center">
              <span className="text-2xl">🎬</span>
              <p className="text-muted-foreground mt-1 text-xs">{thumb.time}</p>
            </div>
            {selectedIndex === index && (
              <div className="bg-primary absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full">
                <Check className="text-primary-foreground h-3 w-3" />
              </div>
            )}
          </div>
        ))}

        {/* Custom upload */}
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border-border hover:border-primary/50 relative flex aspect-[9/16] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-all",
            customPreview ? "border-success bg-success/5" : "",
            isDragging ? "border-primary bg-primary/10" : "",
          )}>
          {customPreview ? (
            <>
              <img
                src={customPreview}
                alt="Custom thumbnail"
                className="h-full w-full rounded-lg object-cover"
              />
              <div className="bg-success absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full">
                <Check className="text-success-foreground h-3 w-3" />
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="bg-background/80 absolute right-1 bottom-1 h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  setCustomPreview(null);
                }}>
                <X className="h-3 w-3" />
              </Button>
            </>
          ) : (
            <>
              <Image className="text-foreground-muted mb-1 h-5 w-5" />
              <span className="text-foreground-muted text-xs">Custom</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
