"use client";

import { useState } from "react";

import { XCircle } from "lucide-react";

import { Textarea } from "@/components/ui/textarea";

import { CustomButton } from "@/components/custom/custom-button";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";

/** `RejectContentDto.reason` limits. */
const REASON_MIN = 3;
const REASON_MAX = 500;

interface RejectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  isRejecting: boolean;
  onReject: (reason: string) => void;
}

/** Reject a submission with a reason (`POST /:id/reject`); the reason is shared with the submitter. */
export function RejectModal({
  open,
  onOpenChange,
  title,
  isRejecting,
  onReject,
}: RejectModalProps) {
  const [reason, setReason] = useState("");
  const trimmed = reason.trim();

  return (
    <CustomModal
      open={open}
      onOpenChange={(next) => !isRejecting && onOpenChange(next)}
      appearance="default"
      className="border-border bg-card max-w-md"
      titleClassName="flex items-center gap-2"
      title={
        <>
          <XCircle className="text-destructive h-5 w-5" />
          Reject submission
        </>
      }
      description={title}
      footer={
        <>
          <CustomButton
            variant="outline"
            disabled={isRejecting}
            onClick={() => onOpenChange(false)}>
            Cancel
          </CustomButton>
          <CustomButton
            variant="destructive"
            disabled={trimmed.length < REASON_MIN}
            isLoading={isRejecting}
            loadingText="Rejecting…"
            onClick={() => onReject(trimmed)}>
            Reject
          </CustomButton>
        </>
      }>
      <CustomField
        label="Rejection reason"
        htmlFor="reject-reason"
        helperText={`${reason.length}/${REASON_MAX} characters · at least ${REASON_MIN}`}>
        <Textarea
          id="reject-reason"
          value={reason}
          maxLength={REASON_MAX}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Why is this being rejected? (shared with the submitter)"
          rows={3}
          // Grows with the text up to ~8 lines, then scrolls.
          className="max-h-48 resize-none overflow-y-auto"
        />
      </CustomField>
    </CustomModal>
  );
}
