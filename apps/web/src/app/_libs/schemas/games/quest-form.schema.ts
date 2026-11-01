import { z } from "zod";

import { GAME_LIMITS, pointsSchema, questWeeksSchema } from "./game-shared.schema";

export const QUEST_START_MODES = ["now", "schedule"] as const;
export type QuestStartMode = (typeof QUEST_START_MODES)[number];

/**
 * Create/edit quest form. The mapper turns the start (now, or `startsAt`) + `weeks` into
 * `startAt` / `endAt`. Whether a scheduled start is still far enough ahead is checked on submit,
 * like the ads form, so an untouched start on edit isn't re-validated.
 */
export const questFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name the quest")
      .max(GAME_LIMITS.questNameMax, `Keep the name under ${GAME_LIMITS.questNameMax} characters`),
    description: z.string(),
    /** The uploaded banner (`POST /media/uploads`, usage `banner`); uploads on pick. */
    bannerMediaId: z.string().nullable(),
    curatedContentIds: z.array(z.string()).min(1, "Pick at least one video"),
    /** `now` publishes on save (`startsAt` is ignored); `schedule` starts at `startsAt`. */
    startMode: z.enum(QUEST_START_MODES),
    startsAt: z.date().nullable(),
    weeks: questWeeksSchema,
    unlockThresholdPoints: pointsSchema,
    rewardPoints: pointsSchema,
  })
  .superRefine((values, ctx) => {
    if (values.startMode === "schedule" && !values.startsAt) {
      ctx.addIssue({ code: "custom", path: ["startsAt"], message: "Pick a start date and time" });
    }
  });

export type QuestFormValues = z.infer<typeof questFormSchema>;
