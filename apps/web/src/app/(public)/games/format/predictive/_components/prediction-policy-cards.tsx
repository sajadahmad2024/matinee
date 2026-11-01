"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Coins, Gift, Pencil, Zap } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useUpdateGameRewardRule } from "@/app/_libs/hooks/api/use-admin-games";
import { type PredictionSettingsValues, predictionSettingsSchema } from "@/app/_libs/schemas/games";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";
import { ToggleRow } from "@/components/custom/toggle-row";

import { GAME_FORMATS } from "../../../_libs/game-config";
import type { RewardRuleDto } from "../../../_libs/game-types";
import { CADENCE_OPTIONS, MULTIPLIER_OPTIONS } from "../_libs/prediction-config";
import {
  toPredictionRuleDto,
  toPredictionSettingsValues,
} from "../_libs/prediction-settings-mapper";

const FORMAT = GAME_FORMATS.predictive;

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/**
 * Policy — on/off and the defaults new predictions start from (cadence, entry cost, multiplier,
 * reward), on `reward_rules['prediction']` (spec-12 §10.10). Read-only until Edit; Cancel / Save
 * sit in the card.
 */
export function PredictionPolicyCard({ rule }: { rule: RewardRuleDto }) {
  const [editing, setEditing] = useState(false);
  const { updateRuleMutation } = useUpdateGameRewardRule();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<PredictionSettingsValues>({
    resolver: zodResolver(predictionSettingsSchema),
    defaultValues: toPredictionSettingsValues(rule),
  });

  // follow the saved rule (after a save, or another admin's) while not editing
  useEffect(() => {
    if (!editing) reset(toPredictionSettingsValues(rule));
  }, [rule, editing, reset]);

  const cancel = () => {
    reset(toPredictionSettingsValues(rule));
    setEditing(false);
  };

  const save = (values: PredictionSettingsValues) =>
    updateRuleMutation.mutate(
      // the backend replaces config wholesale: the mapper merges into the current one
      { ruleKey: FORMAT.ruleKey, dto: toPredictionRuleDto(values, rule.config) },
      {
        onSuccess: () => {
          toast.success(`${FORMAT.name} settings saved`);
          reset(values);
          setEditing(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );

  const locked = !editing;

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-base">Policy</CardTitle>
            <CardDescription>
              Predictions cost points to enter; correct ones pay a multiplier. These defaults
              pre-fill Create Prediction (editable per prediction).
            </CardDescription>
          </div>
          {!editing && (
            <CustomButton
              variant="outline"
              size="sm"
              leftIcon={<Pencil className="h-4 w-4" />}
              onClick={() => setEditing(true)}>
              Edit
            </CustomButton>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(save, () => toast.error("Fix the highlighted fields"))}
          noValidate
          className="space-y-4">
          <Controller
            control={control}
            name="enabled"
            render={({ field }) => (
              <ToggleRow
                label="Enabled"
                hint="Turn predictions on/off across the app."
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={locked}
                inline
              />
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <CustomField
              label="Default cadence"
              helperText="Monthly closes entries 1 month after the start, Quarterly 3 months (Custom can be picked per prediction)">
              <div>
                <Controller
                  control={control}
                  name="defaultCadence"
                  render={({ field }) => (
                    <CustomSelect
                      options={CADENCE_OPTIONS}
                      value={field.value}
                      onValueChange={field.onChange}
                      aria-label="Default cadence"
                      disabled={locked}
                    />
                  )}
                />
              </div>
            </CustomField>
            <CustomField
              label={
                <>
                  <Zap className="h-3.5 w-3.5" /> Correct multiplier
                </>
              }
              labelClassName="flex items-center gap-1"
              helperText="Paid predictions: correct picks win entry × multiplier">
              <div>
                <Controller
                  control={control}
                  name="defaultPayoutMultiplier"
                  render={({ field }) => (
                    <CustomSelect
                      options={MULTIPLIER_OPTIONS}
                      value={String(field.value)}
                      onValueChange={(v) => field.onChange(Number(v))}
                      aria-label="Correct multiplier"
                      disabled={locked}
                    />
                  )}
                />
              </div>
            </CustomField>
            <CustomField
              label={
                <>
                  <Coins className="h-3.5 w-3.5" /> Entry cost (pts)
                </>
              }
              labelClassName="flex items-center gap-1"
              htmlFor="prediction-default-entry"
              helperText="0 makes new predictions free to enter"
              error={errors?.defaultEntryCostPoints?.message}>
              <Input
                id="prediction-default-entry"
                type="number"
                disabled={locked}
                {...register("defaultEntryCostPoints", { setValueAs: toNumber })}
              />
            </CustomField>
            <CustomField
              label={
                <>
                  <Gift className="h-3.5 w-3.5" /> Reward points
                </>
              }
              labelClassName="flex items-center gap-1"
              htmlFor="prediction-default-reward"
              helperText="Free predictions (entry 0): correct picks win this"
              error={errors?.defaultRewardPoints?.message}>
              <Input
                id="prediction-default-reward"
                type="number"
                disabled={locked}
                {...register("defaultRewardPoints", { setValueAs: toNumber })}
              />
            </CustomField>
          </div>

          {editing && (
            <div className="flex justify-end gap-2 pt-2">
              <CustomButton
                type="button"
                variant="outline"
                onClick={cancel}
                disabled={updateRuleMutation.isPending}>
                Cancel
              </CustomButton>
              <CustomButton
                type="submit"
                isLoading={updateRuleMutation.isPending}
                loadingText="Saving..."
                disabled={!isDirty}>
                Save
              </CustomButton>
            </div>
          )}
        </form>
      </CardContent>
    </GlassCard>
  );
}
