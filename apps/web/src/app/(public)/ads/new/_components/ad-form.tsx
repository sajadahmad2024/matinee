"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { addMinutes, isPast, startOfToday } from "date-fns";
import { Controller, useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  useAdCampaignAction,
  useAdRankBoards,
  useCreateAdCampaign,
  useUpdateAdCampaign,
} from "@/app/_libs/hooks/api/use-admin-ads";
import type { MacroRegion } from "@/app/_libs/regions";
import {
  AD_LIMITS,
  type AdFormValues,
  type AdStartMode,
  adFormSchema,
} from "@/app/_libs/schemas/ads";
import { CharCountTextarea } from "@/components/custom/char-count-textarea";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomDateTimePicker } from "@/components/custom/custom-date-time-picker";
import { CustomField } from "@/components/custom/custom-field";
import { CustomInput } from "@/components/custom/custom-input";
import { GlassCard } from "@/components/custom/glass-card";
import { PageHeader } from "@/components/custom/page-header";
import { RegionMultiSelect, selectedRegions } from "@/components/custom/region-multi-select";
import { StatusBadge } from "@/components/custom/status-badge";
import { useReturnTo } from "@/hooks/use-return-to";

import { AD_CAPTION_MAX, AD_ROUTES, AD_STATUS_LABELS } from "../../_libs/ad-config";
import {
  effectiveStart,
  toAdFormValues,
  toCreateAdCampaignDto,
  toUpdateAdCampaignDto,
} from "../../_libs/ad-form-mapper";
import { type AdCampaignDto, AdCampaignStatusEnum } from "../../_libs/ad-types";
import { AdCtaField } from "./ad-cta-field";
import { AdRankFields, freeRankIn, rankHolder } from "./ad-rank-fields";
import { AdVideoUpload } from "./ad-video-upload";

