"use client";

import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { DailyStreakSettingsValues } from "@/app/_libs/schemas/games";

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/**
 * Streak milestone bonuses: a plain "run length → fixed bonus points" map (day 7 → +50,
 * day 30 → +300). Reaching the run length pays the bonus once. Edits the form's `milestones`.
 */
export function MilestoneBonusField() {
  const {
    control,
    register,
    getValues,
    formState: { errors },
  } = useFormContext<DailyStreakSettingsValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "milestones" });

  const rowErrors = Array.isArray(errors?.milestones) ? errors.milestones : [];
  const firstError =
    rowErrors?.find((e) => e)?.days?.message ?? rowErrors?.find((e) => e)?.bonusPoints?.message;

  // A new milestone starts a week after the longest one, so it doesn't clash with an existing day.
  const addMilestone = () => {
    const longest = Math.max(0, ...(getValues("milestones") ?? []).map((m) => m.days || 0));
    append({ days: longest + 7, bonusPoints: 0 });
  };

  return (
    <div className="space-y-2">
      {fields.length === 0 && (
        <p className="text-muted-foreground text-sm">No milestone bonuses.</p>
      )}

      {fields?.map((field, index) => (
        <div
          key={field.id}
          className="border-border/40 bg-muted/20 flex items-center gap-2 rounded-lg border p-2">
          <span className="text-muted-foreground w-12 shrink-0 text-xs">Day</span>
          <Input
            type="number"
            min={0}
            aria-label={`Milestone ${index + 1} day`}
            aria-invalid={!!rowErrors[index]?.days}
            className="h-9 w-20"
            {...register(`milestones.${index}.days`, { setValueAs: toNumber })}
          />
          <span className="text-muted-foreground shrink-0 text-xs">day streak</span>
          <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
          <Input
            type="number"
            min={0}
            aria-label={`Milestone ${index + 1} bonus`}
            aria-invalid={!!rowErrors[index]?.bonusPoints}
            className="h-9 w-24"
            {...register(`milestones.${index}.bonusPoints`, { setValueAs: toNumber })}
          />
          <span className="text-muted-foreground shrink-0 text-xs">bonus pts</span>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove milestone ${index + 1}`}
            className="text-muted-foreground hover:text-destructive ml-auto h-9 w-9 shrink-0"
            onClick={() => remove(index)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      {firstError && (
        <p role="alert" className="text-destructive text-sm">
          {firstError}
        </p>
      )}

      <Button type="button" variant="outline" size="sm" onClick={addMilestone} className="gap-2">
        <Plus className="h-4 w-4" /> Add milestone
      </Button>
    </div>
  );
}
