"use client";

import { Plus, Trash2 } from "lucide-react";
import { useFieldArray, useFormContext } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import type { BehaviourRowValues } from "@/app/_libs/schemas/games";

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/**
 * Predictable multi-behaviour rewards: each behaviour pays fixed points, no operators or
 * conditions. Points are the only currency in the panel (spec-05 §2.2). Edits the form's
 * `behaviours` (Daily Streak: time-on-app + engagement; Shared Content: internal/external/referral).
 */
export function BehaviourRewardsField({ addLabel = "Add behaviour" }: { addLabel?: string }) {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<{ behaviours: BehaviourRowValues[] }>();
  // `keyName`: rows carry their own `key`, which the default `id` key would sit beside confusingly
  const { fields, append, remove } = useFieldArray({
    control,
    name: "behaviours",
    keyName: "fieldKey",
  });
  const rowErrors = Array.isArray(errors?.behaviours) ? errors.behaviours : [];
  const firstError =
    rowErrors?.find((e) => e)?.label?.message ?? rowErrors?.find((e) => e)?.points?.message;

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground grid grid-cols-12 gap-2 px-1 text-[11px]">
        <span className="col-span-9">Behaviour → fixed reward</span>
        <span className="col-span-2 text-center">Points</span>
        <span className="col-span-1" />
      </div>

      {fields?.map((field, index) => (
        <div
          key={field.fieldKey}
          className="border-border/40 bg-muted/20 grid grid-cols-12 items-center gap-2 rounded-lg border p-2">
          <Input
            aria-label={`Behaviour ${index + 1}`}
            aria-invalid={!!rowErrors[index]?.label}
            className="col-span-9 h-9"
            {...register(`behaviours.${index}.label`)}
          />
          <Input
            type="number"
            min={0}
            aria-label={`Behaviour ${index + 1} points`}
            aria-invalid={!!rowErrors[index]?.points}
            className="col-span-2 h-9 text-center"
            {...register(`behaviours.${index}.points`, { setValueAs: toNumber })}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Remove behaviour ${index + 1}`}
            className="text-muted-foreground hover:text-destructive col-span-1 h-9 w-9"
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

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => append({ key: `b_${Date.now()}`, label: "New behaviour", points: 10 })}>
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
