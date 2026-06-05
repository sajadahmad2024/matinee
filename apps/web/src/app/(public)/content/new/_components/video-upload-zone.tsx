"use client";

import { useRef, useState } from "react";

import { Check, Loader2, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { cn } from "@/app/_libs/utils/cn";

interface VideoUploadZoneProps {
  onFileSelect?: (file: File) => void;
  accept?: string;
  maxSize?: string;
}

export function VideoUploadZone({
  onFileSelect,
  accept = "video/*",
  maxSize = "10GB",
}: VideoUploadZoneProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    onFileSelect?.(selectedFile);

    // Simulate upload progress
    setIsUploading(true);
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setIsUploading(false);
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files?.[0];
          if (selectedFile) handleFileSelect(selectedFile);
        }}
      />

      {file ? (
        <div className="border-success/50 bg-success/5 rounded-lg border p-4">
          <div className="flex items-center gap-3">
            <div className="bg-success/20 flex h-12 w-12 items-center justify-center rounded-lg">
              {isUploading ? (
                <Loader2 className="text-success h-6 w-6 animate-spin" />
              ) : (
                <Check className="text-success h-6 w-6" />
              )}
            </div>
            <div className="flex-1">
              <p className="text-foreground font-medium">{file.name}</p>
              <p className="text-muted-foreground text-xs">
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} className="h-8 w-8">
              <X className="h-4 w-4" />
            </Button>
          </div>
          {isUploading && (
            <div className="mt-3">
              <Progress value={uploadProgress} className="h-2" />
              <p className="text-muted-foreground mt-1 text-right text-xs">
                {uploadProgress}% uploaded
              </p>
            </div>
          )}
        </div>
      ) : (
        <div
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={cn(
            "border-border hover:border-primary/50 cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-all",
            isDragging ? "border-primary bg-primary/10" : "",
          )}>
          <Upload className="text-foreground-muted mx-auto mb-3 h-10 w-10" />
          <p className="text-foreground-secondary">
            Drag & drop video file or <span className="text-primary">browse</span>
          </p>
          <p className="text-foreground-muted mt-1 text-xs">MP4, MOV, AVI up to {maxSize}</p>
        </div>
      )}
    </div>
  );
}
