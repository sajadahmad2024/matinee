import { GAME_LIMITS, type QuestSettingsValues } from "@/app/_libs/schemas/games";

import type {
  QuestRuleConfig,
  RewardRuleDto,
  UpdateRewardRuleDto,
} from "../../../_libs/game-types";

type QuestWeeks = QuestSettingsValues["defaultWindowWeeks"];

/** A stored window the form offers (1–4 weeks), else 1. */
const toWeeks = (weeks?: number): QuestWeeks =>
  (GAME_LIMITS.questWeeks as readonly number[]).includes(weeks ?? 0) ? (weeks as QuestWeeks) : 1;

/** The quest rule → the Settings tab's form values (missing keys fall back, spec-12 §10.9). */
export function toQuestSettingsValues(rule: RewardRuleDto): QuestSettingsValues {
  const config = (rule.config ?? {}) as Partial<QuestRuleConfig>;
  return {
    enabled: rule.isEnabled,
    requireAllDefault: config.require_all_default ?? true,
    defaultWindowWeeks: toWeeks(config.default_window_weeks),
    defaultRewardPoints: config.default_points ?? 0,
  };
}

/**
 * Form values → `PATCH /admin/rewards/rules/quest`. The backend replaces `config` wholesale, so
 * the edits are merged into the current config — keys this tab doesn't show (`default_xp`, …) stay.
 */
export function toQuestRuleDto(
  values: QuestSettingsValues,
  currentConfig: RewardRuleDto["config"],
): UpdateRewardRuleDto {
  const edits: QuestRuleConfig = {
    default_points: values.defaultRewardPoints,
    require_all_default: values.requireAllDefault,
    default_window_weeks: values.defaultWindowWeeks,
  };
  return { isEnabled: values.enabled, config: { ...(currentConfig ?? {}), ...edits } };
}
