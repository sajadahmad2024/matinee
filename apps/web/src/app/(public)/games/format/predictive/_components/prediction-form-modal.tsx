"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, isPast, startOfToday } from "date-fns";
import { Lock, Plus, Trash2 } from "lucide-react";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import {
  useCreatePrediction,
  usePrediction,
  useUpdatePrediction,
} from "@/app/_libs/hooks/api/use-admin-games";
import {
  GAME_LIMITS,
  type PredictionFormValues,
  type QuestStartMode,
  predictionFormSchema,
} from "@/app/_libs/schemas/games";
import { formatDateTime24, parseApiDate } from "@/app/_libs/utils/format";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomDateTimePicker } from "@/components/custom/custom-date-time-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSelect } from "@/components/custom/custom-select";

import type { GamePrediction, GamePredictionDetail } from "../../../_libs/game-types";
import {
  MULTIPLIER_OPTIONS,
  PAYOUT_HINTS,
  PREDICTION_EDITABLE,
  PREDICTION_START_MODE_OPTIONS,
  PREDICTION_STATUS_LABELS,
  type PredictionFieldGroup,
  WINDOW_OPTIONS,
  predictionPayout,
  predictionStatus,
} from "../_libs/prediction-config";
import {
  type PredictionFormDefaults,
  predictionWindow,
  toCreatePredictionDto,
  toPredictionFormValues,
  toUpdatePredictionDto,
} from "../_libs/prediction-form-mapper";

const FORM_ID = "prediction-form";

/**
 * The pickers are outline buttons (`bg-background`); this gives them the inputs' and selects'
 * transparent background and hover, so every field in the form looks the same.
 */
const PICKER_CLASS = "bg-transparent hover:bg-transparent dark:hover:bg-input/50";

/** A scheduled start is at least `scheduleLeadMinutes` ahead (sooner = Publish now). */
const earliestScheduledStart = () => addMinutes(new Date(), GAME_LIMITS.scheduleLeadMinutes);

/** A new prediction: every field. */
const ALL_GROUPS: readonly PredictionFieldGroup[] = ["copy", "schedule", "close", "value"];

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

interface PredictionFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The prediction being edited; a new prediction when absent. */
  prediction?: GamePrediction | null;
  defaults: PredictionFormDefaults;
}

/**
 * Create (published now or scheduled — no drafts, as quests) or edit a prediction: question,
 * options, stakes, schedule and gate. Editing locks what the prediction's status locks on the
 * backend.
 */
export function PredictionFormModal({
  open,
  onOpenChange,
  prediction,
  defaults,
}: PredictionFormModalProps) {
  const { createPredictionMutation } = useCreatePrediction();
  const { updatePredictionMutation } = useUpdatePrediction();
  // editing needs the detail (the options)
  const { predictionQuery, prediction: detail } = usePrediction(open ? prediction?.id : undefined);
  const isEdit = !!prediction;
  const isSaving = createPredictionMutation.isPending || updatePredictionMutation.isPending;
  const [isDirty, setIsDirty] = useState(false);
  const [startMode, setStartMode] = useState<QuestStartMode>("now");
  const startsNow = !isEdit && startMode === "now";

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Prediction" : "Create Prediction"}
      size="lg"
      appearance="default"
      className="max-h-[95vh] overflow-y-auto"
      footer={
        <>
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            form={FORM_ID}
            isLoading={isSaving}
            loadingText={isEdit ? "Saving..." : startsNow ? "Publishing..." : "Scheduling..."}
            // editing: nothing to save until a field differs from the prediction
            disabled={isEdit && (!detail || !isDirty)}>
            {isEdit ? "Save changes" : startsNow ? "Publish" : "Schedule"}
          </CustomButton>
        </>
      }>
      {isEdit && predictionQuery.isPending ? (
        <Skeleton className="bg-muted/20 h-[480px] w-full rounded-lg" />
      ) : (
        <PredictionForm
          key={prediction?.id ?? "new"}
          prediction={detail}
          editable={prediction ? PREDICTION_EDITABLE[predictionStatus(prediction)] : ALL_GROUPS}
          lockedHint={
            prediction
              ? `${PREDICTION_STATUS_LABELS[predictionStatus(prediction)] ?? prediction.status} prediction`
              : ""
          }
          defaults={defaults}
          onDirtyChange={setIsDirty}
          onStartModeChange={setStartMode}
          onSubmit={(values, dirty) => {
            const done = (message: string) => ({
              onSuccess: () => {
                toast.success(message);
                onOpenChange(false);
              },
              onError: (error: Error) => toast.error(error.message),
            });
            if (prediction) {
              updatePredictionMutation.mutate(
                { id: prediction.id, dto: toUpdatePredictionDto(values, dirty) },
                done("Prediction saved"),
              );
            } else {
              createPredictionMutation.mutate(
                toCreatePredictionDto(values),
                done(values.startMode === "now" ? "Prediction is live" : "Prediction scheduled"),
              );
            }
          }}
        />
      )}
    </CustomModal>
  );
}

