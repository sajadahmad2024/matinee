"use client";

import { useState } from "react";

import { toast } from "sonner";

import { type AdCampaignAction, useAdCampaignAction } from "@/app/_libs/hooks/api/use-admin-ads";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { type AdCampaignDto, type AdCampaignStatus, AdCampaignStatusEnum } from "../_libs/ad-types";

/** Status transitions the backend allows from each status (ad-sales.service.ts). */
export const AD_ALLOWED_ACTIONS: Record<AdCampaignStatus, AdCampaignAction[]> = {
  [AdCampaignStatusEnum.Draft]: ["activate", "end"],
  [AdCampaignStatusEnum.Scheduled]: ["pause", "end"],
  [AdCampaignStatusEnum.Active]: ["pause", "end"],
  [AdCampaignStatusEnum.Paused]: ["resume", "end"],
  [AdCampaignStatusEnum.Ended]: [],
};

export const AD_ACTION_LABELS: Record<AdCampaignAction, string> = {
  activate: "Publish",
  pause: "Pause",
  resume: "Resume",
  end: "End now",
};

const DONE: Record<AdCampaignAction, string> = {
  activate: "published",
  pause: "paused",
  resume: "resumed",
  end: "ended",
};

/** Ended ads can't be edited (backend 409). */
export const canEditAd = (status: AdCampaignStatus) => status !== AdCampaignStatusEnum.Ended;

/** Scheduled and draft ads haven't run yet, so they have no analytics to show. */
export const hasAdAnalytics = (status: AdCampaignStatus) =>
  status !== AdCampaignStatusEnum.Scheduled && status !== AdCampaignStatusEnum.Draft;

export const canRunAdAction = (status: AdCampaignStatus, action: AdCampaignAction) =>
  AD_ALLOWED_ACTIONS[status]?.includes(action) ?? false;

/** Actions that ask first, with their dialog copy; the rest run straight away. */
const CONFIRM: Partial<
  Record<
    AdCampaignAction,
    {
      title: string;
      description: (name: string) => string;
      confirmLabel: string;
      destructive: boolean;
    }
  >
> = {
  pause: {
    title: "Pause this ad?",
    description: (name) =>
      `“${name}” stops showing in the feed until you resume it. It keeps its feed ranks and stats.`,
    confirmLabel: "Pause",
    destructive: false,
  },
  end: {
    title: "End this ad now?",
    description: (name) =>
      `“${name}” stops showing immediately and frees its feed ranks. Its stats are kept.`,
    confirmLabel: "End now",
    destructive: true,
  },
};

interface PendingConfirmation {
  campaign: AdCampaignDto;
  action: AdCampaignAction;
}

export interface AdStatusConfirmDialogProps {
  /** The action waiting for a yes; `null` keeps the dialog closed. */
  confirming: PendingConfirmation | null;
  onCancel: () => void;
  onConfirm: () => void;
}

/** "Pause this ad?" / "End this ad now?" — copy from `CONFIRM`, driven by `useAdStatusActions`. */
export function AdStatusConfirmDialog({
  confirming,
  onCancel,
  onConfirm,
}: AdStatusConfirmDialogProps) {
  const copy = confirming ? CONFIRM[confirming.action] : undefined;

  return (
    <ConfirmationDialog
      open={!!confirming}
      onOpenChange={(open) => !open && onCancel()}
      action="custom"
      title={copy?.title ?? ""}
      description={copy?.description(confirming?.campaign?.name ?? "") ?? ""}
      confirmLabel={copy?.confirmLabel}
      destructive={copy?.destructive}
      onConfirm={onConfirm}
    />
  );
}

/**
 * Runs a status action with toasts; Pause and End now ask first. Spread `dialog` into one
 * `<AdStatusConfirmDialog />` next to the controls that call `request`.
 */
export function useAdStatusActions() {
  const { adCampaignActionMutation } = useAdCampaignAction();
  const [confirming, setConfirming] = useState<PendingConfirmation | null>(null);

  const run = (campaign: AdCampaignDto, action: AdCampaignAction) =>
    adCampaignActionMutation.mutate(
      { id: campaign?.id, action },
      {
        onSuccess: () => toast.success(`“${campaign?.name}” ${DONE[action]}`),
        onError: (error) => toast.error(error.message),
      },
    );

  const request = (campaign: AdCampaignDto, action: AdCampaignAction) =>
    CONFIRM[action] ? setConfirming({ campaign, action }) : run(campaign, action);

  const dialog: AdStatusConfirmDialogProps = {
    confirming,
    onCancel: () => setConfirming(null),
    onConfirm: () => {
      if (confirming) run(confirming.campaign, confirming.action);
      setConfirming(null);
    },
  };

  return {
    request,
    dialog,
    isPending: adCampaignActionMutation.isPending,
    pendingId: adCampaignActionMutation.isPending
      ? adCampaignActionMutation.variables?.id
      : undefined,
  };
}
