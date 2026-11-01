import { z } from "zod";

import {
  PREDICTION_CADENCES,
  behaviourRowSchema,
  gameWidgetSchema,
  payoutMultiplierSchema,
  pointsSchema,
  questWeeksSchema,
} from "./game-shared.schema";

/**
 * Each format's Settings tab is one form, saved by the header's "Save Changes": the format's
 * reward-rule config and its app widget.
 */
const formatExtras = {
  widget: gameWidgetSchema,
};

export const STREAK_PROGRESS_DISPLAYS = ["popup", "persistent-bar"] as const;

/** A streak milestone: a run of `days` pays `bonusPoints` (`bonus_by_run_length`). */
export const streakMilestoneSchema = z.object({
  days: z.number({ error: "Enter a day count" }).int().min(1, "At least 1 day"),
  bonusPoints: pointsSchema,
});

export const dailyStreakSettingsSchema = z
  .object({
    minWatchSeconds: pointsSchema,
    eligibilityNotification: z.boolean(),
    progressDisplay: z.enum(STREAK_PROGRESS_DISPLAYS),
    behaviours: z.array(behaviourRowSchema),
    milestones: z.array(streakMilestoneSchema),
    ...formatExtras,
  })
  .superRefine((values, ctx) => {
    // `bonus_by_run_length` is keyed by day count, so two rows can't share one
    const seen = new Set<number>();
    values.milestones.forEach((m, i) => {
      if (seen.has(m.days)) {
        ctx.addIssue({
          code: "custom",
          path: ["milestones", i, "days"],
          message: "Another milestone uses this day count",
        });
      }
      seen.add(m.days);
    });
  });

export const sharedContentSettingsSchema = z.object({
  behaviours: z.array(behaviourRowSchema),
  dailyShareCap: pointsSchema,
  ...formatExtras,
});

export const questSettingsSchema = z.object({
  /** `reward_rules['quest'].is_enabled` — the type-level kill switch. */
  enabled: z.boolean(),
  requireAllDefault: z.boolean(),
  defaultWindowWeeks: questWeeksSchema,
  defaultRewardPoints: pointsSchema,
  // no App widget card: the quest's banner is set per quest in its create form
});

export const predictionSettingsSchema = z.object({
  /** `reward_rules['prediction'].is_enabled` — the type-level kill switch. */
  enabled: z.boolean(),
  defaultCadence: z.enum(PREDICTION_CADENCES),
  defaultEntryCostPoints: pointsSchema,
  defaultPayoutMultiplier: payoutMultiplierSchema,
  defaultRewardPoints: pointsSchema,
});

export type DailyStreakSettingsValues = z.infer<typeof dailyStreakSettingsSchema>;
export type StreakMilestoneValues = z.infer<typeof streakMilestoneSchema>;
export type SharedContentSettingsValues = z.infer<typeof sharedContentSettingsSchema>;
export type QuestSettingsValues = z.infer<typeof questSettingsSchema>;
export type PredictionSettingsValues = z.infer<typeof predictionSettingsSchema>;