function PredictionForm({
  prediction,
  editable,
  lockedHint,
  defaults,
  onDirtyChange,
  onStartModeChange,
  onSubmit,
}: {
  prediction?: GamePredictionDetail;
  /** The field groups the prediction's status still allows. */
  editable: readonly PredictionFieldGroup[];
  /** "Active prediction" — names why fields are locked. */
  lockedHint: string;
  defaults: PredictionFormDefaults;
  onDirtyChange: (dirty: boolean) => void;
  onStartModeChange: (mode: QuestStartMode) => void;
  onSubmit: (
    values: PredictionFormValues,
    dirty: Partial<Record<keyof PredictionFormValues, unknown>>,
  ) => void;
}) {
  // the backend fixes options, cadence and the unlock requirement once a prediction exists
  const isEdit = !!prediction;
  const canEdit = (group: PredictionFieldGroup) => editable?.includes(group);
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<PredictionFormValues>({
    resolver: zodResolver(predictionFormSchema),
    defaultValues: toPredictionFormValues(prediction, defaults),
  });
  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

  const [startMode, startsAt, entryWindow, endsAt, entryCost, multiplier, reward] = useWatch({
    control,
    name: [
      "startMode",
      "startsAt",
      "entryWindow",
      "endsAt",
      "entryCostPoints",
      "payoutMultiplier",
      "rewardPoints",
    ],
  });
  // a paid prediction pays entry × multiplier, a free one the flat reward — the other field is
  // switched off (`predictionPayout`)
  const isPaid = (entryCost ?? 0) > 0;
  useEffect(() => onStartModeChange(startMode), [startMode, onStartModeChange]);
  const startsNow = startMode === "now";
  const options = useFieldArray({ control, name: "options" });
  // the list's own error (too few), else the first blank option's
  const optionsError =
    errors?.options?.message ??
    errors?.options?.root?.message ??
    (Array.isArray(errors?.options)
      ? errors.options?.find((e) => e?.label)?.label?.message
      : undefined);

  return (
    <form
      id={FORM_ID}
      onSubmit={handleSubmit((values) => {
        // a scheduled start has to be ahead; an untouched start on edit is left alone
        const scheduled = values.startMode === "schedule" ? values.startsAt : null;
        if (
          scheduled &&
          isPast(addMinutes(scheduled, -GAME_LIMITS.scheduleLeadMinutes)) &&
          (!isEdit || dirtyFields?.startsAt)
        ) {
          setError("startsAt", {
            message: `Pick a time at least ${GAME_LIMITS.scheduleLeadMinutes} minutes from now, or Publish now`,
          });
          return;
        }
        // entries close at least an hour after they open (a preset is a month or more)
        const range = predictionWindow(values);
        const windowChanged =
          !isEdit || dirtyFields?.startsAt || dirtyFields?.entryWindow || dirtyFields?.endsAt;
        const minClose = addMinutes(range.start, GAME_LIMITS.predictionMinWindowMinutes);
        if (windowChanged && range.end < minClose) {
          setError("endsAt", {
            message: `Close at least ${GAME_LIMITS.predictionMinWindowMinutes / 60} hour after it opens`,
          });
          return;
        }
        // a live prediction's close can only move later (backend `extendOnly`)
        const savedEnd = parseApiDate(prediction?.endAt);
        if (isEdit && !canEdit("schedule") && windowChanged && savedEnd && range.end < savedEnd) {
          setError(values.entryWindow === "custom" ? "endsAt" : "entryWindow", {
            message: `A live prediction's close can only move later than ${formatDateTime24(prediction?.endAt)}`,
          });
          return;
        }
        onSubmit(values, dirtyFields);
      })}
      noValidate
      className="space-y-4 py-1">
      <CustomField label="Question" htmlFor="prediction-question" error={errors?.question?.message}>
        <Input
          id="prediction-question"
          placeholder="e.g., Who wins Best Picture at the IIFA awards?"
          disabled={!canEdit("copy")}
          {...register("question")}
        />
      </CustomField>

      <CustomField label="Description" htmlFor="prediction-description">
        <Textarea
          id="prediction-description"
          placeholder="Brief description…"
          rows={2}
          className="resize-none"
          disabled={!canEdit("copy")}
          {...register("description")}
        />
      </CustomField>

      {/* TODO(spec-12 §10.10): app banner, visual element and option media once the backend
          accepts them (`bannerMediaId` on create/update, option media on create) */}
      <div className="space-y-3">
        <CustomField label="Answer options" error={optionsError}>
          {options.fields?.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                placeholder={`Option ${index + 1}`}
                aria-label={`Option ${index + 1}`}
                aria-invalid={!!errors?.options?.[index]?.label}
                className="flex-1"
                disabled={isEdit}
                {...register(`options.${index}.label`)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove option ${index + 1}`}
                className="text-muted-foreground hover:text-destructive h-9 w-9"
                onClick={() => options.remove(index)}
                disabled={isEdit || options.fields.length <= GAME_LIMITS.optionsMin}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isEdit}
            onClick={() => options.append({ label: "" })}>
            <Plus className="h-4 w-4" /> Add option
          </Button>
        </CustomField>

        <div className="grid grid-cols-2 gap-4">
          <CustomField
            label="Entry cost (pts)"
            htmlFor="prediction-entry"
            error={errors?.entryCostPoints?.message}>
            <Input
              id="prediction-entry"
              type="number"
              disabled={!canEdit("value")}
              {...register("entryCostPoints", { setValueAs: toNumber })}
            />
          </CustomField>
          <CustomField
            label="Correct multiplier"
            helperText={isPaid ? undefined : PAYOUT_HINTS.multiplierIgnored}>
            <div>
              <Controller
                control={control}
                name="payoutMultiplier"
                render={({ field }) => (
                  <CustomSelect
                    options={MULTIPLIER_OPTIONS}
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                    disabled={!canEdit("value") || !isPaid}
                    aria-label="Correct multiplier"
                  />
                )}
              />
            </div>
          </CustomField>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <CustomField
          label="Unlock requirement (pts)"
          htmlFor="prediction-unlock"
          helperText="0 = open to everyone"
          error={errors?.unlockThresholdPoints?.message}>
          <div className="relative">
            <Lock className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              id="prediction-unlock"
              type="number"
              className="pl-9"
              disabled={isEdit}
              {...register("unlockThresholdPoints", { setValueAs: toNumber })}
            />
          </div>
        </CustomField>

        <CustomField
          label="Reward points"
          htmlFor="prediction-reward"
          helperText={isPaid ? PAYOUT_HINTS.rewardIgnored : undefined}
          error={errors?.rewardPoints?.message}>
          <Input
            id="prediction-reward"
            type="number"
            disabled={!canEdit("value") || isPaid}
            {...register("rewardPoints", { setValueAs: toNumber })}
          />
        </CustomField>
      </div>
      <p className="text-muted-foreground text-xs">
        {predictionPayout(entryCost, multiplier, reward)}
      </p>

      <div className="space-y-4">
        {!isEdit && (
          <Controller
            control={control}
            name="startMode"
            render={({ field }) => (
              <RadioGroup
                value={field.value}
                onValueChange={(mode) => field.onChange(mode as QuestStartMode)}
                className="flex gap-6">
                {PREDICTION_START_MODE_OPTIONS?.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`prediction-start-${option.value}`}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`prediction-start-${option.value}`}
                      className="cursor-pointer font-normal">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          />
        )}
        <div className="grid grid-cols-2 gap-4">
          {startsNow ? (
            <CustomField label="Start" htmlFor="prediction-starts-at">
              <p id="prediction-starts-at" className="text-muted-foreground py-2 text-sm">
                Goes live as soon as you publish
              </p>
            </CustomField>
          ) : (
            <Controller
              control={control}
              name="startsAt"
              render={({ field }) => (
                <CustomField
                  label="Start"
                  htmlFor="prediction-starts-at"
                  error={errors?.startsAt?.message}>
                  <CustomDateTimePicker
                    id="prediction-starts-at"
                    className={PICKER_CLASS}
                    value={field.value ?? undefined}
                    onChange={(date) => field.onChange(date ?? null)}
                    isDateDisabled={(day) => day < startOfToday()}
                    getMinDate={canEdit("schedule") ? earliestScheduledStart : undefined}
                    disabled={!canEdit("schedule")}
                  />
                </CustomField>
              )}
            />
          )}
          <CustomField label="Cadence" error={errors?.entryWindow?.message}>
            <div>
              <Controller
                control={control}
                name="entryWindow"
                render={({ field }) => (
                  <CustomSelect
                    options={WINDOW_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={!canEdit("close")}
                    aria-label="Cadence"
                  />
                )}
              />
            </div>
          </CustomField>
        </div>
        {entryWindow === "custom" ? (
          <Controller
            control={control}
            name="endsAt"
            render={({ field }) => (
              <CustomField
                label="Entries close"
                htmlFor="prediction-ends-at"
                helperText="Set it before the outcome is known (e.g. before the award ceremony)"
                error={errors?.endsAt?.message}>
                <CustomDateTimePicker
                  id="prediction-ends-at"
                  className={PICKER_CLASS}
                  value={field.value ?? undefined}
                  onChange={(date) => field.onChange(date ?? null)}
                  isDateDisabled={(day) => day < startOfToday()}
                  disabled={!canEdit("close")}
                />
              </CustomField>
            )}
          />
        ) : (
          (startsNow || startsAt) && (
            <p className="text-muted-foreground text-xs">
              Entries close {startsNow ? "about " : ""}
              {formatDateTime24(
                predictionWindow({ startMode, startsAt, entryWindow, endsAt }).endAt,
              )}{" "}
              ({entryWindow === "quarterly" ? "3 months" : "1 month"} after it opens)
            </p>
          )
        )}
        {errors?.endsAt?.message && entryWindow !== "custom" && (
          <p className="text-destructive text-xs">{errors.endsAt.message}</p>
        )}
      </div>

      {isEdit && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Lock className="h-3 w-3" />
          {canEdit("schedule") && canEdit("value")
            ? "Options and the unlock requirement can't change after create."
            : `${lockedHint}: only the question, description and a later close can change.`}
        </p>
      )}
    </form>
  );
}
