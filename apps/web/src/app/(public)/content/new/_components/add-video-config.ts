import { ContentTab } from "../../_components/listing/listing-config";
import { type VisibleStatusActions, listTabRoute } from "../../_libs/video-form/actions";

/** Add-video only: which status buttons a new video gets, and where its draft lands. */

/** Save Draft lands on the Drafts tab; a failed status call lands there too (the draft exists). */
export const ADD_SAVED = {
  success: "Saved as draft",
  route: listTabRoute(ContentTab.Drafts),
};

export const addStatusFailedTitle = (actionLabel: string) =>
  `Saved as draft, but ${actionLabel} failed`;

/**
 * A new video can always be sent for review; Schedule / Publish skip review, so they also need
 * `content:publish`. They stay disabled until every step is done and a video is uploaded (see
 * `statusActionsHint`) — otherwise a reviewer or viewer gets a half-built title.
 */
export const addStatusActions = ({
  canPublish,
}: {
  canPublish: boolean;
}): VisibleStatusActions => ({
  review: true,
  schedule: canPublish,
  publish: canPublish,
});
