"use client";

import { Film } from "lucide-react";

import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CustomField } from "@/components/custom/custom-field";
import { GlassCard } from "@/components/custom/glass-card";

import { ThumbnailUpload } from "./thumbnail-upload";
import { VideoUploadZone } from "./video-upload-zone";

const LABEL_CLASS = "text-foreground text-sm font-medium";

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
        <CustomField label="Video File" className="space-y-3" labelClassName={LABEL_CLASS}>
          <VideoUploadZone />
        </CustomField>

        {/* Thumbnail Section */}
        <CustomField label="Video Thumbnail" className="space-y-3" labelClassName={LABEL_CLASS}>
          <ThumbnailUpload />
        </CustomField>
      </CardContent>
    </GlassCard>
  );
}
