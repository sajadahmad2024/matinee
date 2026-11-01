import type { SharedContentSettingsValues } from "@/app/_libs/schemas/games";

import type { SharedContentRuleConfig, UpdateRewardRuleDto } from "../../../_libs/game-types";
import {
  type FormatSettingsData,
  toWidgetValues,
} from "../../../_shared/settings/format-settings-form";

/** The shared-content rule and widget → the Settings tab's form values. */
export function toSharedContentSettingsValues({
  rule,
  widget,
}: FormatSettingsData): SharedContentSettingsValues {
  const config = rule.config as Partial<SharedContentRuleConfig>;
  return {
    behaviours: config.behaviours ?? [],
    dailyShareCap: config.daily_share_cap ?? 0,
    widget: toWidgetValues(widget),
  };
}

/**
 * Form values → `PATCH /admin/rewards/rules/shared_content`. The config is merged server-side, so
 * `dedupe_window_hours` (not on this screen) keeps its value.
 */
export function toSharedContentRuleDto(values: SharedContentSettingsValues): UpdateRewardRuleDto {
  const config: Pick<SharedContentRuleConfig, "behaviours" | "daily_share_cap"> = {
    behaviours: values.behaviours,
    daily_share_cap: values.dailyShareCap,
  };
  return { config: { ...config } };
}
