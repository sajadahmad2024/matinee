"use client";

import { useState } from "react";

import { CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";

interface ApprovalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "approve" | "reject";
  title: string;
}

const PUBLISH_WHEN = ["now", "schedule"] as const;

// Review → publish (or reject with reason) for submitted content.
export function ApprovalModal({ open, onOpenChange, mode, title }: ApprovalModalProps) {
  const [when, setWhen] = useState<(typeof PUBLISH_WHEN)[number]>("now");
  const [scheduleDate, setScheduleDate] = useState("");
  const [reason, setReason] = useState("");

  const isApprove = mode === "approve";

  const confirm = () => {
    if (isApprove) {
      toast.success(
        when === "now"
          ? `Approved & published "${title}"`
          : `Approved — scheduled "${title}" for ${scheduleDate}`,
      );
    } else {
      toast.success(`Rejected "${title}"`);
    }
    onOpenChange(false);
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      appearance="default"
      className="border-border bg-card max-w-md"
      titleClassName="flex items-center gap-2"
      title={
        <>
          {isApprove ? (
            <CheckCircle2 className="text-success h-5 w-5" />
          ) : (
            <XCircle className="text-destructive h-5 w-5" />
          )}
          {isApprove ? "Approve & publish" : "Reject submission"}
        </>
      }
      description={title}
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirm}
            disabled={!isApprove && !reason.trim()}
            className={isApprove ? "" : "bg-destructive hover:bg-destructive/90"}>
            {isApprove ? "Approve & publish" : "Reject"}
          </Button>
        </>
      }>
      {isApprove ? (
        <div className="space-y-4">
          <CustomField label="Publish">
            <div className="bg-muted/30 inline-flex rounded-lg p-1">
              {PUBLISH_WHEN.map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setWhen(w)}
                  aria-pressed={when === w}
                  className={`rounded-md px-3 py-1 text-sm capitalize transition-colors ${
                    when === w ? "bg-background text-foreground" : "text-muted-foreground"
                  }`}>
                  {w === "now" ? "Now" : "Schedule"}
                </button>
              ))}
            </div>
          </CustomField>
          {when === "schedule" && (
            <CustomField label="Go-live date" htmlFor="approval-go-live">
              <Input
                id="approval-go-live"
                type="date"
                value={scheduleDate}
                onChange={(e) => setScheduleDate(e.target.value)}
              />
            </CustomField>
          )}
          <p className="text-muted-foreground text-xs">
            Approving moves the submission to the team to enrich metadata, then publishes.
          </p>
        </div>
      ) : (
        <CustomField label="Rejection reason" htmlFor="approval-reason">
          <Textarea
            id="approval-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this being rejected? (shared with the submitter)"
            rows={3}
          />
        </CustomField>
      )}
    </CustomModal>
  );
}
