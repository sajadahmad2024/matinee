import { addDays, differenceInCalendarDays } from "date-fns";

import { GAME_LIMITS, type QuestFormValues } from "@/app/_libs/schemas/games";
import { parseApiDate } from "@/app/_libs/utils/format";

import {
  type CreateQuestDto,
  type GameQuestDetail,
  QuestActionTypeEnum,
  type UpdateQuestDto,
} from "../../../_libs/game-types";

type QuestWeeks = QuestFormValues["weeks"];

const clampWeeks = (weeks: number): QuestWeeks => {
  const allowed = GAME_LIMITS.questWeeks;
  return (allowed?.find((w) => w >= weeks) ?? allowed[allowed.length - 1]) as QuestWeeks;
};

/** Defaults for a new quest come from the quest rule's defaults (Settings → Default rewards). */
export interface QuestFormDefaults {
  weeks: number;
  rewardPoints: number;
}

/** Form values: the format's defaults for a new quest, the quest's values when editing. */
export function toQuestFormValues(
  quest: GameQuestDetail | undefined,
  defaults: QuestFormDefaults,
): QuestFormValues {
  if (!quest) {
    return {
      name: "",
      description: "",
      bannerMediaId: null,
      curatedContentIds: [],
      startMode: "now",
      startsAt: null,
      weeks: clampWeeks(defaults.weeks),
      unlockThresholdPoints: 0,
      rewardPoints: defaults.rewardPoints,
    };
  }
  const start = parseApiDate(quest.startAt);
  const end = parseApiDate(quest.endAt);
  const days = start && end ? differenceInCalendarDays(end, start) : 7;
  return {
    name: quest.name,
    description: quest.description ?? "",
    bannerMediaId: quest.bannerMediaId ?? null,
    curatedContentIds: quest.actions?.[0]?.curatedContentIds ?? [],
    startMode: "schedule",
    startsAt: start ?? null,
    weeks: clampWeeks(Math.max(1, Math.round(days / 7))),
    unlockThresholdPoints: quest.unlockThresholdPoints ?? 0,
    rewardPoints: quest.rewardPoints,
  };
}

/** The window: from now (Publish now) or the scheduled start, `weeks` long. */
export function questWindow(values: Pick<QuestFormValues, "startMode" | "startsAt" | "weeks">) {
  const start = values.startMode === "now" || !values.startsAt ? new Date() : values.startsAt;
  return { startAt: start.toISOString(), endAt: addDays(start, values.weeks * 7).toISOString() };
}

/**
 * Form values → `POST /admin/quests` (then published). The video set is one "watch" action; "require all videos"
 * (the format default) sets its target to the whole set, otherwise any one video completes it.
 */
export function toCreateQuestDto(values: QuestFormValues, requireAll: boolean): CreateQuestDto {
  const ids = values.curatedContentIds;
  return {
    name: values.name.trim(),
    description: values.description.trim() || undefined,
    rewardPoints: values.rewardPoints,
    unlockThresholdPoints: values.unlockThresholdPoints,
    ...(values.bannerMediaId ? { bannerMediaId: values.bannerMediaId } : {}),
    ...questWindow(values),
    actions: [
      {
        key: "watch",
        type: QuestActionTypeEnum.Watch,
        title: "Watch the set",
        target: requireAll ? ids.length : 1,
        curatedContentIds: ids,
      },
    ],
  };
}

/** react-hook-form's `dirtyFields`: which form values the admin changed. */
type QuestDirtyFields = Partial<Record<keyof QuestFormValues, unknown>>;

/**
 * Form values → `PATCH /admin/quests/:id`, with only the changed fields: the backend rejects a
 * field its status locks whenever it's present (spec-12 §10.2). Actions (the video set) can't
 * change after create.
 */
export function toUpdateQuestDto(values: QuestFormValues, dirty: QuestDirtyFields): UpdateQuestDto {
  return {
    ...(dirty.name ? { name: values.name.trim() } : {}),
    ...(dirty.description ? { description: values.description.trim() } : {}),
    ...(dirty.rewardPoints ? { rewardPoints: values.rewardPoints } : {}),
    ...(dirty.unlockThresholdPoints ? { unlockThresholdPoints: values.unlockThresholdPoints } : {}),
    // a new id replaces the banner, `null` removes it
    ...(dirty.bannerMediaId ? { bannerMediaId: values.bannerMediaId } : {}),
    ...(dirty.startsAt || dirty.weeks ? questWindow(values) : {}),
  };
}
