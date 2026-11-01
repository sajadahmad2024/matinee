"use client";

import { useEffect, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, isPast, startOfToday } from "date-fns";
import { Lock } from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";

import { useCreateQuest, useQuest, useUpdateQuest } from "@/app/_libs/hooks/api/use-admin-games";
import {
  GAME_LIMITS,
  type QuestFormValues,
  type QuestStartMode,
  questFormSchema,
} from "@/app/_libs/schemas/games";
import { formatDateTime24 } from "@/app/_libs/utils/format";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomDateTimePicker } from "@/components/custom/custom-date-time-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSelect } from "@/components/custom/custom-select";

import { type GameQuest, type GameQuestDetail, QuestStatusEnum } from "../../../_libs/game-types";
import {
  QUEST_EDITABLE,
  QUEST_START_MODE_OPTIONS,
  QUEST_WEEK_OPTIONS,
  type QuestFieldGroup,
  questStatus,
} from "../_libs/quest-config";
import {
  type QuestFormDefaults,
  questWindow,
  toCreateQuestDto,
  toQuestFormValues,
  toUpdateQuestDto,
} from "../_libs/quest-form-mapper";
import { QuestBannerField } from "./quest-banner-field";
import { QuestVideoPicker } from "./quest-video-picker";

const FORM_ID = "quest-form";

/** A new quest edits everything. */
const ALL_GROUPS: readonly QuestFieldGroup[] = ["copy", "schedule", "value"];

/** A scheduled start is at least `scheduleLeadMinutes` ahead (sooner = Publish now). */
const earliestScheduledStart = () => addMinutes(new Date(), GAME_LIMITS.scheduleLeadMinutes);

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

interface QuestFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The quest being edited; a new quest when absent. */
  quest?: GameQuest | null;
  defaults: QuestFormDefaults;
  /** The format's "require all videos" default, applied to new quests. */
  requireAll: boolean;
}

/**
 * Create (published now or scheduled — no drafts) or edit a quest: videos, window, unlock
 * threshold and reward. Start choice and calendar follow the ads form.
 */
export function QuestFormModal({
  open,
  onOpenChange,
  quest,
  defaults,
  requireAll,
}: QuestFormModalProps) {
  const { createQuestMutation } = useCreateQuest();
  const { updateQuestMutation } = useUpdateQuest();
  // editing needs the detail (the video set lives on the quest's actions)
  const { questQuery, quest: detail } = useQuest(open ? quest?.id : undefined);
  const isEdit = !!quest;
  const isSaving = createQuestMutation.isPending || updateQuestMutation.isPending;
  const [isDirty, setIsDirty] = useState(false);
  // a banner still uploading would save without it
  const [isUploading, setIsUploading] = useState(false);
  const [startMode, setStartMode] = useState<QuestStartMode>("now");
  const startsNow = !isEdit && startMode === "now";

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Quest" : "Create Quest"}
      size="lg"
      appearance="default"
      className="max-h-[85vh] overflow-y-auto"
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
            // editing: nothing to save until a field differs from the quest
            disabled={isUploading || (isEdit && (!detail || !isDirty))}>
            {isEdit ? "Save changes" : startsNow ? "Publish" : "Schedule"}
          </CustomButton>
        </>
      }>
      {isEdit && questQuery.isPending ? (
        <Skeleton className="bg-muted/20 h-[480px] w-full rounded-lg" />
      ) : (
        <QuestForm
          key={quest?.id ?? "new"}
          quest={detail}
          editable={quest ? QUEST_EDITABLE[questStatus(quest)] : ALL_GROUPS}
          defaults={defaults}
          onDirtyChange={setIsDirty}
          onStartModeChange={setStartMode}
          onUploadingChange={setIsUploading}
          onSubmit={(values, dirty) => {
            const onError = (error: Error) => toast.error(error.message);
            if (quest) {
              updateQuestMutation.mutate(
                { id: quest.id, dto: toUpdateQuestDto(values, dirty) },
                {
                  onSuccess: () => {
                    toast.success("Quest saved");
                    onOpenChange(false);
                  },
                  onError,
                },
              );
            } else {
              createQuestMutation.mutate(toCreateQuestDto(values, requireAll), {
                onSuccess: (published) => {
                  toast.success(
                    published?.status === QuestStatusEnum.Active
                      ? "Quest is live"
                      : "Quest scheduled",
                  );
                  onOpenChange(false);
                },
                onError,
              });
            }
          }}
        />
      )}
    </CustomModal>
  );
}

