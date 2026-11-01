import { GAME_LIMITS, type PredictionSettingsValues } from "@/app/_libs/schemas/games";

import type {
  PredictionRuleConfig,
  RewardRuleDto,
  UpdateRewardRuleDto,
} from "../../../_libs/game-types";

type Multiplier = PredictionSettingsValues["defaultPayoutMultiplier"];

/** A stored multiplier the form offers (×2–×10), else the seeded ×5. */
const toMultiplier = (m?: number): Multiplier =>
  (GAME_LIMITS.payoutMultipliers.includes(m as Multiplier) ? m : 5) as Multiplier;

/** The prediction rule → the Settings tab's form values (missing keys fall back). */
export function toPredictionSettingsValues(rule: RewardRuleDto): PredictionSettingsValues {
  const config = (rule.config ?? {}) as Partial<PredictionRuleConfig>;
  return {
    enabled: rule.isEnabled,
    defaultCadence: config.default_cadence === "quarterly" ? "quarterly" : "monthly",
    defaultEntryCostPoints: config.default_entry_cost ?? 0,
    defaultPayoutMultiplier: toMultiplier(config.default_multiplier),
    defaultRewardPoints: config.default_points ?? 0,
  };
}

/**
 * Form values → `PATCH /admin/rewards/rules/prediction`. The backend replaces `config` wholesale,
 * so the edits are merged into the current config — keys this tab doesn't show
 * (`free_entries_per_month`, `default_xp`, …) stay.
 */
export function toPredictionRuleDto(
  values: PredictionSettingsValues,
  currentConfig: RewardRuleDto["config"],
): UpdateRewardRuleDto {
  const edits: PredictionRuleConfig = {
    default_cadence: values.defaultCadence,
    default_entry_cost: values.defaultEntryCostPoints,
    default_multiplier: values.defaultPayoutMultiplier,
    default_points: values.defaultRewardPoints,
  };
  return { isEnabled: values.enabled, config: { ...(currentConfig ?? {}), ...edits } };
}
