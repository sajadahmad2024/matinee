// Weekly Quests config: status labels, list filters and display helpers. Statuses and their rules
// mirror `apps/backend/src/games/quests/quest.service.ts`.
import { GAME_LIMITS, type QuestStartMode } from "@/app/_libs/schemas/games";
import { formatDateRange } from "@/app/_libs/utils/format";

import { type GameQuest, type QuestStatus, QuestStatusEnum } from "../../../_libs/game-types";
import type { InstanceFilter } from "../../../_shared/instances/instance-list";

/** The backend calls a running quest `active`; admins know it as "Live" (same as ads). */
export const QUEST_STATUS_LABELS: Record<QuestStatus, string> = {
  [QuestStatusEnum.Draft]: "Draft",
  [QuestStatusEnum.Scheduled]: "Scheduled",
  [QuestStatusEnum.Active]: "Live",
  [QuestStatusEnum.Ended]: "Ended",
  [QuestStatusEnum.Cancelled]: "Cancelled",
  [QuestStatusEnum.Archived]: "Archived",
};

/** The statuses the list shows; drafts, cancelled and archived quests aren't listed. */
export const QUEST_LIST_STATUSES = [
  QuestStatusEnum.Active,
  QuestStatusEnum.Scheduled,
  QuestStatusEnum.Ended,
] as const;

/**
 * List tabs: All · Live · Scheduled · Ended. Each loads only its own statuses from the server; All
 * walks Live, then Scheduled, then Ended (`useInfiniteQuests` chains them, a page at a time).
 */
export const QUEST_FILTERS: InstanceFilter<QuestStatus>[] = [
  { key: "all", label: "All", statuses: QUEST_LIST_STATUSES },
  { key: "live", label: "Live", statuses: [QuestStatusEnum.Active] },
  { key: "scheduled", label: "Scheduled", statuses: [QuestStatusEnum.Scheduled] },
  { key: "ended", label: "Ended", statuses: [QuestStatusEnum.Ended] },
];

/** The quest start-mode radio, as in the ads form. */
export const QUEST_START_MODE_OPTIONS: { value: QuestStartMode; label: string }[] = [
  { value: "now", label: "Publish now" },
  { value: "schedule", label: "Schedule" },
];

/** A row menu entry. */
export type QuestRowAction = "view" | "results" | "edit" | "publish" | "end" | "delete";

/**
 * Which row actions each status offers — View details, View results, Edit, Publish, End now, Delete. "Publish" is the backend's
 * `publish` on a draft and `activate` (go live now) on a scheduled quest. Delete is a hard delete
 * (participations cascade), so it's only offered before a quest goes live; finished quests are
 * read-only (details and results). Edit follows the editability matrix (`QUEST_EDITABLE`).
 */
export const QUEST_ALLOWED_ACTIONS: Record<QuestStatus, readonly QuestRowAction[]> = {
  [QuestStatusEnum.Draft]: ["view", "results", "edit", "publish", "delete"],
  [QuestStatusEnum.Scheduled]: ["view", "results", "edit", "publish", "delete"],
  [QuestStatusEnum.Active]: ["view", "results", "edit", "end"],
  // finished quests (the Ended tab) are read-only: no edit, no delete
  [QuestStatusEnum.Ended]: ["view", "results"],
  [QuestStatusEnum.Cancelled]: ["view", "results"],
  [QuestStatusEnum.Archived]: ["view", "results"],
};

export const canQuest = (status: QuestStatus, action: QuestRowAction) =>
  QUEST_ALLOWED_ACTIONS[status]?.includes(action) ?? false;

/** Form field groups, as the backend's editability matrix groups them. */
export type QuestFieldGroup = "copy" | "schedule" | "value";

/**
 * What each status can still edit — `MATRIX` in `game-access/instance-editability.ts`. Active may
 * extend its end date on the backend; the form doesn't offer that (weeks stay locked).
 */
export const QUEST_EDITABLE: Record<QuestStatus, readonly QuestFieldGroup[]> = {
  [QuestStatusEnum.Draft]: ["copy", "schedule", "value"],
  [QuestStatusEnum.Scheduled]: ["copy", "schedule", "value"],
  [QuestStatusEnum.Active]: ["copy"],
  [QuestStatusEnum.Ended]: ["copy"],
  [QuestStatusEnum.Cancelled]: [],
  [QuestStatusEnum.Archived]: [],
};

/** The DTO types `status` as `string` (spec-12 §2.1); every value is a `QuestStatus`. */
export const questStatus = (quest: GameQuest) => quest.status as QuestStatus;

/** "Nov 2, 09:00 → Nov 9, 09:00"; drafts read "Unpublished" (spec-12 §6.1). */
export const questSchedule = (quest: GameQuest) =>
  questStatus(quest) === QuestStatusEnum.Draft
    ? "Unpublished"
    : formatDateRange(quest.startAt, quest.endAt, { short: true, withTime: true });

/**
 * The list row's muted line: "Nov 2, 09:00 → Nov 9, 09:00 · 100 pts", plus "· 1,240 players · 380
 * completed" once the quest has opened (stats from `QuestDto`).
 */
export function questMeta(quest: GameQuest) {
  const status = questStatus(quest);
  const base = `${questSchedule(quest)} · ${quest?.rewardPoints ?? 0} pts`;
  if (status === QuestStatusEnum.Draft || status === QuestStatusEnum.Scheduled) return base;
  const players = quest?.participantCount ?? 0;
  return `${base} · ${players.toLocaleString()} player${players === 1 ? "" : "s"} · ${(quest?.completedCount ?? 0).toLocaleString()} completed`;
}

export const QUEST_WEEK_OPTIONS = GAME_LIMITS.questWeeks?.map((w) => ({
  value: String(w),
  label: `${w} Week${w === 1 ? "" : "s"}`,
}));
