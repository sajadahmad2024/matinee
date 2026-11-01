import { addMonths } from "date-fns";

import { GAME_LIMITS, type PredictionFormValues } from "@/app/_libs/schemas/games";
import { parseApiDate } from "@/app/_libs/utils/format";

import type {
  CreatePredictionDto,
  GamePrediction,
  GamePredictionDetail,
  UpdatePredictionDto,
} from "../../../_libs/game-types";

type Multiplier = PredictionFormValues["payoutMultiplier"];
type EntryWindow = PredictionFormValues["entryWindow"];
type Cadence = Exclude<EntryWindow, "custom">;

/** Defaults for a new prediction come from the prediction rule's defaults (Settings → Policy). */
export interface PredictionFormDefaults {
  cadence: Cadence;
  entryCostPoints: number;
  payoutMultiplier: number;
  rewardPoints: number;
}

/** A multiplier the form offers; anything else (set through the API) shows the seeded ×5. */
export const toMultiplier = (m?: number | null): Multiplier =>
  (GAME_LIMITS.payoutMultipliers.includes(m as Multiplier) ? m : 5) as Multiplier;

const CADENCE_MONTHS: Record<Cadence, number> = { monthly: 1, quarterly: 3 };

const isCadence = (value?: string | null): value is Cadence =>
  value === "monthly" || value === "quarterly";

/**
 * The preset window a prediction was made with, if its dates still match it: `cadence` is stored
 * but never updated, so a close moved by Edit (custom, or extended) no longer counts as one.
 */
export function presetWindow(p: Pick<GamePrediction, "cadence" | "startAt" | "endAt">) {
  const start = parseApiDate(p?.startAt);
  const end = parseApiDate(p?.endAt);
  if (!isCadence(p?.cadence) || !start || !end) return null;
  const expected = addMonths(start, CADENCE_MONTHS[p.cadence]);
  return Math.abs(expected.getTime() - end.getTime()) < 60_000 ? p.cadence : null;
}

const emptyOption = () => ({ label: "" });

/** Form values: the format's defaults for a new prediction, its values when editing. */
export function toPredictionFormValues(
  prediction: GamePredictionDetail | undefined,
  defaults: PredictionFormDefaults,
): PredictionFormValues {
  if (!prediction) {
    return {
      question: "",
      description: "",
      options: [emptyOption(), emptyOption()],
      entryWindow: defaults.cadence,
      endsAt: null,
      entryCostPoints: defaults.entryCostPoints,
      payoutMultiplier: toMultiplier(defaults.payoutMultiplier),
      startMode: "now",
      startsAt: null,
      unlockThresholdPoints: 0,
      rewardPoints: defaults.rewardPoints,
    };
  }
  return {
    question: prediction.question,
    description: prediction.description ?? "",
    options: prediction.options?.map((o) => ({ label: o?.label ?? "" })) ?? [],
    entryWindow: presetWindow(prediction) ?? "custom",
    endsAt: parseApiDate(prediction.endAt) ?? null,
    entryCostPoints: prediction.entryCostPoints ?? 0,
    payoutMultiplier: toMultiplier(prediction.payoutMultiplier),
    startMode: "schedule",
    startsAt: parseApiDate(prediction.startAt) ?? null,
    unlockThresholdPoints: prediction.unlockThresholdPoints ?? 0,
    rewardPoints: prediction.rewardPoints ?? 0,
  };
}

type WindowValues = Pick<PredictionFormValues, "startMode" | "startsAt" | "entryWindow" | "endsAt">;

/**
 * The window: from now (Publish now) or the scheduled start; entries close one period later (1 or
 * 3 months), or at the custom close.
 */
export function predictionWindow(values: WindowValues) {
  const start = values.startMode === "now" || !values.startsAt ? new Date() : values.startsAt;
  const end =
    values.entryWindow === "custom"
      ? (values.endsAt ?? start)
      : addMonths(start, CADENCE_MONTHS[values.entryWindow]);
  return { start, end, startAt: start.toISOString(), endAt: end.toISOString() };
}

/**
 * A scheduled prediction's window moved to start now ("Publish" on a scheduled row). There's no
 * activate endpoint: the backend's scheduler opens it within a minute. A preset window keeps its
 * length; a custom close stays where it is (if it's still ahead).
 */
export function goLiveNowWindow(p: GamePrediction): UpdatePredictionDto {
  const preset = presetWindow(p);
  const { startAt, endAt } = predictionWindow({
    startMode: "now",
    startsAt: null,
    entryWindow: preset ?? "custom",
    endsAt: parseApiDate(p?.endAt) ?? null,
  });
  return preset ? { startAt, endAt } : { startAt };
}

/**
 * Form values → `POST /admin/predictions` (then published). A preset window sends its `cadence`; a
 * custom close sends none. Only option labels go out: option media has no create field yet
 * (spec-12 §10.10).
 */
export function toCreatePredictionDto(values: PredictionFormValues): CreatePredictionDto {
  const { startAt, endAt } = predictionWindow(values);
  return {
    question: values.question.trim(),
    description: values.description.trim() || undefined,
    options: values.options?.map((o) => o.label.trim()),
    ...(values.entryWindow !== "custom" ? { cadence: values.entryWindow } : {}),
    entryCostPoints: values.entryCostPoints,
    payoutMultiplier: values.payoutMultiplier,
    unlockThresholdPoints: values.unlockThresholdPoints,
    rewardPoints: values.rewardPoints,
    startAt,
    endAt,
  };
}

/** react-hook-form's `dirtyFields`: which form values the admin changed. */
type PredictionDirtyFields = Partial<Record<keyof PredictionFormValues, unknown>>;

/**
 * Form values → `PATCH /admin/predictions/:id`, with only the changed fields: the backend rejects a
 * field its status locks whenever it's present. A moved start sends both dates; a moved close alone
 * (the only date a live prediction can change, and only later) sends just `endAt`. Options,
 * cadence and the unlock requirement can't change after create (no update fields for them).
 */
export function toUpdatePredictionDto(
  values: PredictionFormValues,
  dirty: PredictionDirtyFields,
): UpdatePredictionDto {
  const range = predictionWindow(values);
  const closeChanged = dirty.entryWindow || dirty.endsAt;
  return {
    ...(dirty.question ? { question: values.question.trim() } : {}),
    ...(dirty.description ? { description: values.description.trim() } : {}),
    ...(dirty.entryCostPoints ? { entryCostPoints: values.entryCostPoints } : {}),
    ...(dirty.payoutMultiplier ? { payoutMultiplier: values.payoutMultiplier } : {}),
    ...(dirty.rewardPoints ? { rewardPoints: values.rewardPoints } : {}),
    ...(dirty.startsAt
      ? { startAt: range.startAt, endAt: range.endAt }
      : closeChanged
        ? { endAt: range.endAt }
        : {}),
  };
}
