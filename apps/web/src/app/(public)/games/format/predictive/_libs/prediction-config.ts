// Predictive config: status labels, list filters, row actions and display helpers. Statuses and
// their rules mirror `apps/backend/src/games/predictions/prediction.service.ts`.
import { format, getQuarter } from "date-fns";

import {
  GAME_LIMITS,
  PREDICTION_CADENCES,
  PREDICTION_WINDOWS,
  type QuestStartMode,
} from "@/app/_libs/schemas/games";
import { formatDateTime24, parseApiDate } from "@/app/_libs/utils/format";

import {
  type GamePrediction,
  type PredictionStatus,
  PredictionStatusEnum,
} from "../../../_libs/game-types";
import type { InstanceFilter } from "../../../_shared/instances/instance-list";
import { presetWindow } from "./prediction-form-mapper";

type PredictionWindow = (typeof PREDICTION_WINDOWS)[number];

/** The backend's `open` / `resolved` read "Live" / "Ended" to admins, like quests. */
export const PREDICTION_STATUS_LABELS: Record<PredictionStatus, string> = {
  [PredictionStatusEnum.Draft]: "Draft",
  [PredictionStatusEnum.Scheduled]: "Scheduled",
  [PredictionStatusEnum.Open]: "Live",
  [PredictionStatusEnum.Locked]: "Awaiting result",
  [PredictionStatusEnum.Paying]: "Paying",
  [PredictionStatusEnum.Resolved]: "Ended",
  [PredictionStatusEnum.Cancelled]: "Cancelled",
  [PredictionStatusEnum.Archived]: "Archived",
};

/** Entries closed, waiting on an admin's Resolve (locked) or paying winners out (paying). */
const AWAITING: readonly PredictionStatus[] = [
  PredictionStatusEnum.Locked,
  PredictionStatusEnum.Paying,
];

/** Not finished: taking entries or awaiting its outcome. */
const LIVE: readonly PredictionStatus[] = [PredictionStatusEnum.Open, ...AWAITING];

/**
 * List tabs: All · Live · Awaiting result · Scheduled · Ended · Cancelled — one status, so one
 * request, each. Awaiting result is the admin's to-do list: locked predictions wait for Resolve
 * (the backend notifies admins when one locks). Ended is resolved; Cancelled is cancelled with
 * every stake refunded (backend `void`). Paying (winners being credited, inside the Confirm
 * request — normally seconds) has no tab: All is unfiltered, so it lists a paying prediction (and
 * a draft left by a failed publish) with its badge.
 */
export const PREDICTION_FILTERS: InstanceFilter<PredictionStatus>[] = [
  { key: "all", label: "All", statuses: "all" },
  { key: "live", label: "Live", statuses: [PredictionStatusEnum.Open] },
  { key: "awaiting", label: "Awaiting result", statuses: [PredictionStatusEnum.Locked] },
  { key: "scheduled", label: "Scheduled", statuses: [PredictionStatusEnum.Scheduled] },
  { key: "ended", label: "Ended", statuses: [PredictionStatusEnum.Resolved] },
  { key: "cancelled", label: "Cancelled", statuses: [PredictionStatusEnum.Cancelled] },
];

export const isPredictionLive = (status: PredictionStatus) => LIVE.includes(status);

/** A row menu entry. */
export type PredictionRowAction =
  | "view"
  | "results"
  | "edit"
  | "publish"
  | "resolve"
  | "void"
  | "reverse"
  | "delete";

/**
 * Which row actions each status offers — the quest menu (View details, View results, Edit, Publish,
 * Delete) plus what only predictions have, from the backend's status checks:
 * - Publish: on a scheduled prediction it moves the start to now (no activate endpoint; the
 *   scheduler opens it within a minute). A draft (only left by a failed publish) is published.
 * - Resolve: awaiting result (locked) only. A live prediction locks itself at its end time; there's
 *   no "End now" — the backend only lets a live prediction's end move later.
 * - Cancel & refund (backend `void`): live or awaiting result, never resolved before (the backend
 *   checks that part). Every stake is refunded; it moves to Cancelled.
 * - Reverse: ended (resolved) only, by a different admin than the one who confirmed it.
 * - Delete: before it goes live (draft / scheduled), as quests.
 * TODO(spec-12 §10.10): Archive once the backend adds `POST /admin/predictions/:id/archive`.
 */
export const PREDICTION_ALLOWED_ACTIONS: Record<PredictionStatus, readonly PredictionRowAction[]> =
  {
    [PredictionStatusEnum.Draft]: ["view", "results", "edit", "publish", "delete"],
    [PredictionStatusEnum.Scheduled]: ["view", "results", "edit", "publish", "delete"],
    [PredictionStatusEnum.Open]: ["view", "results", "edit", "void"],
    [PredictionStatusEnum.Locked]: ["view", "results", "resolve", "void"],
    [PredictionStatusEnum.Paying]: ["view", "results"],
    [PredictionStatusEnum.Resolved]: ["view", "results", "reverse"],
    [PredictionStatusEnum.Cancelled]: ["view", "results"],
    [PredictionStatusEnum.Archived]: ["view", "results"],
  };

