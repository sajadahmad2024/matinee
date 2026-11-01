import type { ContentHistoryEntryDto } from "@/app/_libs/api/generated";

import { BOOST_CHANNELS } from "../../../_libs/video-form/boost/boost-options";
import { formatDateTime, formatGoLive } from "../../../_shared/content-format";

/** Static config for the video details page: copy and change-history labels. */

export const DETAILS_COPY = {
  backLabel: "Back to content",
  loadError: "Unable to load this video",
  loadErrorFallback: "Please try again.",
  notFound: "Video not found",
  notFoundDescription: "It may have been deleted, or the link is wrong.",
  noDescription: "No description",
  noCast: "No cast or crew",
  noLicense: "Original / owned — no licence on file",
  noVideo: "No video uploaded",
  noThumbnail: "No thumbnail",
  organic: "Organic — no sponsor",
  noAdPerformance: "No ad activity yet",
  noLinkedGames: "No linked games",
  noHistory: "No changes recorded yet",
} as const;

/** `content_history.action` → the timeline's label; unknown actions show as-is. */
const HISTORY_ACTION_LABELS: Record<string, string> = {
  created: "Created draft",
  updated: "Updated details",
  submitted: "Submitted for approval",
  published: "Published",
  scheduled: "Scheduled",
  unscheduled: "Unscheduled",
  rejected: "Rejected",
  archived: "Archived",
  boosted: "Boost updated",
  deleted: "Deleted",
};

export const historyActionLabel = (action: string) => HISTORY_ACTION_LABELS[action] ?? action;

/**
 * The entry's structured detail (`changes`) as a line under its note — the go-live of a schedule,
 * what an unschedule cancelled, a boost's window and channels. `undefined` when there's nothing.
 */
export const historyChangeDetail = ({ action, changes }: ContentHistoryEntryDto) => {
  switch (action) {
    case "scheduled":
      return changes?.scheduledAt ? `Goes live ${formatGoLive(changes.scheduledAt)}` : undefined;
    case "unscheduled":
      return changes?.previousScheduledAt
        ? `Was set for ${formatGoLive(changes.previousScheduledAt)}`
        : undefined;
    case "boosted": {
      const parts = [
        changes?.until && `Until ${formatDateTime(changes.until)}`,
        changes?.channels?.length &&
          changes.channels
            .map(
              (channel) => BOOST_CHANNELS[channel as keyof typeof BOOST_CHANNELS]?.label ?? channel,
            )
            .join(", "),
      ].filter(Boolean);
      return parts.length ? parts.join(" · ") : undefined;
    }
    default:
      return undefined;
  }
};