/** One-page create/edit form: Ad · Delivery · Schedule. Edit takes the campaign being changed. */
export function AdForm({ campaign }: { campaign?: AdCampaignDto }) {
  const router = useRouter();
  const isEdit = !!campaign;
  // back to whichever ads page opened the form (list or details); `?from=` stays inside /ads
  const returnTo = useReturnTo(AD_ROUTES.LIST);
  const back = returnTo ?? (campaign?.id ? AD_ROUTES.details(campaign.id) : AD_ROUTES.LIST);
  // a live ad's start date and an existing ad's advertiser can't change (backend rules)
  const startLocked = campaign?.status === AdCampaignStatusEnum.Active;
  // publish now / schedule: new ads, and existing ones that haven't gone live yet
  const canChooseStart =
    !campaign ||
    campaign?.status === AdCampaignStatusEnum.Draft ||
    campaign?.status === AdCampaignStatusEnum.Scheduled;

  const { createAdCampaignMutation } = useCreateAdCampaign();
  const { updateAdCampaignMutation } = useUpdateAdCampaign();
  const { adCampaignActionMutation } = useAdCampaignAction();
  const [uploading, setUploading] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<AdFormValues>({
    resolver: zodResolver(adFormSchema),
    defaultValues: toAdFormValues(campaign),
  });

  const [regionValue, ranks, startMode, startsAt, endsAt, creativeMediaId, durationSeconds] =
    useWatch({
      control,
      name: [
        "regions",
        "ranks",
        "startMode",
        "startsAt",
        "endsAt",
        "creativeMediaId",
        "durationSeconds",
      ],
    });
  const startsNow = canChooseStart && startMode === "now";
  const regions = useMemo(() => selectedRegions(regionValue), [regionValue]);

  // the rank board covers the ad's flight; nothing to show until the dates make a window
  const flight = useMemo(() => {
    const start = effectiveStart({ startMode, startsAt });
    if (!start || !endsAt || endsAt <= start) return null;
    return { from: start.toISOString(), to: endsAt.toISOString() };
  }, [startMode, startsAt, endsAt]);
  const { rankBoards } = useAdRankBoards(regions, flight);

  // a newly targeted region starts on the next rank that is free for the chosen dates
  useEffect(() => {
    const current = getValues("ranks") ?? {};
    for (const code of regions ?? []) {
      const free = freeRankIn(rankBoards?.[code], campaign?.id);
      if (current?.[code] === undefined && free) setValue(`ranks.${code}`, String(free));
    }
  }, [campaign?.id, getValues, rankBoards, regions, setValue]);

  const onSubmit = (values: AdFormValues) => {
    // a scheduled start has to be ahead (an untouched start on edit is left alone)
    const scheduledStart =
      canChooseStart && values.startMode === "schedule" ? values.startsAt : null;
    if (scheduledStart && isPast(scheduledStart) && (!isEdit || dirtyFields?.startsAt)) {
      setError("startsAt", { message: "Pick a time in the future, or choose Publish now" });
      toast.error("Fix the highlighted fields");
      return;
    }

    // the backend answers 409 too; catching it here keeps the message next to the field
    const clash = regions?.find((code) =>
      rankHolder(rankBoards?.[code], values?.ranks?.[code] ?? "", campaign?.id),
    );
    if (clash) {
      setError(`ranks.${clash}`, { message: "This rank is taken for these dates" });
      toast.error("Fix the rank for each region");
      return;
    }

    const onError = (error: Error) => toast.error(error.message);

    if (campaign) {
      const publish = canChooseStart && values.startMode === "now";
      updateAdCampaignMutation.mutate(
        { id: campaign?.id, dto: toUpdateAdCampaignDto(values, campaign) },
        {
          onSuccess: () => {
            if (!publish) {
              toast.success("Ad updated");
              router.push(back);
              return;
            }
            // PATCH keeps the status; activate takes the ad live now that its start has passed
            adCampaignActionMutation.mutate(
              { id: campaign?.id, action: "activate" },
              {
                onSuccess: () => {
                  toast.success("Ad is live");
                  router.push(back);
                },
                onError,
              },
            );
          },
          onError,
        },
      );
      return;
    }

    createAdCampaignMutation.mutate(toCreateAdCampaignDto(values), {
      onSuccess: (created) => {
        toast.success(
          created?.status === AdCampaignStatusEnum.Active ? "Ad is live" : "Ad scheduled",
        );
        router.push(AD_ROUTES.LIST);
      },
      onError,
    });
  };

  const rankErrors = Object.fromEntries(
    Object.entries(errors?.ranks ?? {}).map(([code, err]) => [
      code,
      (err as { message?: string })?.message,
    ]),
  ) as Partial<Record<MacroRegion, string>>;
  const isSaving =
    createAdCampaignMutation.isPending ||
    updateAdCampaignMutation.isPending ||
    adCampaignActionMutation.isPending;
  // edit: nothing to save until a field differs from the loaded ad (the rank prefill doesn't count)
  const noChanges = isEdit && !isDirty;

  return (
    <form
      onSubmit={handleSubmit(onSubmit, () => toast.error("Fix the highlighted fields"))}
      noValidate>
      <div className="mx-auto max-w-6xl space-y-6">
        <PageHeader
          title={isEdit ? "Edit Ad" : "New Ad"}
          backHref={back}
          titleAddon={
            campaign && (
              <StatusBadge
                status={campaign?.status}
                label={AD_STATUS_LABELS[campaign?.status]}
                className="text-[10px]"
              />
            )
          }
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Video</CardTitle>
            </CardHeader>
            {/* the card stretches to the Ad card's height; the empty drop zone fills it */}
            <CardContent className="flex flex-1 flex-col">
              {/* the card title is the label — no "Video File" heading under "Video" */}
              <div className="flex flex-1 flex-col gap-2">
                <AdVideoUpload
                  value={{ creativeMediaId, durationSeconds }}
                  onChange={(creative) => {
                    setValue("creativeMediaId", creative.creativeMediaId, {
                      shouldValidate: !!creative.creativeMediaId,
                      shouldDirty: true,
                    });
                    setValue("durationSeconds", creative.durationSeconds, { shouldDirty: true });
                  }}
                  onUploadingChange={setUploading}
                  invalid={!!errors?.creativeMediaId}
                />
                {errors?.creativeMediaId?.message && (
                  <p role="alert" className="text-destructive text-sm">
                    {errors.creativeMediaId.message}
                  </p>
                )}
              </div>
              <CustomInput
                containerClassName="mt-4"
                label="Skippable after (seconds)"
                type="number"
                min={0}
                max={AD_LIMITS.skipMaxSeconds}
                placeholder="0"
                helperText="0 or empty = skip anytime"
                error={errors?.skippableAfterSeconds?.message}
                // empty → 0 (skip anytime); otherwise the number, validated by the schema
                {...register("skippableAfterSeconds", {
                  setValueAs: (v: string) => (v === "" ? 0 : Number(v)),
                })}
              />
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Ad</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <CustomInput
                  label="Name"
                  placeholder="e.g. Air Max Day"
                  maxLength={AD_LIMITS.nameMax}
                  error={errors?.name?.message}
                  {...register("name")}
                />
                <CustomInput
                  label="Advertiser"
                  placeholder="e.g. Nike"
                  maxLength={AD_LIMITS.advertiserMax}
                  disabled={isEdit}
                  helperText={isEdit ? "An ad keeps its advertiser" : undefined}
                  error={errors?.advertiserName?.message}
                  {...register("advertiserName")}
                />
              </div>
              <CustomField label="Caption" htmlFor="ad-caption" error={errors?.caption?.message}>
                <Controller
                  control={control}
                  name="caption"
                  render={({ field }) => (
                    <CharCountTextarea
                      id="ad-caption"
                      placeholder="Shown under the ad in the feed"
                      rows={3}
                      maxLength={AD_CAPTION_MAX}
                      {...field}
                    />
                  )}
                />
              </CustomField>
              <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
                <Controller
                  control={control}
                  name="ctaLabel"
                  render={({ field }) => (
                    <AdCtaField
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                      error={errors?.ctaLabel?.message}
                    />
                  )}
                />
                <CustomInput
                  label="Button link"
                  placeholder="https://brand.com/offer"
                  type="url"
                  maxLength={AD_LIMITS.clickUrlMax}
                  error={errors?.clickUrl?.message}
                  {...register("clickUrl")}
                />
              </div>
            </CardContent>
          </GlassCard>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-2">
          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <CustomField label="Regions" error={errors?.regions?.message}>
                <Controller
                  control={control}
                  name="regions"
                  render={({ field }) => (
                    <RegionMultiSelect value={field.value} onChange={field.onChange} />
                  )}
                />
              </CustomField>
              {regions?.length > 0 && (
                <CustomField label="Feed rank">
                  <AdRankFields
                    regions={regions}
                    ranks={ranks}
                    onRankChange={(code, value) =>
                      setValue(`ranks.${code}`, value, {
                        shouldValidate: !!errors?.ranks,
                        shouldDirty: true,
                      })
                    }
                    errors={rankErrors}
                    rankBoards={rankBoards}
                    selfId={campaign?.id}
                    savedRanks={campaign?.ranks}
                  />
                </CustomField>
              )}
            </CardContent>
          </GlassCard>

          <GlassCard>
            <CardHeader>
              <CardTitle className="text-base">Schedule</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canChooseStart && (
                <Controller
                  control={control}
                  name="startMode"
                  render={({ field }) => (
                    <RadioGroup
                      value={field.value}
                      onValueChange={(mode) => field.onChange(mode as AdStartMode)}
                      className="flex gap-6">
                      {START_MODE_OPTIONS.map((option) => (
                        <div key={option.value} className="flex items-center gap-2">
                          <RadioGroupItem value={option.value} id={`ad-start-${option.value}`} />
                          <Label
                            htmlFor={`ad-start-${option.value}`}
                            className="cursor-pointer font-normal">
                            {option.label}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                />
              )}
              <div className="grid gap-4 sm:grid-cols-2">
                {startsNow ? (
                  <CustomField label="Start" htmlFor="ad-starts-at">
                    <p id="ad-starts-at" className="text-muted-foreground py-2 text-sm">
                      Goes live as soon as you save
                    </p>
                  </CustomField>
                ) : (
                  <Controller
                    control={control}
                    name="startsAt"
                    render={({ field }) => (
                      <CustomField
                        label="Start"
                        htmlFor="ad-starts-at"
                        error={errors?.startsAt?.message}
                        helperText={startLocked ? "The ad has started" : undefined}>
                        <CustomDateTimePicker
                          id="ad-starts-at"
                          value={field.value ?? undefined}
                          onChange={(date) => field.onChange(date ?? null)}
                          isDateDisabled={(day) => day < startOfToday()}
                          getMinDate={canChooseStart ? earliestScheduledStart : undefined}
                          disabled={startLocked}
                        />
                      </CustomField>
                    )}
                  />
                )}
                <Controller
                  control={control}
                  name="endsAt"
                  render={({ field }) => (
                    <CustomField label="End" htmlFor="ad-ends-at" error={errors?.endsAt?.message}>
                      <CustomDateTimePicker
                        id="ad-ends-at"
                        value={field.value ?? undefined}
                        onChange={(date) => field.onChange(date ?? null)}
                        isDateDisabled={(day) => day < startOfToday()}
                      />
                    </CustomField>
                  )}
                />
              </div>
            </CardContent>
          </GlassCard>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => router.push(back)}>
            Cancel
          </Button>
          <CustomButton type="submit" isLoading={isSaving} disabled={uploading || noChanges}>
            {submitLabel(isEdit, startsNow)}
          </CustomButton>
        </div>
      </div>
    </form>
  );
}

/** A scheduled start is at least `scheduleLeadMinutes` ahead (sooner = Publish now). */
const earliestScheduledStart = () => addMinutes(new Date(), AD_LIMITS.scheduleLeadMinutes);

const START_MODE_OPTIONS: { value: AdStartMode; label: string }[] = [
  { value: "now", label: "Publish now" },
  { value: "schedule", label: "Schedule" },
];

const submitLabel = (isEdit: boolean, startsNow: boolean) => {
  if (isEdit) return startsNow ? "Save & publish" : "Save changes";
  return startsNow ? "Publish" : "Schedule";
};
