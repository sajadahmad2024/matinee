"use client";

import { FileText } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";
import { BannerUpload } from "@/app/(public)/games/format/_components/shared/banner-upload";

interface ExperienceDetailsCardProps {
  title: string;
  description: string;
  image: string | null;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onImageChange: (v: string | null) => void;
}

export function ExperienceDetailsCard({
  title,
  description,
  image,
  onTitleChange,
  onDescriptionChange,
  onImageChange,
}: ExperienceDetailsCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <FileText className="text-primary h-4 w-4" /> Details
        </CardTitle>
        <CardDescription>Clarify what the winner is getting.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="exp-title">Title</Label>
          <Input
            id="exp-title"
            value={title}
            placeholder="e.g. A Day on Set with the Director"
            onChange={(e) => onTitleChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="exp-description">Description</Label>
          <Textarea
            id="exp-description"
            value={description}
            rows={3}
            placeholder="What exactly does the winner get? Travel, guests, timing…"
            onChange={(e) => onDescriptionChange(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>Banner image</Label>
          <BannerUpload
            value={image}
            onChange={onImageChange}
            hint="16:6 · shown on the reward card in the app"
          />
        </div>
      </CardContent>
    </GlassCard>
  );
}
