// Badges config: icon and trigger labels. Values mirror `apps/backend/src/badges/**`.
import { type LucideIcon, Trophy } from "lucide-react";

import type { BadgeDto, BadgeTriggerDto } from "../../_libs/game-types";

/** Shown for a badge with no earned-state icon (or one whose asset isn't ready yet). */
export const DEFAULT_BADGE_ICON: LucideIcon = Trophy;

/** The trigger's label for a badge card; the raw key if the catalog doesn't list it. */
export const triggerLabel = (triggers: BadgeTriggerDto[], key?: string | null) =>
  triggers?.find((t) => t.key === key)?.label ?? key ?? "";

/** Card menu actions that change a badge. Activate runs straight away; the others ask first. */
export type BadgeAction = "activate" | "deactivate" | "delete";
export type BadgeConfirmAction = Exclude<BadgeAction, "activate">;

/** Toast word per action: “Century Club” activated. */
export const BADGE_ACTION_DONE: Record<BadgeAction, string> = {
  activate: "activated",
  deactivate: "deactivated",
  delete: "deleted",
};

/** Confirmation copy per action, from what the backend does (`badges.service.ts`). */
export const BADGE_CONFIRM: Record<
  BadgeConfirmAction,
  { title: string; confirmLabel: string; description: (badge: BadgeDto) => string }
> = {
  deactivate: {
    title: "Deactivate badge?",
    confirmLabel: "Deactivate",
    description: (b) =>
      `“${b.name}” leaves the app's badge catalog and stops being awarded. Players who already ` +
      "earned it keep it. You can activate it again later.",
  },
  delete: {
    title: "Delete badge?",
    confirmLabel: "Delete",
    description: (b) =>
      `“${b.name}” is removed from the app's badge catalog and is no longer awarded. Players who ` +
      "already earned it keep it.",
  },
};
