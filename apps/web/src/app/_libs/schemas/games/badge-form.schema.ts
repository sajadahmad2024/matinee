import { z } from "zod";

import { CreateBadgeDtoOperatorEnum } from "@/app/_libs/api/generated";

import { GAME_LIMITS, pointsSchema } from "./game-shared.schema";

/** Create/edit badge form: name, copy, and the criteria the badge engine awards on. */
export const badgeFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name the badge")
    .max(GAME_LIMITS.badgeNameMax, `Keep the name under ${GAME_LIMITS.badgeNameMax} characters`),
  description: z.string(),
  /** A key from `GET /admin/badges/triggers`. */
  triggerKey: z.string().min(1, "Pick a trigger"),
  operator: z.enum(Object.values(CreateBadgeDtoOperatorEnum), { error: "Pick an operator" }),
  threshold: z.number({ error: "Enter a value" }),
  /** Optional in the form; saved as 0. */
  rewardPoints: pointsSchema.optional(),
  /** Earned / locked state icons: uploaded media ids, `null` when there's none. */
  activeIconMediaId: z.string().nullable(),
  inactiveIconMediaId: z.string().nullable(),
});

export type BadgeFormValues = z.infer<typeof badgeFormSchema>;
