"use client";

import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { useAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import { type ContentFullDto, useContentFull } from "@/app/_libs/hooks/api/use-admin-content";
import { type ContentCreateFormValues, contentCreateSchema } from "@/app/_libs/schemas";
import { CustomRetryState } from "@/components/custom/custom-retry-state";

import { statusActionsFor, statusActionsHint } from "../../../_libs/video-form/actions";
import { useVideoFormActions } from "../../../_libs/video-form/hooks/use-video-form-actions";
import { useVideoFormSave } from "../../../_libs/video-form/hooks/use-video-form-save";
import { useVideoFormSteps } from "../../../_libs/video-form/hooks/use-video-form-steps";
import { useVideoMediaUploads } from "../../../_libs/video-form/hooks/use-video-media-uploads";
import { toEditFormValues } from "../../../_libs/video-form/mappers/from-api";
import { CONTENT_PERMISSIONS, ContentLifecycleStatus } from "../../../_shared/content-config";
import { ScheduleModal } from "../../../_shared/video-form/schedule-modal";
import { VideoFormActionButtons } from "../../../_shared/video-form/video-form-action-buttons";
import { VideoFormShell } from "../../../_shared/video-form/video-form-shell";
import { EDIT_SAVED, editStatusFailedTitle } from "./edit-video-config";

/** Edit flow: loads the video (`GET /:id/full`), then opens the wizard prefilled. */
export function EditVideoForm({ id }: { id: string }) {
  const { contentFullQuery, contentFull } = useContentFull(id);

  if (contentFullQuery?.isPending) {
    return <div className="bg-muted/20 h-150 w-full animate-pulse rounded-xl" />;
  }
  if (contentFullQuery?.isError || !contentFull) {
    return (
      <CustomRetryState
        title="Couldn't load this video"
        description={contentFullQuery?.error?.message || "Please try again."}
        onRetry={() => contentFullQuery?.refetch()}
        isRetrying={contentFullQuery?.isRefetching}
      />
    );
  }
  // Mounted only once loaded, so the loaded values are the form's defaults.
  return <EditVideoWizard contentFull={contentFull} />;
}

function EditVideoWizard({ contentFull }: { contentFull: ContentFullDto }) {
  const contentId = contentFull?.content?.id;
  // Fixed at mount — a background refetch after a save doesn't reset what the user is editing.
  const [loadedValues] = useState(() => toEditFormValues(contentFull));

  const form = useForm<ContentCreateFormValues>({
    resolver: zodResolver(contentCreateSchema),
    defaultValues: structuredClone(loadedValues),
  });
  const { control, trigger } = form;
  const title = useWatch({ control, name: "title" });
  const hasVideo = !!useWatch({ control, name: "video" });
  const media = useVideoMediaUploads(form);

  const { profile } = useAdminProfile();
  const canPublish = profile?.permissions?.includes(CONTENT_PERMISSIONS.Publish) ?? false;

  // The loaded values are the last-saved baseline, so a save sends only what changed.
  const { saveStep, saveAll, isPersisting } = useVideoFormSave({
    form,
    existing: { id: contentId, values: loadedValues },
  });
  // The video exists, so every step is open; Next still saves the step it leaves.
  const steps = useVideoFormSteps({ trigger, allUnlocked: true, saveStep });
  const { savingAction, runAction, scheduleModal } = useVideoFormActions({
    form,
    saveAll,
    onInvalid: steps.showFirstError,
    saved: EDIT_SAVED,
    statusFailedTitle: editStatusFailedTitle,
  });

  const isNextLoading = isPersisting && savingAction === null;
  const status = contentFull?.content?.status;
  // Status + permission decide which buttons exist; a missing video only disables them.
  const visible = statusActionsFor({ status, hasVideo: true, canPublish });

  return (
    <VideoFormShell
      form={form}
      steps={steps}
      contentId={contentId}
      media={media}
      title={title || "Edit Video"}
      subtitle="Update this video's details, rights, media and distribution"
      isNextLoading={isNextLoading}
      actions={
        <VideoFormActionButtons
          saveLabel="Save Changes"
          isSavePrimary={!visible.publish}
          visible={visible}
          blockedHint={statusActionsHint({ hasVideo })}
          isScheduled={status === ContentLifecycleStatus.Scheduled}
          savingAction={savingAction}
          // The actions leave the page, so they also wait for a running upload.
          disabled={savingAction !== null || isNextLoading || media.isUploading}
          onAction={runAction}
        />
      }>
      <ScheduleModal
        {...scheduleModal}
        videoTitle={title}
        scheduledAt={contentFull?.content?.scheduledAt}
      />
    </VideoFormShell>
  );
}