export const canPrediction = (status: PredictionStatus, action: PredictionRowAction) =>
  PREDICTION_ALLOWED_ACTIONS[status]?.includes(action) ?? false;

/**
 * Form field groups, as the backend's editability matrix groups them: `schedule` is the start
 * (`windowStart`), `close` the entries-close date (`windowEnd`).
 */
export type PredictionFieldGroup = "copy" | "schedule" | "close" | "value";

/**
 * What each status can still edit — `MATRIX` in `game-access/instance-editability.ts`. A live
 * prediction's close can only move later (`extendOnly`); the form checks that before saving.
 */
export const PREDICTION_EDITABLE: Record<PredictionStatus, readonly PredictionFieldGroup[]> = {
  [PredictionStatusEnum.Draft]: ["copy", "schedule", "close", "value"],
  [PredictionStatusEnum.Scheduled]: ["copy", "schedule", "close", "value"],
  [PredictionStatusEnum.Open]: ["copy", "close"],
  [PredictionStatusEnum.Locked]: [],
  [PredictionStatusEnum.Paying]: [],
  [PredictionStatusEnum.Resolved]: [],
  [PredictionStatusEnum.Cancelled]: [],
  [PredictionStatusEnum.Archived]: [],
};

/** The DTO types `status` as `string` (spec-12 §2.1); every value is a `PredictionStatus`. */
export const predictionStatus = (p: GamePrediction) => p.status as PredictionStatus;

/**
 * "Unpublished" for a draft, "Opens Nov 20, 09:00" before it opens; then its period for a preset
 * window — "Q3 2026" (3 months) or "Jul 2026" (1 month) — or "Closes Nov 22, 18:00" for a custom
 * one.
 */
export function predictionSchedule(p: GamePrediction) {
  const status = predictionStatus(p);
  if (status === PredictionStatusEnum.Draft) return "Unpublished";
  if (status === PredictionStatusEnum.Scheduled) return `Opens ${formatDateTime24(p.startAt)}`;
  const start = parseApiDate(p.startAt);
  if (!start) return "";
  const preset = presetWindow(p);
  if (!preset) return `Closes ${formatDateTime24(p.endAt)}`;
  return preset === "quarterly"
    ? `Q${getQuarter(start)} ${format(start, "yyyy")}`
    : format(start, "MMM yyyy");
}

/** The prediction's cadence: "Monthly", "Quarterly" or "Custom" (its own close date). */
export const predictionWindowLabel = (p: GamePrediction) =>
  WINDOW_LABELS[presetWindow(p) ?? "custom"];

/** "Entry 50 · ×10 · 100 pts" — the reward only when it pays one. */
export const predictionStakes = (p: GamePrediction) =>
  `Entry ${p.entryCostPoints ?? 0} · ×${p.payoutMultiplier ?? 1}` +
  (p.rewardPoints ? ` · ${p.rewardPoints} pts` : "");

/** The quest start-mode radio, as in the ads form. */
export const PREDICTION_START_MODE_OPTIONS: { value: QuestStartMode; label: string }[] = [
  { value: "now", label: "Publish now" },
  { value: "schedule", label: "Schedule" },
];

/**
 * What a correct pick pays, as `confirmResolve` in `prediction.service.ts` pays it: a paid
 * prediction pays entry × multiplier (the reward is ignored); a free one (entry 0) pays the flat
 * reward (the multiplier is ignored).
 */
export function predictionPayout(entryCost?: number, multiplier?: number, reward?: number) {
  const entry = entryCost ?? 0;
  return entry > 0
    ? `Paid: players stake ${entry} pts; correct picks win ${(entry * (multiplier ?? 1)).toLocaleString()} pts (entry × ${multiplier ?? 1}). Reward points don't apply.`
    : `Free to enter: correct picks win ${(reward ?? 0).toLocaleString()} pts (the reward). The multiplier doesn't apply.`;
}

/** Field hints for the field the other stakes make irrelevant. */
export const PAYOUT_HINTS = {
  rewardIgnored: "Only for free predictions (entry cost 0)",
  multiplierIgnored: "Only for paid predictions (entry cost above 0)",
} as const;

const WINDOW_LABELS: Record<PredictionWindow, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  custom: "Custom",
};

/** The preset cadences (Settings → default cadence). */
export const CADENCE_OPTIONS = PREDICTION_CADENCES?.map((value) => ({
  value,
  label: WINDOW_LABELS[value],
}));

/** The form's cadence choices: the presets, or Custom (pick the close date). */
export const WINDOW_OPTIONS = PREDICTION_WINDOWS?.map((value) => ({
  value,
  label: WINDOW_LABELS[value],
}));

export const MULTIPLIER_OPTIONS = GAME_LIMITS.payoutMultipliers?.map((m) => ({
  value: String(m),
  label: `×${m}`,
}));
