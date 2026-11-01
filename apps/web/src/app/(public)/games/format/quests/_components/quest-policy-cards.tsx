"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarClock, Pencil } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useUpdateGameRewardRule } from "@/app/_libs/hooks/api/use-admin-games";
import { type QuestSettingsValues, questSettingsSchema } from "@/app/_libs/schemas/games";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";
import { ToggleRow } from "@/components/custom/toggle-row";

import { GAME_FORMATS } from "../../../_libs/game-config";
import type { RewardRuleDto } from "../../../_libs/game-types";
import { QUEST_WEEK_OPTIONS } from "../_libs/quest-config";
import { toQuestRuleDto, toQuestSettingsValues } from "../_libs/quest-settings-mapper";

const FORMAT = GAME_FORMATS.quests;

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/**
 * Policy — on/off and the defaults new quests start from (require-all, window, reward), on
 * `reward_rules['quest']` (spec-12 §10.9). Read-only until Edit; Cancel / Save sit in the card.
 */
export function QuestPolicyCard({ rule }: { rule: RewardRuleDto }) {
  const [editing, setEditing] = useState(false);
  const { updateRuleMutation } = useUpdateGameRewardRule();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<QuestSettingsValues>({
    resolver: zodResolver(questSettingsSchema),
    defaultValues: toQuestSettingsValues(rule),
  });

  // follow the saved rule (after a save, or another admin's) while not editing
  useEffect(() => {
    if (!editing) reset(toQuestSettingsValues(rule));
  }, [rule, editing, reset]);

  const cancel = () => {
    reset(toQuestSettingsValues(rule));
    setEditing(false);
  };

  const save = (values: QuestSettingsValues) =>
    updateRuleMutation.mutate(
      // the backend replaces config wholesale: the mapper merges into the current one
      { ruleKey: FORMAT.ruleKey, dto: toQuestRuleDto(values, rule.config) },
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
              Defaults for new quests. The rule for each quest is set when you create it.
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
                hint="Turn weekly quests on/off across the app."
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={locked}
                inline
              />
            )}
          />
          <Controller
            control={control}
            name="requireAllDefault"
            render={({ field }) => (
              <ToggleRow
                label="Require all videos by default"
                hint="New quests complete only when every selected video is watched."
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={locked}
                inline
              />
            )}
          />
          <CustomField label="Default window">
            <div>
              <Controller
                control={control}
                name="defaultWindowWeeks"
                render={({ field }) => (
                  <CustomSelect
                    options={QUEST_WEEK_OPTIONS}
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                    aria-label="Default window"
                    disabled={locked}
                  />
                )}
              />
            </div>
          </CustomField>
          <CustomField
            label="Default reward points"
            htmlFor="quest-default-reward"
            error={errors?.defaultRewardPoints?.message}>
            <Input
              id="quest-default-reward"
              type="number"
              disabled={locked}
              {...register("defaultRewardPoints", { setValueAs: toNumber })}
            />
          </CustomField>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <CalendarClock className="h-3.5 w-3.5" />
            Pre-fills Create Quest (editable per quest). Schedule quests ahead; they go live at
            their start time.
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
