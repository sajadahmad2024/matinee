"use client";

import * as React from "react";
import { useRef, useState } from "react";

import { Check, Loader2, Upload } from "lucide-react";

import { Progress } from "@/components/ui/progress";

import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";

/** Backend cap on one upload (`RequestUploadDto.sizeBytes`). */
export const VIDEO_MAX_BYTES = 10 * 1024 * 1024 * 1024;

/** Why a picked file can't be uploaded as a video, or `null` when it can. */
export const videoFileError = (file: File): string | null => {
  if (!file.type.startsWith("video/")) return "Pick a video file";
  if (file.size > VIDEO_MAX_BYTES) return "The video must be 10 GB or smaller";
  return null;
};

const toMb = (bytes: number) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

export interface CustomVideoUploadProps {
  /** Called with the picked or dropped file; the caller validates and uploads it. */
  onFile: (file: File) => void;
  /** A file on its way up: name, size and progress (0–100). */
  pending?: { name: string; sizeBytes: number; progress: number } | null;
  /** The uploaded video; size is optional (a saved video may not know it). */
  uploaded?: { name: string; sizeBytes?: number | null } | null;
  /** Player shown under the uploaded file. */
  preview?: React.ReactNode;
  hint?: React.ReactNode;
  invalid?: boolean;
  className?: string;
}

/**
 * Video file picker shared by the content and ad forms: drop zone → upload progress → uploaded
 * file with Replace and a preview. Presentational — the caller owns validation and the upload.
 */
export function CustomVideoUpload({
  onFile,
  pending,
  uploaded,
  preview,
  hint = "MP4, MOV, AVI · 16:9 horizontal · up to 10GB",
  invalid,
  className,
}: CustomVideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const pickFile = () => inputRef.current?.click();

  const input = (
    <input
      type="file"
      ref={inputRef}
      accept="video/*"
      className="hidden"
      onChange={(e) => {
        const file = e.target.files?.[0];
        if (file) onFile(file);
        e.target.value = "";
      }}
    />
  );

  if (pending) {
    return (
      <div
        className={cn("border-border bg-background-tertiary/40 rounded-lg border p-4", className)}>
        <div className="flex items-center gap-3">
          <div className="bg-primary/15 flex h-12 w-12 items-center justify-center rounded-lg">
            <Loader2 className="text-primary h-6 w-6 animate-spin" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate font-medium">{pending.name}</p>
            <p className="text-muted-foreground text-xs">{toMb(pending.sizeBytes)}</p>
          </div>
        </div>
        <Progress value={pending.progress} className="mt-3 h-2" />
        <p className="text-muted-foreground mt-1 text-right text-xs">
          {pending.progress}% uploaded
        </p>
      </div>
    );
  }

  if (uploaded) {
    return (
      <div
        className={cn("border-success/50 bg-success/5 max-w-106 rounded-lg border p-4", className)}>
        {input}
        <div className="flex items-center gap-3">
          <div className="bg-success/20 flex h-12 w-12 items-center justify-center rounded-lg">
            <Check className="text-success h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-foreground truncate font-medium">{uploaded.name}</p>
            <p className="text-muted-foreground text-xs">
              {uploaded.sizeBytes != null ? `${toMb(uploaded.sizeBytes)} · uploaded` : "Uploaded"}
            </p>
          </div>
          <CustomButton variant="outline" size="sm" onClick={pickFile}>
            Replace
          </CustomButton>
        </div>
        {preview && <div className="mt-4">{preview}</div>}
      </div>
    );
  }

  return (
    <div
      onClick={pickFile}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) onFile(file);
      }}
      className={cn(
        "border-border hover:border-primary/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all",
        isDragging && "border-primary bg-primary/10",
        invalid && "border-destructive/60",
        className,
      )}>
      {input}
      <Upload className="text-foreground-muted mx-auto mb-3 h-10 w-10" />
      <p className="text-foreground-secondary">
        Drag & drop video file or <span className="text-primary">browse</span>
      </p>
      <p className="text-foreground-muted mt-1 text-xs">{hint}</p>
    </div>
  );
}
