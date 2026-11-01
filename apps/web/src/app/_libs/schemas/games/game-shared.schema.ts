import { z } from "zod";

/** Limits shared by the Game Management forms; backend limits cite their DTO. */
export const GAME_LIMITS = {
  /** `CreateQuestDto.name` `@MaxLength(200)`. */
  questNameMax: 200,
  /** `CreatePredictionDto.question` `@MaxLength(500)`. */
  questionMax: 500,
  /** `CreateBadgeDto.name` `@MaxLength(150)`. */
  badgeNameMax: 150,
  /** `CreatePredictionDto.options` `@ArrayMinSize(2)`. */
  optionsMin: 2,
  ctaLabelMax: 40,
  /** A scheduled quest starts at least this many minutes from now (sooner = Publish now). */
  scheduleLeadMinutes: 5,
  /** Quest windows the form offers, in weeks. */
  questWeeks: [1, 2, 3, 4] as const,
  /** Correct-answer multipliers the form offers (`payoutMultiplier` is any int ≥ 1). */
  payoutMultipliers: [2, 3, 4, 5, 6, 7, 8, 9, 10] as const,
  /** A prediction's entries close at least this long after it opens. */
  predictionMinWindowMinutes: 60,
} as const;

export const WIDGET_STYLES = ["card", "hero", "carousel"] as const;
/** `CreatePredictionDto.cadence`: the preset entry windows (1 month / 3 months). */
export const PREDICTION_CADENCES = ["monthly", "quarterly"] as const;
/** The form's entry window: a preset cadence, or a custom close date (no cadence sent). */
export const PREDICTION_WINDOWS = [...PREDICTION_CADENCES, "custom"] as const;

const HEX_COLOR = /^#[0-9a-f]{6}$/i;

/** Whole points, never negative. */
export const pointsSchema = z
  .number({ error: "Enter a number" })
  .int("Use whole points")
  .min(0, "Can't be negative");

export const questWeeksSchema = z.union(GAME_LIMITS.questWeeks.map((w) => z.literal(w)));
export const payoutMultiplierSchema = z.union(
  GAME_LIMITS.payoutMultipliers.map((m) => z.literal(m)),
);

/** How a format appears as a widget in the customer app (proposed backend endpoint). */
export const gameWidgetSchema = z.object({
  bannerUrl: z.string().nullable(),
  ctaLabel: z
    .string()
    .trim()
    .min(1, "Enter a button label")
    .max(GAME_LIMITS.ctaLabelMax, `Keep it under ${GAME_LIMITS.ctaLabelMax} characters`),
  style: z.enum(WIDGET_STYLES),
  accent: z.string().regex(HEX_COLOR, "Pick a colour"),
  visible: z.boolean(),
});

/** A rewarded behaviour row (label + fixed points). */
export const behaviourRowSchema = z.object({
  key: z.string(),
  label: z.string().trim().min(1, "Describe the behaviour"),
  points: pointsSchema,
});

export type GameWidgetValues = z.infer<typeof gameWidgetSchema>;
export type BehaviourRowValues = z.infer<typeof behaviourRowSchema>;
