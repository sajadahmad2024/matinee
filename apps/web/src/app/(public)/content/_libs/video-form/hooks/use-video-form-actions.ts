"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import type { FieldErrors, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  usePublishContent,
  useScheduleContent,
  useSubmitContent,
} from "@/app/_libs/hooks/api/use-admin-content";
import type { ContentCreateFormValues } from "@/app/_libs/schemas";

import {
  STATUS_ACTION_LABEL,
  STATUS_ACTION_RESULT,
  SaveAction,
  type StatusAction,
  listTabRoute,
} from "../actions";
import { type ScheduleConfig, scheduleToIso } from "../schedule";
import type { VideoFormSave } from "./use-video-form-save";

interface UseVideoFormActionsOptions {
  form: UseFormReturn<ContentCreateFormValues>;
  saveAll: VideoFormSave["saveAll"];
  /** A failed validation — opens the step with the first error. */
  onInvalid: (errors: FieldErrors<ContentCreateFormValues>) => void;
  /** The plain save's toast and where it lands; also where a failed status call lands. */
  saved: { success: string; route: string };
  /** Toast title when the status call fails after the save went through. */
  statusFailedTitle: (actionLabel: string) => string;
}

/**
 * The footer actions: validate the whole form, save everything (`saveAll`), then run the
 * action's status call (submit / schedule / publish) and open the list.
 */
export function useVideoFormActions({
  form,
  saveAll,
  onInvalid,
  saved,
  statusFailedTitle,
}: UseVideoFormActionsOptions) {
  const router = useRouter();
  const { submitContentMutation } = useSubmitContent();
  const { scheduleContentMutation } = useScheduleContent();
  const { publishContentMutation } = usePublishContent();

  const [savingAction, setSavingAction] = useState<SaveAction | null>(null);
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);

  const done = (success: string, route: string) => {
    toast.success(success);
    router.push(route as Route);
  };

  /** The save worked but the status call didn't — say so and leave, rather than invite a retry loop. */
  const onStatusError = (action: StatusAction) => (error: Error) => {
    toast.error(statusFailedTitle(STATUS_ACTION_LABEL[action]), { description: error?.message });
    router.push(saved.route as Route);
  };

  /** The status call that follows the save (none for a plain save). */
  const runStatusCall = (action: SaveAction, id: string, scheduledAt?: string) => {
    if (action === SaveAction.Save) return done(saved.success, saved.route);

    const result = STATUS_ACTION_RESULT[action];
    const callbacks = {
      onSuccess: () => done(result.success, listTabRoute(result.tab)),
      onError: onStatusError(action),
    };
    if (action === SaveAction.Review) submitContentMutation.mutate(id, callbacks);
    if (action === SaveAction.Schedule && scheduledAt)
      scheduleContentMutation.mutate({ id, scheduledAt }, callbacks);
    if (action === SaveAction.Publish) publishContentMutation.mutate(id, callbacks);
  };

  const save = (action: SaveAction, scheduledAt?: string) => {
    // Stays set through the redirect, so the buttons can't fire a second save meanwhile.
    setSavingAction(action);
    saveAll(
      (id) => runStatusCall(action, id, scheduledAt),
      () => setSavingAction(null),
    );
  };

  /** Validates the whole form first; Schedule opens its modal instead of saving right away. */
  const runAction = (action: SaveAction) =>
    form.handleSubmit(
      () => (action === SaveAction.Schedule ? setScheduleModalOpen(true) : save(action)),
      onInvalid,
    )();

  const confirmSchedule = (config: ScheduleConfig) => {
    const scheduledAt = scheduleToIso(config);
    if (new Date(scheduledAt).getTime() <= Date.now()) {
      toast.error("Pick a time in the future");
      return;
    }
    save(SaveAction.Schedule, scheduledAt);
  };

  return {
    savingAction,
    runAction,
    scheduleModal: {
      open: scheduleModalOpen,
      onOpenChange: setScheduleModalOpen,
      onConfirm: confirmSchedule,
    },
  };
}
