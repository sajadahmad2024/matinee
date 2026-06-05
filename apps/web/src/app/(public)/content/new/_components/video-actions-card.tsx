"use client";

import { Calendar, Rocket, Save, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

interface VideoActionsCardProps {
  isPublished?: boolean;
  onSaveDraft?: () => void;
  onRequestApproval?: () => void;
  onSchedule?: () => void;
  onPublish?: () => void;
  onUpdate?: () => void;
  onBoost?: () => void;
}

export function VideoActionsCard({
  isPublished,
  onSaveDraft,
  onRequestApproval,
  onSchedule,
  onPublish,
  onUpdate,
  onBoost,
}: VideoActionsCardProps) {
  return (
    <GlassCard className="sticky top-20">
      <CardHeader>
        <CardTitle className="text-foreground">Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {!isPublished ? (
          <>
            <Button variant="outline" className="w-full justify-start" onClick={onSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onRequestApproval}>
              <Send className="mr-2 h-4 w-4" />
              Request Approval
            </Button>
            <Button variant="outline" className="w-full justify-start" onClick={onSchedule}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule
            </Button>
            <Separator />
            <Button className="w-full" onClick={onPublish}>
              <Rocket className="mr-2 h-4 w-4" />
              Publish Now
            </Button>
          </>
        ) : (
          <>
            <Button className="w-full" onClick={onUpdate}>
              <Save className="mr-2 h-4 w-4" />
              Update Video
            </Button>
            <Button
              variant="outline"
              className="text-featured! hover:bg-featured/10 border-featured! w-full justify-start border"
              onClick={onBoost}>
              <Rocket className="text-featured mr-2 h-4 w-4" />
              Boost Content
            </Button>
          </>
        )}
      </CardContent>
    </GlassCard>
  );
}
