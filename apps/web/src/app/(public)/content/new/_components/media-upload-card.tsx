"use client";

import { Film } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../games/_components/glass-card";
import { ThumbnailUpload } from "./thumbnail-upload";
import { VideoUploadZone } from "./video-upload-zone";

export function MediaUploadCard() {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Film className="h-5 w-5" />
          Media Files
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Upload Section */}
        <div className="space-y-3">
          <Label className="text-foreground text-sm font-medium">Video File</Label>
          <VideoUploadZone />
        </div>

        {/* Thumbnail Section */}
        <div className="space-y-3">
          <Label className="text-foreground text-sm font-medium">Video Thumbnail</Label>
          <ThumbnailUpload />
        </div>
      </CardContent>
    </GlassCard>
  );
}
