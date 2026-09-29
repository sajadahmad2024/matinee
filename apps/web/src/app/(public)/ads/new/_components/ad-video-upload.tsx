"use client";

import { useEffect, useRef } from "react";

import { Loader2, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/app/_libs/utils/cn";

import { AD_VIDEO_MAX_SECS } from "../../constants";

export interface AdVideo {
  state: "empty" | "uploading" | "ready" | "error";
  src: string | null;
  fileName?: string;
  durationSecs: number;
  progress: number;
  error?: string;
}

export const EMPTY_VIDEO: AdVideo = { state: "empty", src: null, durationSecs: 0, progress: 0 };

// 9:16 = 0.5625 — allow a little encoder slack
const RATIO_MIN = 0.54;
const RATIO_MAX = 0.585;

function readMeta(file: File): Promise<{ duration: number; ratio: number; url: string }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => resolve({ duration: v.duration, ratio: v.videoWidth / v.videoHeight, url });
    v.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("unreadable"));
    };
    v.src = url;
  });
}

/** Checks the real file (9:16, ≤ 60s), then mocks the upload with a progress bar. */
export function AdVideoUpload({ value, onChange }: { value: AdVideo; onChange: (v: AdVideo) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const fail = (fileName: string, error: string) => onChange({ ...EMPTY_VIDEO, state: "error", fileName, error });

  const handleFile = async (file?: File) => {
    if (!file) return;
    let meta: Awaited<ReturnType<typeof readMeta>>;
    try {
      meta = await readMeta(file);
    } catch {
      return fail(file.name, "Couldn't read this video. Use MP4 or MOV.");
    }
    if (meta.ratio < RATIO_MIN || meta.ratio > RATIO_MAX) {
      URL.revokeObjectURL(meta.url);
      return fail(file.name, "The video must be vertical 9:16 (e.g. 1080×1920).");
    }
    if (meta.duration > AD_VIDEO_MAX_SECS + 0.5) {
      URL.revokeObjectURL(meta.url);
      return fail(file.name, `The video must be ${AD_VIDEO_MAX_SECS}s or shorter.`);
    }

    const base = { src: meta.url, fileName: file.name, durationSecs: Math.round(meta.duration) };
    timers.current.forEach(clearTimeout);
    timers.current = [10, 30, 55, 80, 100].map((p, i) =>
      setTimeout(() => onChange({ ...base, state: p === 100 ? "ready" : "uploading", progress: p }), (i + 1) * 350),
    );
    onChange({ ...base, state: "uploading", progress: 0 });
  };

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="video/mp4,video/quicktime"
        className="hidden"
        onChange={(e) => {
          void handleFile(e.target.files?.[0]);
          e.target.value = "";
        }}
      />

      {value.src && value.state !== "error" ? (
        <div className="flex items-start gap-4">
          <video src={value.src} controls muted playsInline className="aspect-[9/16] w-28 rounded-md bg-black object-cover" />
          <div className="min-w-0 space-y-2 text-sm">
            <p className="text-foreground truncate">{value.fileName}</p>
            {value.state === "uploading" ? (
              <div className="w-40 space-y-1">
                <Progress value={value.progress} className="h-1.5" />
                <p className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Loader2 className="h-3 w-3 animate-spin" /> Uploading…
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground text-xs">{value.durationSecs}s · 9:16</p>
            )}
            <Button type="button" variant="outline" size="sm" onClick={() => inputRef.current?.click()}>
              Replace
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            void handleFile(e.dataTransfer.files?.[0]);
          }}
          className={cn(
            "border-border/60 hover:border-primary/60 flex w-full flex-col items-center gap-1 rounded-lg border border-dashed px-4 py-8 text-center",
            value.state === "error" && "border-destructive/60",
          )}>
          <Upload className="text-muted-foreground h-6 w-6" />
          <span className="text-foreground text-sm">Upload video</span>
          <span className="text-muted-foreground text-xs">Vertical 9:16 · MP4 or MOV · up to {AD_VIDEO_MAX_SECS}s</span>
        </button>
      )}
      {value.state === "error" && <p className="text-destructive text-xs">{value.fileName}: {value.error}</p>}
    </div>
  );
}
