"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import { type ContentCreateFormValues, contentCreateSchema } from "@/app/_libs/schemas";

import { statusActionsHint } from "../../_libs/video-form/actions";
import { createVideoFormDefaults } from "../../_libs/video-form/defaults";
import { useVideoFormActions } from "../../_libs/video-form/hooks/use-video-form-actions";
import { useVideoFormSave } from "../../_libs/video-form/hooks/use-video-form-save";
import { useVideoFormSteps } from "../../_libs/video-form/hooks/use-video-form-steps";
import { useVideoMediaUploads } from "../../_libs/video-form/hooks/use-video-media-uploads";
import { CONTENT_PERMISSIONS } from "../../_shared/content-config";
import { ScheduleModal } from "../../_shared/video-form/schedule-modal";
import { VideoFormActionButtons } from "../../_shared/video-form/video-form-action-buttons";
import { VideoFormShell } from "../../_shared/video-form/video-form-shell";
import { ADD_SAVED, addStatusActions, addStatusFailedTitle } from "./add-video-config";

/**
 * Add flow: the first Next creates the draft; every later save PATCHes only what changed. The
 * footer's status buttons (submit / schedule / publish) run after that save.
 */
export function AddVideoForm() {
  const form = useForm<ContentCreateFormValues>({
    resolver: zodResolver(contentCreateSchema),
    defaultValues: createVideoFormDefaults(),
  });
  const { control, trigger } = form;
  const title = useWatch({ control, name: "title" });
  const hasVideo = !!useWatch({ control, name: "video" });
  const media = useVideoMediaUploads(form);

  const { profile } = useAdminProfile();
  const canPublish = profile?.permissions?.includes(CONTENT_PERMISSIONS.Publish) ?? false;

  const { contentId, saveStep, saveAll, isPersisting } = useVideoFormSave({ form });
  // Leaving a step saves it (the first Next creates the draft).
  const steps = useVideoFormSteps({ trigger, saveStep });
  const { savingAction, runAction, scheduleModal } = useVideoFormActions({
    form,
    saveAll,
    onInvalid: steps.showFirstError,
    saved: ADD_SAVED,
    statusFailedTitle: addStatusFailedTitle,
  });

  const isNextLoading = isPersisting && savingAction === null;

  return (
    <VideoFormShell
      form={form}
      steps={steps}
      contentId={contentId}
      media={media}
      title="Add New Video"
      subtitle="Upload and configure your new content"
      isNextLoading={isNextLoading}
      actions={
        <VideoFormActionButtons
          saveLabel="Save Draft"
          visible={addStatusActions({ canPublish })}
          blockedHint={statusActionsHint({ allStepsDone: steps.allStepsDone, hasVideo })}
          savingAction={savingAction}
          // The actions leave the page, so they also wait for a running upload.
          disabled={savingAction !== null || isNextLoading || media.isUploading}
          onAction={runAction}
        />
      }>
      <ScheduleModal {...scheduleModal} videoTitle={title} />
    </VideoFormShell>
  );
}
