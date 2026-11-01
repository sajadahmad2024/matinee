import type { DailyStreakSettingsValues } from "@/app/_libs/schemas/games";

import type { DailyStreakRuleConfig, UpdateRewardRuleDto } from "../../../_libs/game-types";
import {
  type FormatSettingsData,
  toWidgetValues,
} from "../../../_shared/settings/format-settings-form";

/** The daily-streak rule and widget → the Settings tab's form values. */
export function toStreakSettingsValues({
  rule,
  widget,
}: FormatSettingsData): DailyStreakSettingsValues {
  const config = rule.config as Partial<DailyStreakRuleConfig>;
  return {
    minWatchSeconds: config.min_watch_seconds ?? 300,
    eligibilityNotification: config.eligibility_notification ?? true,
    progressDisplay: config.progress_display ?? "popup",
    behaviours: config.behaviours ?? [],
    // `bonus_by_run_length` is keyed by run length; the editor lists them shortest first
    milestones: Object.entries(config.bonus_by_run_length ?? {})
      .map(([days, bonusPoints]) => ({ days: Number(days), bonusPoints }))
      .sort((a, b) => a.days - b.days),
    widget: toWidgetValues(widget),
  };
}

/** Form values → `PATCH /admin/rewards/rules/daily_streak`. */
export function toStreakRuleDto(values: DailyStreakSettingsValues): UpdateRewardRuleDto {
  const config: DailyStreakRuleConfig = {
    min_watch_seconds: values.minWatchSeconds,
    eligibility_notification: values.eligibilityNotification,
    progress_display: values.progressDisplay,
    behaviours: values.behaviours,
    bonus_by_run_length: Object.fromEntries(
      values.milestones?.map((m) => [String(m.days), m.bonusPoints]),
    ),
  };
  return { config: { ...config } };
}
