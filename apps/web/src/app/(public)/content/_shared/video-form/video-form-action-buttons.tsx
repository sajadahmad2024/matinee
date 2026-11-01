"use client";

import { Info } from "lucide-react";

import { CustomButton } from "@/components/custom/custom-button";

import { SaveAction, type VisibleStatusActions } from "../../_libs/video-form/actions";

interface VideoFormActionButtonsProps {
  /** "Save Draft" (add) / "Save Changes" (edit). */
  saveLabel: string;
  /** Solid save button — edit, when it's the main action; add keeps Save Draft outlined. */
  isSavePrimary?: boolean;
  /** Which status buttons the page allows right now; hidden ones aren't rendered. */
  visible: VisibleStatusActions;
  /** The video already has a go-live — Schedule reads "Reschedule". */
  isScheduled?: boolean;
  /** What's still missing — the status buttons show disabled with this hint beside them. */
  blockedHint?: string;
  savingAction: SaveAction | null;
  disabled: boolean;
  onAction: (action: SaveAction) => void;
}

/** Footer buttons: the plain save, plus the status actions that apply. */
export function VideoFormActionButtons({
  saveLabel,
  isSavePrimary = false,
  visible,
  isScheduled = false,
  blockedHint,
  savingAction,
  disabled,
  onAction,
}: VideoFormActionButtonsProps) {
  const button = (action: SaveAction, label: string, loadingText: string, isPrimary = false) => (
    <CustomButton
      key={action}
      variant={isPrimary ? "default" : "outline"}
      size="sm"
      disabled={disabled || (action !== SaveAction.Save && !!blockedHint)}
      isLoading={savingAction === action}
      loadingText={loadingText}
      onClick={() => onAction(action)}>
      {label}
    </CustomButton>
  );

  return (
    <>
      {blockedHint && (
        <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Info className="h-3.5 w-3.5 shrink-0" />
          {blockedHint}
        </span>
      )}
      {button(SaveAction.Save, saveLabel, "Saving…", isSavePrimary)}
      {visible.review && button(SaveAction.Review, "Request Approval", "Sending…")}
      {visible.schedule &&
        button(SaveAction.Schedule, isScheduled ? "Reschedule" : "Schedule", "Scheduling…")}
      {visible.publish && button(SaveAction.Publish, "Publish Now", "Publishing…", true)}
    </>
  );
}
