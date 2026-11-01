import { z } from "zod";

import {
  GAME_LIMITS,
  PREDICTION_WINDOWS,
  payoutMultiplierSchema,
  pointsSchema,
} from "./game-shared.schema";
import { QUEST_START_MODES } from "./quest-form.schema";

// TODO(spec-12 §10.10): option media once `CreatePredictionDto` takes it (responses already
// carry `optionMediaId`)
export const predictionOptionSchema = z.object({
  label: z.string().trim().min(1, "Enter the option"),
});

/**
 * Create/edit prediction form. The mapper turns the start (now, or `startsAt`) and the entry window
 * (1 month, 3 months, or a custom `endsAt`) into `startAt` / `endAt`. Like quests, timing against
 * "now" (a scheduled start far enough ahead, the close after the open) is checked on submit.
 */
export const predictionFormSchema = z
  .object({
    question: z
      .string()
      .trim()
      .min(1, "Enter the question")
      .max(
        GAME_LIMITS.questionMax,
        `Keep the question under ${GAME_LIMITS.questionMax} characters`,
      ),
    description: z.string(),
    options: z
      .array(predictionOptionSchema)
      .min(GAME_LIMITS.optionsMin, `Add at least ${GAME_LIMITS.optionsMin} options`),
    /** `monthly` / `quarterly` close one period after the start; `custom` closes at `endsAt`. */
    entryWindow: z.enum(PREDICTION_WINDOWS),
    endsAt: z.date().nullable(),
    entryCostPoints: pointsSchema,
    payoutMultiplier: payoutMultiplierSchema,
    /** `now` publishes on save (`startsAt` is ignored); `schedule` opens at `startsAt`. */
    startMode: z.enum(QUEST_START_MODES),
    startsAt: z.date().nullable(),
    unlockThresholdPoints: pointsSchema,
    rewardPoints: pointsSchema,
  })
  // Backend: "A prediction must pay something — set entryCostPoints and/or rewardPoints"
  .refine((v) => v.entryCostPoints > 0 || v.rewardPoints > 0, {
    path: ["rewardPoints"],
    message: "Set an entry cost or reward points",
  })
  .refine((v) => v.startMode === "now" || !!v.startsAt, {
    path: ["startsAt"],
    message: "Pick a start date and time",
  })
  .refine((v) => v.entryWindow !== "custom" || !!v.endsAt, {
    path: ["endsAt"],
    message: "Pick when entries close",
  });

export type PredictionFormValues = z.infer<typeof predictionFormSchema>;
export type PredictionOptionValues = z.infer<typeof predictionOptionSchema>;
