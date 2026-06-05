"use client";

import { useRef, useState } from "react";

import { Check, Film, Image, Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { cn } from "@/app/_libs/utils/cn";

interface BTSModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave?: (bts: BTSContent) => void;
}

export interface BTSContent {
  id: string;
  name: string;
  description: string;
  videoFile: File | null;
  thumbnailFile: File | null;
  videoPreview: string | null;
  thumbnailPreview: string | null;
}

export function BTSModal({ open, onOpenChange, onSave }: BTSModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isDraggingVideo, setIsDraggingVideo] = useState(false);
  const [isDraggingThumbnail, setIsDraggingThumbnail] = useState(false);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  const handleVideoSelect = (file: File) => {
    if (file.type.startsWith("video/")) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handleThumbnailSelect = (file: File) => {
    if (file.type.startsWith("image/")) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleDrop = (e: React.DragEvent, type: "video" | "thumbnail") => {
    e.preventDefault();
    if (type === "video") {
      setIsDraggingVideo(false);
    } else {
      setIsDraggingThumbnail(false);
    }

    const file = e.dataTransfer.files[0];
    if (file) {
      if (type === "video") {
        handleVideoSelect(file);
      } else {
        handleThumbnailSelect(file);
      }
    }
  };

  const handleSave = () => {
    if (name && onSave) {
      onSave({
        id: crypto.randomUUID(),
        name,
        description,
        videoFile,
        thumbnailFile,
        videoPreview,
        thumbnailPreview,
      });
    }
    resetForm();
    onOpenChange(false);
  };

  const resetForm = () => {
    setName("");
    setDescription("");
    setVideoFile(null);
    setThumbnailFile(null);
    setVideoPreview(null);
    setThumbnailPreview(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        if (!open) resetForm();
        onOpenChange(open);
      }}>
      <DialogContent className="max-w-2xl!">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Film className="text-accent h-5 w-5" />
            Add Behind The Scenes Content
          </DialogTitle>
          <DialogDescription>
            Upload BTS content with its own title, description, and media
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Name & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bts-name">BTS Name</Label>
              <Input
                id="bts-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Making of Scene 5"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bts-desc">Description</Label>
              <Input
                id="bts-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description..."
              />
            </div>
          </div>

          {/* Video Upload */}
          <div className="space-y-2">
            <Label>BTS Video</Label>
            <input
              type="file"
              ref={videoInputRef}
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleVideoSelect(file);
              }}
            />
            <div
              onClick={() => videoInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingVideo(true);
              }}
              onDragLeave={() => setIsDraggingVideo(false)}
              onDrop={(e) => handleDrop(e, "video")}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all",
                isDraggingVideo
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50",
                videoFile && "border-success bg-success/5",
              )}>
              {videoFile ? (
                <div className="flex max-w-full min-w-0 items-center justify-center gap-3 px-2">
                  <Check className="text-success h-5 w-5 shrink-0" />
                  <span
                    className="text-foreground max-w-[300px] min-w-0 truncate font-medium"
                    title={videoFile.name}>
                    {videoFile.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setVideoFile(null);
                      setVideoPreview(null);
                    }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <>
                  <Upload className="text-muted-foreground mx-auto mb-2 h-8 w-8" />
                  <p className="text-foreground-secondary">
                    Drag & drop video or <span className="text-accent">browse</span>
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">MP4, MOV, AVI up to 5GB</p>
                </>
              )}
            </div>
          </div>

          {/* Thumbnail Upload */}
          <div className="space-y-2">
            <Label>BTS Thumbnail</Label>
            <input
              type="file"
              ref={thumbnailInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleThumbnailSelect(file);
              }}
            />
            <div
              onClick={() => thumbnailInputRef.current?.click()}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingThumbnail(true);
              }}
              onDragLeave={() => setIsDraggingThumbnail(false)}
              onDrop={(e) => handleDrop(e, "thumbnail")}
              className={cn(
                "cursor-pointer rounded-lg border-2 border-dashed p-4 text-center transition-all",
                isDraggingThumbnail
                  ? "border-accent bg-accent/10"
                  : "border-border hover:border-accent/50",
                thumbnailFile && "border-success bg-success/5",
              )}>
              {thumbnailPreview ? (
                <div className="flex max-w-full min-w-0 items-center justify-center gap-3 px-2">
                  <img
                    src={thumbnailPreview}
                    alt="Thumbnail preview"
                    className="h-10 w-16 shrink-0 rounded object-cover"
                  />
                  <span
                    className="text-foreground max-w-[300px] min-w-0 truncate font-medium"
                    title={thumbnailFile?.name}>
                    {thumbnailFile?.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      setThumbnailFile(null);
                      setThumbnailPreview(null);
                    }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3">
                  <Image className="text-muted-foreground h-6 w-6" />
                  <p className="text-foreground-secondary text-sm">
                    Upload thumbnail or <span className="text-accent">browse</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!name}>
            <Film className="mr-2 h-4 w-4" />
            Add BTS Content
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
