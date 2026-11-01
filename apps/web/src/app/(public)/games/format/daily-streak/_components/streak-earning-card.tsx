"use client";

import { Sparkles } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import {
  type DailyStreakSettingsValues,
  STREAK_PROGRESS_DISPLAYS,
} from "@/app/_libs/schemas/games";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";
import { ToggleRow } from "@/components/custom/toggle-row";

import { BehaviourRewardsField } from "../../../_shared/settings/behaviour-rewards-field";
import { MilestoneBonusField } from "./milestone-bonus-field";

const PROGRESS_LABELS: Record<(typeof STREAK_PROGRESS_DISPLAYS)[number], string> = {
  popup: "Popup on icon tap",
  "persistent-bar": "Persistent bar",
};
const PROGRESS_OPTIONS = STREAK_PROGRESS_DISPLAYS?.map((value) => ({
  value,
  label: PROGRESS_LABELS[value],
}));

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/**
 * How a streak day qualifies and what it pays: the minimum watch, the in-app cues, the daily
 * behaviours and the run-length milestones. Fields of the Daily Streak settings form.
 */
export function StreakEarningCard() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<DailyStreakSettingsValues>();
  const minWatchSeconds = useWatch({ control, name: "minWatchSeconds" });

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">Streak earning</CardTitle>
            <CardDescription>
              Autonomous &amp; predictable — qualify each day by watching the minimum and earn a
              fixed reward. Longer streaks pay milestone bonuses.
            </CardDescription>
          </div>
          <Badge variant="secondary" className="gap-1 text-[10px]">
            <Sparkles className="h-3 w-3" /> Autonomous
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <CustomField
          label="Minimum watch to qualify (seconds)"
          htmlFor="streak-min-watch"
          error={errors?.minWatchSeconds?.message}
          helperText={`≈ ${Math.round((minWatchSeconds || 0) / 60)} min per day — time on app, not per video; need not be continuous.`}>
          <Input
            id="streak-min-watch"
            type="number"
            min={0}
            {...register("minWatchSeconds", { setValueAs: toNumber })}
          />
        </CustomField>

        <Controller
          control={control}
          name="eligibilityNotification"
          render={({ field }) => (
            <ToggleRow
              label="Eligibility notification"
              hint="Notify the user in-app when they've hit the threshold and their streak day counts."
              checked={field.value}
              onCheckedChange={field.onChange}
            />
          )}
        />

        <CustomField
          label="Progress display"
          helperText="How the app shows streak progress to the user.">
          <div>
            <Controller
              control={control}
              name="progressDisplay"
              render={({ field }) => (
                <CustomSelect
                  options={PROGRESS_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                  aria-label="Progress display"
                />
              )}
            />
          </div>
        </CustomField>

        <CustomField label="Earning behaviours">
          <BehaviourRewardsField />
        </CustomField>

        <CustomField label="Streak milestone bonuses">
          <MilestoneBonusField />
        </CustomField>

        <p className="text-muted-foreground text-xs">
          Saved as <code>reward_rules[&apos;daily_streak&apos;]</code>:{" "}
          <code>min_watch_seconds</code>, <code>behaviours[]</code> (each fixed points),{" "}
          <code>bonus_by_run_length</code>.
        </p>
      </CardContent>
    </GlassCard>
  );
}
