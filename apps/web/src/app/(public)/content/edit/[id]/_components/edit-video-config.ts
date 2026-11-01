import { CONTENT_ROUTES } from "../../../_shared/content-config";

/** Save Changes opens the list; a failed status call lands there too (the changes are saved). */
export const EDIT_SAVED = { success: "Video updated", route: CONTENT_ROUTES.LIST };

export const editStatusFailedTitle = (actionLabel: string) =>
  `Changes saved, but ${actionLabel} failed`;