function QuestForm({
  quest,
  editable,
  defaults,
  onDirtyChange,
  onStartModeChange,
  onUploadingChange,
  onSubmit,
}: {
  quest?: GameQuestDetail;
  /** Field groups the quest's status still allows (all of them for a new quest). */
  editable: readonly QuestFieldGroup[];
  defaults: QuestFormDefaults;
  onDirtyChange: (dirty: boolean) => void;
  onStartModeChange: (mode: QuestStartMode) => void;
  onUploadingChange: (uploading: boolean) => void;
  onSubmit: (
    values: QuestFormValues,
    dirty: Partial<Record<keyof QuestFormValues, unknown>>,
  ) => void;
}) {
  const isEdit = !!quest;
  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<QuestFormValues>({
    resolver: zodResolver(questFormSchema),
    defaultValues: toQuestFormValues(quest, defaults),
  });

  useEffect(() => onDirtyChange(isDirty), [isDirty, onDirtyChange]);

  const [startMode, startsAt, weeks] = useWatch({
    control,
    name: ["startMode", "startsAt", "weeks"],
  });
  useEffect(() => onStartModeChange(startMode), [startMode, onStartModeChange]);
  const startsNow = startMode === "now";

  const canEdit = (group: QuestFieldGroup) => editable?.includes(group);
  const lockedHint =
    quest?.status === QuestStatusEnum.Active
      ? "Locked while the quest is live"
      : "Locked once the quest has ended";

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
        onSubmit(values, dirtyFields);
      })}
      noValidate
      className="space-y-5 py-2">
      <CustomField label="Quest name" htmlFor="quest-name" error={errors?.name?.message}>
        <Input
          id="quest-name"
          placeholder="e.g., Marvel Marathon Week"
          autoComplete="off"
          disabled={!canEdit("copy")}
          {...register("name")}
        />
      </CustomField>

      <CustomField label="Description" htmlFor="quest-description">
        <Textarea
          id="quest-description"
          placeholder="Brief description…"
          rows={2}
          className="resize-none"
          disabled={!canEdit("copy")}
          {...register("description")}
        />
      </CustomField>

      <CustomField label="App banner (widget)">
        <Controller
          control={control}
          name="bannerMediaId"
          render={({ field }) => (
            <QuestBannerField
              value={field.value}
              onChange={field.onChange}
              onUploadingChange={onUploadingChange}
              savedUrl={quest?.bannerUrl}
              disabled={!canEdit("copy")}
            />
          )}
        />
      </CustomField>

      <Controller
        control={control}
        name="curatedContentIds"
        render={({ field }) => (
          <CustomField
            label={`Videos to watch (${field.value?.length ?? 0} selected)`}
            error={errors?.curatedContentIds?.message}
            className="space-y-3">
            {/* `UpdateQuestDto` has no actions: the set is fixed once the quest exists */}
            {isEdit ? (
              <p className="text-muted-foreground text-xs">
                The video set can&apos;t change after the quest is created — create a new quest to
                use a different set.
              </p>
            ) : (
              <QuestVideoPicker value={field.value} onChange={field.onChange} />
            )}
          </CustomField>
        )}
      />

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
                {QUEST_START_MODE_OPTIONS?.map((option) => (
                  <div key={option.value} className="flex items-center gap-2">
                    <RadioGroupItem
                      value={option.value}
                      id={`quest-start-${option.value}`}
                      className="cursor-pointer"
                    />
                    <Label
                      htmlFor={`quest-start-${option.value}`}
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
            <CustomField label="Start" htmlFor="quest-starts-at">
              <p id="quest-starts-at" className="text-muted-foreground py-2 text-sm">
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
                  htmlFor="quest-starts-at"
                  error={errors?.startsAt?.message}>
                  <CustomDateTimePicker
                    id="quest-starts-at"
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
          <CustomField label="Number of weeks">
            <div>
              <Controller
                control={control}
                name="weeks"
                render={({ field }) => (
                  <CustomSelect
                    options={QUEST_WEEK_OPTIONS}
                    value={String(field.value)}
                    onValueChange={(v) => field.onChange(Number(v))}
                    aria-label="Number of weeks"
                    disabled={!canEdit("schedule")}
                  />
                )}
              />
            </div>
          </CustomField>
        </div>
        {(startsNow || startsAt) && (
          <p className="text-muted-foreground text-xs">
            Ends {startsNow ? "about " : ""}
            {formatDateTime24(questWindow({ startMode, startsAt, weeks }).endAt)}
          </p>
        )}
      </div>

      <CustomField
        label="Unlock requirement (locked until X points)"
        htmlFor="quest-unlock"
        error={errors?.unlockThresholdPoints?.message}>
        <div className="flex items-center gap-2">
          <Lock className="text-muted-foreground h-4 w-4" />
          <Input
            id="quest-unlock"
            type="number"
            className="w-32"
            disabled={!canEdit("value")}
            {...register("unlockThresholdPoints", { setValueAs: toNumber })}
          />
          <span className="text-muted-foreground text-xs">pts — 0 = open to everyone</span>
        </div>
      </CustomField>

      <CustomField
        label="Reward points"
        htmlFor="quest-reward"
        error={errors?.rewardPoints?.message}>
        <Input
          id="quest-reward"
          type="number"
          disabled={!canEdit("value")}
          {...register("rewardPoints", { setValueAs: toNumber })}
        />
      </CustomField>

      {isEdit && !(canEdit("schedule") && canEdit("value")) && (
        <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
          <Lock className="h-3 w-3" />
          {lockedHint}: schedule, unlock requirement and reward can&apos;t change.
        </p>
      )}
    </form>
  );
}
