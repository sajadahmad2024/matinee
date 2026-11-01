"use client";

import { useCallback, useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { isApiError } from "@/app/_libs/api/api-error";
import { useCreateBadge, useUpdateBadge } from "@/app/_libs/hooks/api/use-admin-games";
import { type BadgeFormValues, badgeFormSchema } from "@/app/_libs/schemas/games";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomField } from "@/components/custom/custom-field";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomSelect } from "@/components/custom/custom-select";

import { BADGE_OPERATOR_LABELS } from "../../_libs/game-config";
import type { BadgeDto, BadgeOperator, BadgeTriggerDto } from "../../_libs/game-types";
import { toBadgeDto, toBadgeFormValues, toUpdateBadgeDto } from "../_libs/badge-form-mapper";
import { BadgeIconField } from "./badge-icon-field";

const OPERATOR_OPTIONS = Object.entries(BADGE_OPERATOR_LABELS).map(([value, label]) => ({
  value: value as BadgeOperator,
  label,
}));

/** Empty → `undefined`, so an empty number field shows its placeholder and fails "required". */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

interface BadgeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The badge being edited; a new badge when absent. */
  badge?: BadgeDto | null;
  triggers: BadgeTriggerDto[];
}

/** Create or edit a badge: name, copy, and the criteria the badge engine awards it on. */
export function BadgeFormDialog({ open, onOpenChange, badge, triggers }: BadgeFormDialogProps) {
  const isEdit = !!badge;

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? `Edit Badge — ${badge.name}` : "Create New Badge"}
      size="lg"
      appearance="default"
      className="border-border bg-card max-w-2xl!">
      {/* keyed so switching badges (or create ↔ edit) starts from fresh defaults */}
      <BadgeForm
        key={badge?.id ?? "new"}
        badge={badge}
        triggers={triggers}
        onDone={() => onOpenChange(false)}
      />
    </CustomModal>
  );
}

