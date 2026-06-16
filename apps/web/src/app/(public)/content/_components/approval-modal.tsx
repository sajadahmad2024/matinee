"use client";

import { useState } from "react";

import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "approve" | "reject";
  title: string;
}

// Review → publish (or reject with reason) for submitted content.
export function ApprovalModal({ open, onOpenChange, mode, title }: ApprovalModalProps) {
  const [when, setWhen] = useState<"now" | "schedule">("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [reason, setReason] = useState("");

  const confirm = () => {
    if (mode === "approve") {
      toast.success(
        when === "now" ? `Approved & published "${title}"` : `Approved — scheduled "${title}" for ${scheduleDate}`,
      );
    } else {
      toast.success(`Rejected "${title}"`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {mode === "approve" ? (
              <CheckCircle2 className="text-success h-5 w-5" />
            ) : (
              <XCircle className="text-destructive h-5 w-5" />
            )}
            {mode === "approve" ? "Approve & publish" : "Reject submission"}
          </DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        {mode === "approve" ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Publish</Label>
              <div className="bg-muted/30 inline-flex rounded-lg p-1">
                {(["now", "schedule"] as const).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWhen(w)}
                    className={`rounded-md px-3 py-1 text-sm capitalize transition-colors ${
                      when === w ? "bg-background text-foreground" : "text-muted-foreground"
                    }`}>
                    {w === "now" ? "Now" : "Schedule"}
                  </button>
                ))}
              </div>
            </div>
            {when === "schedule" && (
              <div className="space-y-2">
                <Label>Go-live date</Label>
                <Input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
              </div>
            )}
            <p className="text-muted-foreground text-xs">
              Approving moves the submission to the team to enrich metadata, then publishes.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>Rejection reason</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this being rejected? (shared with the submitter)"
              rows={3}
            />
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            onClick={confirm}
            disabled={mode === "reject" && !reason.trim()}
            className={mode === "reject" ? "bg-destructive hover:bg-destructive/90" : ""}>
            {mode === "approve" ? "Approve & publish" : "Reject"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
