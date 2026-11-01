import { ContentTab } from "../../_components/listing/listing-config";
import { CONTENT_ROUTES, ContentLifecycleStatus } from "../../_shared/content-config";

/** Footer actions shared by add and edit: a plain save, or a save followed by a status call. */

export const SaveAction = {
  /** Save only — "Save Draft" (add) / "Save Changes" (edit). */
  Save: "save",
  Review: "review",
  Schedule: "schedule",
  Publish: "publish",
} as const;
export type SaveAction = (typeof SaveAction)[keyof typeof SaveAction];
export type StatusAction = Exclude<SaveAction, typeof SaveAction.Save>;

export const listTabRoute = (tab: ContentTab) => `${CONTENT_ROUTES.LIST}?tab=${tab}` as const;

/** After a status call: the toast, and the list tab that now holds the video. */
export const STATUS_ACTION_RESULT: Record<StatusAction, { tab: ContentTab; success: string }> = {
  [SaveAction.Review]: { tab: ContentTab.Requests, success: "Sent for approval" },
  [SaveAction.Schedule]: { tab: ContentTab.Scheduled, success: "Video scheduled" },
  [SaveAction.Publish]: { tab: ContentTab.Live, success: "Video published" },
};

/** Failure copy for the status call — the save before it already went through. */
export const STATUS_ACTION_LABEL: Record<StatusAction, string> = {
  [SaveAction.Review]: "sending for approval",
  [SaveAction.Schedule]: "scheduling",
  [SaveAction.Publish]: "publishing",
};

/** Which status buttons the footer shows (a button shows only where it works). */
export type VisibleStatusActions = Record<StatusAction, boolean>;

/**
 * Why the footer's status buttons are shown but disabled — a prerequisite the user can still
 * complete. `undefined` when nothing is missing. (Status and permission rules hide buttons instead.)
 */
export const statusActionsHint = ({
  allStepsDone = true,
  hasVideo,
}: {
  allStepsDone?: boolean;
  hasVideo: boolean;
}) => {
  if (!allStepsDone && !hasVideo)
    return "Complete all steps and upload a video to request approval or publish";
  if (!hasVideo) return "Upload a video to request approval or publish";
  if (!allStepsDone) return "Complete all steps to request approval or publish";
  return undefined;
};

/**
 * Status actions by the video's current status (spec §4), for the edit footer and the list card's
 * menu. The backend doesn't enforce the lifecycle, so the UI does. All need a video; Schedule /
 * Publish also need `content:publish`.
 */
export const statusActionsFor = ({
  status,
  hasVideo,
  canPublish,
}: {
  status?: string;
  hasVideo: boolean;
  canPublish: boolean;
}): VisibleStatusActions => {
  const canReview =
    status === ContentLifecycleStatus.Draft || status === ContentLifecycleStatus.Rejected;
  const canApprove = canReview || status === ContentLifecycleStatus.PendingApproval;
  const isScheduled = status === ContentLifecycleStatus.Scheduled;
  const canPublishNow = canApprove || isScheduled;
  return {
    review: hasVideo && canReview,
    // A scheduled video can be rescheduled — `/schedule` again just moves `scheduledAt`.
    schedule: hasVideo && canPublish && (canApprove || isScheduled),
    publish: hasVideo && canPublish && canPublishNow,
  };
};
