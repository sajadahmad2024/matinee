"use client";

import { useState } from "react";

import { toast } from "sonner";

import {
  type BoostContentDto,
  type ContentResponseDto,
  useArchiveContent,
  useBoostContent,
  useDeleteContent,
  usePublishContent,
  useRejectContent,
  useRestoreContent,
  useScheduleContent,
  useSubmitContent,
  useUnscheduleContent,
} from "@/app/_libs/hooks/api/use-admin-content";
import type { CustomAction } from "@/components/custom/custom-actions-menu";

import { type ScheduleConfig, scheduleToIso } from "../video-form/schedule";
import {
  CARD_ACTION_CONFIRM,
  CARD_ACTION_ITEMS,
  CardAction,
  type CardApiAction,
  cardActionLabel,
  visibleCardActions,
} from "./card-actions";

interface UseContentCardActionsOptions {
  video: ContentResponseDto;
  /** The admin has `content:publish`. */
  canPublish: boolean;
  onEdit: (id: string) => void;
}

/**
 * One list card's actions: the ⋯ menu items, the Requests tab's Approve / Reject, and the state
 * of the modals they open (confirmation, reject reason, schedule, boost). The card renders them.
 */
export function useContentCardActions({ video, canPublish, onEdit }: UseContentCardActionsOptions) {
  const id = video?.id;
  const title = video?.title ?? "";

  const { submitContentMutation } = useSubmitContent();
  const { publishContentMutation } = usePublishContent();
  const { scheduleContentMutation } = useScheduleContent();
  const { unscheduleContentMutation } = useUnscheduleContent();
  const { rejectContentMutation } = useRejectContent();
  const { archiveContentMutation } = useArchiveContent();
  const { restoreContentMutation } = useRestoreContent();
  const { deleteContentMutation } = useDeleteContent();
  const { boostContentMutation } = useBoostContent();

  const [confirming, setConfirming] = useState<CardApiAction | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [boostOpen, setBoostOpen] = useState(false);

  const isBoosted = !!video?.isBoosted;
  const visible = visibleCardActions({
    status: video?.status,
    hasVideo: !!video?.videoMediaId,
    canPublish,
    isBoosted,
  });

  /** Toasts, and closes whichever modal started the action. */
  const callbacks = (action: CardAction, close?: () => void) => ({
    onSuccess: () => {
      toast.success(CARD_ACTION_ITEMS[action].success);
      close?.();
    },
    onError: (error: Error) =>
      toast.error(CARD_ACTION_ITEMS[action].failed, { description: error?.message }),
  });

  const API_CALLS: Record<CardApiAction, (close?: () => void) => void> = {
    [CardAction.Submit]: (close) =>
      submitContentMutation.mutate(id, callbacks(CardAction.Submit, close)),
    [CardAction.Publish]: (close) =>
      publishContentMutation.mutate(id, callbacks(CardAction.Publish, close)),
    [CardAction.Unschedule]: (close) =>
      unscheduleContentMutation.mutate(id, callbacks(CardAction.Unschedule, close)),
    [CardAction.Archive]: (close) =>
      archiveContentMutation.mutate(id, callbacks(CardAction.Archive, close)),
    [CardAction.Restore]: (close) =>
      restoreContentMutation.mutate(id, callbacks(CardAction.Restore, close)),
    [CardAction.Delete]: (close) =>
      deleteContentMutation.mutate(id, callbacks(CardAction.Delete, close)),
    [CardAction.RemoveBoost]: (close) =>
      boostContentMutation.mutate(
        { id, boostContentDto: { boosted: false } },
        callbacks(CardAction.RemoveBoost, close),
      ),
  };

  const select = (action: CardAction) => {
    if (action === CardAction.Edit) return onEdit(id);
    if (action === CardAction.Schedule) return setScheduleOpen(true);
    if (action === CardAction.Reject) return setRejectOpen(true);
    if (action === CardAction.Boost) return setBoostOpen(true);
    if (CARD_ACTION_CONFIRM[action]) return setConfirming(action);
    API_CALLS[action]();
  };

  const confirmSchedule = (config: ScheduleConfig) => {
    const scheduledAt = scheduleToIso(config);
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error("Pick a time in the future");
      return;
    }
    scheduleContentMutation.mutate({ id, scheduledAt }, callbacks(CardAction.Schedule));
  };

  const confirmBoost = (boostContentDto: BoostContentDto) =>
    boostContentMutation.mutate(
      { id, boostContentDto },
      callbacks(CardAction.Boost, () => setBoostOpen(false)),
    );

  const isRunning =
    submitContentMutation.isPending ||
    publishContentMutation.isPending ||
    scheduleContentMutation.isPending ||
    unscheduleContentMutation.isPending ||
    rejectContentMutation.isPending ||
    archiveContentMutation.isPending ||
    restoreContentMutation.isPending ||
    deleteContentMutation.isPending ||
    boostContentMutation.isPending;

  const menuActions: CustomAction[] = (Object.keys(CARD_ACTION_ITEMS) as CardAction[]).map(
    (action) => ({
      label: cardActionLabel(action, { status: video?.status, isBoosted }),
      icon: CARD_ACTION_ITEMS[action].icon,
      tone: CARD_ACTION_ITEMS[action].tone,
      separatorBefore: CARD_ACTION_ITEMS[action].separatorBefore,
      hidden: !visible[action],
      disabled: isRunning,
      onClick: () => select(action),
    }),
  );

  const confirm = confirming ? CARD_ACTION_CONFIRM[confirming] : undefined;

  return {
    menuActions,
    isRunning,
    /** Requests tab: Approve publishes now (same rule as the menu's Publish now). */
    canApprove: visible[CardAction.Publish],
    canReject: visible[CardAction.Reject],
    approve: () => select(CardAction.Publish),
    reject: () => select(CardAction.Reject),
    confirmModal: {
      open: !!confirming,
      onOpenChange: (open: boolean) => !open && setConfirming(null),
      title: confirm?.title ?? "",
      description: confirm?.description(title) ?? "",
      confirmText: confirm?.confirmText,
      confirmVariant: confirm?.variant,
      isConfirming: isRunning,
      onConfirm: () => confirming && API_CALLS[confirming](() => setConfirming(null)),
    },
    rejectModal: {
      open: rejectOpen,
      onOpenChange: setRejectOpen,
      title,
      isRejecting: rejectContentMutation.isPending,
      onReject: (reason: string) =>
        rejectContentMutation.mutate(
          { id, reason },
          callbacks(CardAction.Reject, () => setRejectOpen(false)),
        ),
    },
    scheduleModal: {
      open: scheduleOpen,
      onOpenChange: setScheduleOpen,
      videoTitle: title,
      scheduledAt: video?.scheduledAt,
      onConfirm: confirmSchedule,
    },
    boostModal: {
      open: boostOpen,
      onOpenChange: setBoostOpen,
      videoTitle: title,
      current: isBoosted
        ? {
            startsAt: video?.boostStartsAt,
            until: video?.boostedUntil,
            channels: video?.boostChannels,
          }
        : null,
      isSaving: boostContentMutation.isPending,
      onConfirm: confirmBoost,
    },
  };
}
