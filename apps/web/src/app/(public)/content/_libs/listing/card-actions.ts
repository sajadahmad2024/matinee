import {
  Archive,
  ArchiveRestore,
  CalendarClock,
  CalendarX,
  type LucideIcon,
  Pencil,
  Rocket,
  Send,
  Trash2,
  XCircle,
  Zap,
  ZapOff,
} from "lucide-react";

import { ContentLifecycleStatus } from "../../_shared/content-config";
import { statusActionsFor } from "../video-form/actions";

/** The list card's ⋯ menu — every content action the backend supports (spec §4.3). */
export const CardAction = {
  Edit: "edit",
  Submit: "submit",
  Publish: "publish",
  Schedule: "schedule",
  Unschedule: "unschedule",
  Boost: "boost",
  RemoveBoost: "remove-boost",
  Reject: "reject",
  Archive: "archive",
  Restore: "restore",
  Delete: "delete",
} as const;
export type CardAction = (typeof CardAction)[keyof typeof CardAction];

/** Actions that only call the API (no input of their own); some ask for confirmation first. */
export type CardApiAction = Exclude<
  CardAction,
  | typeof CardAction.Edit
  | typeof CardAction.Schedule
  | typeof CardAction.Reject
  | typeof CardAction.Boost
>;

/** Menu order, look and toasts. Menu items are listed in the order of this record. */
export const CARD_ACTION_ITEMS: Record<
  CardAction,
  {
    label: string;
    icon: LucideIcon;
    tone?: "destructive" | "success";
    separatorBefore?: boolean;
    success?: string;
    failed?: string;
  }
> = {
  [CardAction.Edit]: { label: "Edit", icon: Pencil },
  [CardAction.Submit]: {
    label: "Submit for approval",
    icon: Send,
    success: "Sent for approval",
    failed: "Couldn't send for approval",
  },
  [CardAction.Publish]: {
    label: "Publish now",
    icon: Rocket,
    success: "Video published",
    failed: "Couldn't publish",
  },
  [CardAction.Schedule]: {
    label: "Schedule",
    icon: CalendarClock,
    success: "Video scheduled",
    failed: "Couldn't schedule",
  },
  [CardAction.Unschedule]: {
    label: "Unschedule",
    icon: CalendarX,
    success: "Schedule cancelled — the video is back in Requests",
    failed: "Couldn't unschedule",
  },
  [CardAction.Boost]: {
    label: "Boost",
    icon: Zap,
    success: "Boost saved",
    failed: "Couldn't save the boost",
  },
  [CardAction.RemoveBoost]: {
    label: "Remove boost",
    icon: ZapOff,
    success: "Boost removed",
    failed: "Couldn't remove the boost",
  },
  [CardAction.Reject]: {
    label: "Reject",
    icon: XCircle,
    tone: "destructive",
    success: "Submission rejected",
    failed: "Couldn't reject",
  },
  [CardAction.Archive]: {
    label: "Archive",
    icon: Archive,
    separatorBefore: true,
    success: "Video archived",
    failed: "Couldn't archive",
  },
  [CardAction.Restore]: {
    label: "Restore",
    icon: ArchiveRestore,
    tone: "success",
    success: "Video restored",
    failed: "Couldn't restore",
  },
  [CardAction.Delete]: {
    label: "Delete",
    icon: Trash2,
    tone: "destructive",
    separatorBefore: true,
    success: "Video deleted",
    failed: "Couldn't delete",
  },
};

/** Actions that ask before running — they're hard to undo or go live. */
export const CARD_ACTION_CONFIRM: Partial<
  Record<
    CardApiAction,
    {
      title: string;
      description: (title: string) => string;
      confirmText: string;
      variant?: "destructive";
    }
  >
> = {
  [CardAction.Publish]: {
    title: "Publish now?",
    description: (title) => `"${title}" goes live in the app right away.`,
    confirmText: "Publish",
  },
  [CardAction.RemoveBoost]: {
    title: "Remove boost?",
    description: (title) => `"${title}" goes back to its normal place in the feed.`,
    confirmText: "Remove boost",
  },
  [CardAction.Archive]: {
    title: "Archive this video?",
    description: (title) => `"${title}" is taken out of the app. It stays in the Archived tab.`,
    confirmText: "Archive",
    variant: "destructive",
  },
  [CardAction.Restore]: {
    title: "Restore this video?",
    description: (title) =>
      `"${title}" goes back to Live if it was published before, otherwise to Drafts.`,
    confirmText: "Restore",
  },
  [CardAction.Delete]: {
    title: "Delete this video?",
    description: (title) => `"${title}" is removed from the library.`,
    confirmText: "Delete",
    variant: "destructive",
  },
};

const DELETABLE = new Set<string>([
  ContentLifecycleStatus.Draft,
  ContentLifecycleStatus.Rejected,
  ContentLifecycleStatus.Archived,
]);

/**
 * Which menu actions apply to a row. Submit / Publish / Schedule follow the edit page's rule
 * (`statusActionsFor`), so the two can't drift. A pending video is rejected, not deleted.
 */
export const visibleCardActions = ({
  status,
  hasVideo,
  canPublish,
  isBoosted,
}: {
  status?: string;
  hasVideo: boolean;
  canPublish: boolean;
  isBoosted: boolean;
}): Record<CardAction, boolean> => {
  const isLive = status === ContentLifecycleStatus.Published;
  const lifecycle = statusActionsFor({ status, hasVideo, canPublish });
  return {
    [CardAction.Edit]: status !== ContentLifecycleStatus.Archived,
    [CardAction.Submit]: lifecycle.review,
    [CardAction.Publish]: lifecycle.publish,
    [CardAction.Schedule]: lifecycle.schedule,
    [CardAction.Unschedule]: canPublish && status === ContentLifecycleStatus.Scheduled,
    // Boosting ranks a live video in the feed; "Boost" edits the window when one is set.
    [CardAction.Boost]: isLive,
    [CardAction.RemoveBoost]: isLive && isBoosted,
    [CardAction.Reject]: canPublish && status === ContentLifecycleStatus.PendingApproval,
    [CardAction.Archive]: isLive,
    [CardAction.Restore]: status === ContentLifecycleStatus.Archived,
    [CardAction.Delete]: !!status && DELETABLE.has(status),
  };
};

/**
 * A rejected video goes back for review as a "Resubmit"; a scheduled one is "Reschedule"d; a
 * boosted one gets "Edit boost".
 */
export const cardActionLabel = (
  action: CardAction,
  { status, isBoosted }: { status?: string; isBoosted: boolean },
) => {
  if (action === CardAction.Boost && isBoosted) return "Edit boost";
  if (action === CardAction.Submit && status === ContentLifecycleStatus.Rejected) return "Resubmit";
  if (action === CardAction.Schedule && status === ContentLifecycleStatus.Scheduled)
    return "Reschedule";
  return CARD_ACTION_ITEMS[action].label;
};
