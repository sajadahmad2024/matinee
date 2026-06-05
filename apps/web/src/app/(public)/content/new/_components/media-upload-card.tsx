"use client";

import { useState } from "react";

import { Film, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../games/_components/glass-card";
import { type BTSContent, BTSModal } from "./bts-modal";
import { ThumbnailUpload } from "./thumbnail-upload";
import { VideoUploadZone } from "./video-upload-zone";

interface MediaUploadCardProps {
  btsContent: BTSContent[];
  onAddBTS: (bts: BTSContent) => void;
  onRemoveBTS: (id: string) => void;
}

export function MediaUploadCard({ btsContent, onAddBTS, onRemoveBTS }: MediaUploadCardProps) {
  const [btsModalOpen, setBtsModalOpen] = useState(false);

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

        {/* BTS Section */}
        <div className="border-border border-t pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <Label className="text-foreground text-sm font-medium">Behind the Scenes (BTS)</Label>
              <p className="text-muted-foreground text-xs">
                Add exclusive clips or bloopers to reward players
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setBtsModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Add BTS
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {btsContent.map((bts) => (
              <div
                key={bts.id}
                className="bg-background-secondary border-border group relative flex items-center gap-3 rounded-lg border p-3">
                <div className="bg-accent/10 text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded">
                  <Film className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-foreground truncate text-sm font-medium">{bts.name}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {bts.type}
                    </Badge>
                    <span className="text-muted-foreground text-[10px]">
                      {bts.unlockCriteria.points} pts
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onRemoveBTS(bts.id)}
                  className="text-destructive hover:bg-destructive/10 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {btsContent.length === 0 && (
            <div className="text-foreground-secondary py-4 text-center text-sm italic">
              No BTS content added yet
            </div>
          )}
        </div>

        <BTSModal open={btsModalOpen} onOpenChange={setBtsModalOpen} onAdd={onAddBTS} />
      </CardContent>
    </GlassCard>
  );
}