function BadgeForm({
  badge,
  triggers,
  onDone,
}: {
  badge?: BadgeDto | null;
  triggers: BadgeTriggerDto[];
  onDone: () => void;
}) {
  const isEdit = !!badge;
  const { createBadgeMutation } = useCreateBadge();
  const { updateBadgeMutation } = useUpdateBadge();
  const isSaving = createBadgeMutation.isPending || updateBadgeMutation.isPending;

  // icons upload on pick; submit waits until both slots are done
  const [uploading, setUploading] = useState({ active: false, inactive: false });
  const isUploading = uploading.active || uploading.inactive;
  const onActiveUploading = useCallback(
    (active: boolean) => setUploading((u) => ({ ...u, active })),
    [],
  );
  const onInactiveUploading = useCallback(
    (inactive: boolean) => setUploading((u) => ({ ...u, inactive })),
    [],
  );

  const {
    control,
    register,
    handleSubmit,
    setError,
    formState: { errors, isDirty },
  } = useForm<BadgeFormValues>({
    resolver: zodResolver(badgeFormSchema),
    defaultValues: toBadgeFormValues(badge),
  });

  const onSubmit = (values: BadgeFormValues) => {
    const dto = toBadgeDto(values);
    const callbacks = {
      onSuccess: () => {
        toast.success(isEdit ? `Saved “${dto.name}”` : `Created “${dto.name}”`);
        onDone();
      },
      // 409: the name is taken (badges are keyed by a slug made from it) — show it on the field
      onError: (error: Error) =>
        isApiError(error) && error.statusCode === 409
          ? setError("name", { message: error.message }, { shouldFocus: true })
          : toast.error(error.message),
    };
    if (badge) {
      updateBadgeMutation.mutate({ id: badge.id, dto: toUpdateBadgeDto(values, badge) }, callbacks);
    } else createBadgeMutation.mutate(dto, callbacks);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="-mx-2 max-h-[80vh] space-y-4 overflow-y-auto px-2 py-4">
      <CustomField label="Badge Name" htmlFor="badge-name" error={errors?.name?.message}>
        <Input
          id="badge-name"
          placeholder="e.g., Quiz Master"
          autoComplete="off"
          {...register("name")}
        />
      </CustomField>

      <CustomField
        label="Description"
        htmlFor="badge-description"
        error={errors?.description?.message}>
        <Textarea
          id="badge-description"
          placeholder="Describe how to earn this badge..."
          rows={2}
          className="resize-none"
          {...register("description")}
        />
      </CustomField>

      <CustomField
        label="Icon (Active & Inactive States)"
        helperText="Active shows once earned, Inactive while locked. Square PNG works best.">
        <div className="flex items-center gap-6">
          <Controller
            control={control}
            name="activeIconMediaId"
            render={({ field }) => (
              <BadgeIconField
                label="Active"
                accent
                value={field.value ?? null}
                onChange={(id) => field.onChange(id)}
                savedUrl={badge?.activeIconUrl}
                onUploadingChange={onActiveUploading}
                disabled={isSaving}
              />
            )}
          />
          <Controller
            control={control}
            name="inactiveIconMediaId"
            render={({ field }) => (
              <BadgeIconField
                label="Inactive"
                value={field.value ?? null}
                onChange={(id) => field.onChange(id)}
                savedUrl={badge?.inactiveIconUrl}
                onUploadingChange={onInactiveUploading}
                disabled={isSaving}
              />
            )}
          />
        </div>
      </CustomField>

      <div className="bg-muted/30 space-y-3 rounded-lg p-4">
        <div>
          <Label className="text-sm font-semibold">Criteria Engine</Label>
          <p className="text-muted-foreground text-xs">
            Awarded once the trigger meets the rule; a badge, once earned, is kept forever.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CustomField label="Trigger" labelClassName="text-xs" error={errors?.triggerKey?.message}>
            {/* own wrapper: in a form, Radix adds a hidden <select> beside the trigger */}
            <div>
              <Controller
                control={control}
                name="triggerKey"
                render={({ field }) => (
                  <CustomSelect
                    options={triggers?.map((t) => ({ value: t.key, label: t.label })) ?? []}
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                    placeholder="Select trigger..."
                    aria-label="Trigger"
                    triggerClassName="w-full"
                  />
                )}
              />
            </div>
          </CustomField>
          <CustomField label="Operator" labelClassName="text-xs" error={errors?.operator?.message}>
            <div>
              <Controller
                control={control}
                name="operator"
                render={({ field }) => (
                  <CustomSelect
                    options={OPERATOR_OPTIONS}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder="Select..."
                    aria-label="Operator"
                    triggerClassName="w-full"
                  />
                )}
              />
            </div>
          </CustomField>
          <CustomField
            label="Value"
            htmlFor="badge-threshold"
            labelClassName="text-xs"
            error={errors?.threshold?.message}>
            <Input
              id="badge-threshold"
              type="number"
              placeholder="50"
              {...register("threshold", { setValueAs: toNumber })}
            />
          </CustomField>
          <CustomField
            label="Bonus Points (Optional)"
            htmlFor="badge-reward"
            labelClassName="text-xs"
            error={errors?.rewardPoints?.message}>
            <Input
              id="badge-reward"
              type="number"
              placeholder="500"
              {...register("rewardPoints", { setValueAs: toNumber })}
            />
          </CustomField>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <CustomButton type="button" variant="outline" onClick={onDone} disabled={isSaving}>
          Cancel
        </CustomButton>
        {/* closes from `onSuccess`, once the list has refreshed with the new / edited badge */}
        <CustomButton
          type="submit"
          isLoading={isSaving}
          // editing: nothing to save until a field differs from the badge
          disabled={isUploading || (isEdit && !isDirty)}
          loadingText={isEdit ? "Saving..." : "Creating..."}>
          {isEdit ? "Save changes" : "Create Badge"}
        </CustomButton>
      </div>
    </form>
  );
}
