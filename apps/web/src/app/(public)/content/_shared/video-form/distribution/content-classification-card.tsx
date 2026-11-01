"use client";

import { Globe, Link2, Lock, Plus, X } from "lucide-react";
import { Controller, useFormContext, useWatch } from "react-hook-form";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import {
  CreateContentDtoContentTypeEnum as ContentTypeEnum,
  SetRegionsDtoRegionsEnum as PublishRegionEnum,
  CreateContentDtoRightsRegionEnum as RightsRegionEnum,
} from "@/app/_libs/api/generated";
import { useAdminContentList } from "@/app/_libs/hooks/api/use-admin-content";
import type { ContentCreateFormValues, ContentPublishRegion } from "@/app/_libs/schemas";
import { cn } from "@/app/_libs/utils/cn";
import { CustomCombobox } from "@/components/custom/custom-combobox";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

import { useVideoFormContext } from "../../../_libs/video-form/context";
import {
  ALL_PUBLISH_REGIONS,
  CONTENT_TYPES,
  LANGUAGE_OPTIONS,
  PARENT_OPTIONS_LIMIT,
  RECOMMENDATION_OPTIONS,
  RIGHTS_REGION_OPTIONS,
  canHaveParent,
  regionLabel,
} from "../../../_libs/video-form/distribution/distribution-options";

/** Content types with their icons — built here because the labels are JSX. */
const CONTENT_TYPE_OPTIONS: CustomSelectOption<ContentTypeEnum>[] = Object.values(
  ContentTypeEnum,
).map((value) => {
  const { label, icon: Icon } = CONTENT_TYPES[value];
  return {
    value,
    label: (
      <span className="flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </span>
    ),
  };
});

/**
 * Content classification: every type (trailer / BTS / clip) is first-class content.
 * Exclusivity is a content-level property (any type can be exclusive). A BTS/clip MAY
 * optionally belong to one primary title — no content requires a BTS.
 */
export function ContentClassificationCard() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const { contentId } = useVideoFormContext();
  const contentType = useWatch({ control, name: "contentType" });
  const exclusive = useWatch({ control, name: "exclusive" });
  const rightsRegion = useWatch({ control, name: "rightsRegion" });
  const showParent = canHaveParent(contentType);

  // Candidate parents: primary titles only (a BTS / clip can't parent another extra).
  const { contentListQuery: parentsQuery, contents: primaryTitles } = useAdminContentList(
    { hasParent: false, limit: PARENT_OPTIONS_LIMIT },
    { enabled: showParent },
  );
  const parentOptions = primaryTitles
    .filter((c) => c?.id !== contentId)
    .map((c) => ({ value: c?.id, label: c?.title }));

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Classification</CardTitle>
        <CardDescription>
          Type, access tier and (optionally) the title this content belongs to.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Content type */}
        <CustomField
          label="Content type"
          htmlFor="content-type"
          helperText={CONTENT_TYPES[contentType]?.hint}>
          <Controller
            control={control}
            name="contentType"
            render={({ field }) => (
              <CustomSelect
                id="content-type"
                options={CONTENT_TYPE_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
              />
            )}
          />
        </CustomField>

        {/* Metadata & distribution */}
        <div className="grid gap-4 md:grid-cols-3">
          <CustomField label="Language" htmlFor="content-language">
            <Controller
              control={control}
              name="language"
              render={({ field }) => (
                <CustomSelect
                  id="content-language"
                  options={LANGUAGE_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </CustomField>
          <CustomField label="Rights region" htmlFor="rights-region">
            <Controller
              control={control}
              name="rightsRegion"
              render={({ field }) => (
                <CustomSelect
                  id="rights-region"
                  options={RIGHTS_REGION_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </CustomField>
          <CustomField label="Recommendation" htmlFor="recommendation">
            <Controller
              control={control}
              name="recommendation"
              render={({ field }) => (
                <CustomSelect
                  id="recommendation"
                  options={RECOMMENDATION_OPTIONS}
                  value={field.value}
                  onValueChange={field.onChange}
                />
              )}
            />
          </CustomField>
        </div>

        {/* Publish to regions (availability — where users can see this) */}
        <Controller
          control={control}
          name="publishRegions"
          render={({ field }) => (
            <PublishRegionsField
              value={field.value}
              onChange={field.onChange}
              rightsRegion={rightsRegion}
            />
          )}
        />

        {/* Optional primary title (BTS / clip only) */}
        {showParent && (
          <CustomField
            labelClassName="flex items-center gap-1.5"
            htmlFor="parent-content"
            label={
              <>
                <Link2 className="h-3.5 w-3.5" /> Belongs to (primary title)
              </>
            }
            helperText={`Optional. Link this ${contentType === ContentTypeEnum.Bts ? "BTS" : "clip"} to a title, or leave it standalone.`}>
            <Controller
              control={control}
              name="parentContentId"
              render={({ field }) => (
                <CustomCombobox
                  id="parent-content"
                  options={parentOptions}
                  selected={field.value ? [field.value] : []}
                  onSelect={field.onChange}
                  onClear={field.value ? () => field.onChange("") : undefined}
                  placeholder={
                    primaryTitles.find((c) => c?.id === field.value)?.title ?? "None — standalone"
                  }
                  searchPlaceholder="Search titles…"
                  emptyText="No titles found"
                  isLoading={parentsQuery?.isPending}
                  isError={parentsQuery?.isError}
                  onRetry={() => parentsQuery?.refetch()}
                  closeOnSelect
                />
              )}
            />
          </CustomField>
        )}

        {/* Exclusivity (content-level; any type) */}
        <div className="border-border/50 space-y-3 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Exclusive content
              </Label>
              <p className="text-muted-foreground text-xs">
                Lock behind points — viewers spend points to unlock. Applies to any type.
              </p>
            </div>
            <Controller
              control={control}
              name="exclusive"
              render={({ field }) => (
                <Switch
                  className="cursor-pointer"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>
          {exclusive && (
            <CustomField
              label="Unlock cost (points)"
              htmlFor="unlock-points"
              error={errors?.unlockPoints?.message}>
              <Input
                id="unlock-points"
                type="number"
                min={0}
                {...register("unlockPoints", { valueAsNumber: true })}
              />
            </CustomField>
          )}
        </div>
      </CardContent>
    </GlassCard>
  );
}

interface PublishRegionsFieldProps {
  value: ContentPublishRegion[];
  onChange: (regions: ContentPublishRegion[]) => void;
  /** With no publish regions, the backend makes the video available by its rights region. */
  rightsRegion: RightsRegionEnum;
}

/**
 * Publish regions — distinct from the rights region. Live/Off is separate from selection: launch
 * in five, later pause two without unselecting them.
 */
function PublishRegionsField({ value: regions, onChange, rightsRegion }: PublishRegionsFieldProps) {
  const allSelected = regions.length === ALL_PUBLISH_REGIONS.length;
  const unselected = ALL_PUBLISH_REGIONS.filter((code) => !regions.some((r) => r.code === code));
  const liveCount = regions.filter((r) => r.live).length;

  const addRegion = (code: PublishRegionEnum) => onChange([...regions, { code, live: true }]);
  const removeRegion = (code: PublishRegionEnum) =>
    onChange(regions.filter((r) => r.code !== code));
  const setLive = (code: PublishRegionEnum, live: boolean) =>
    onChange(regions.map((r) => (r.code === code ? { ...r, live } : r)));
  const toggleAll = () =>
    onChange(allSelected ? [] : ALL_PUBLISH_REGIONS.map((code) => ({ code, live: true })));

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5">
          <Globe className="h-3.5 w-3.5" /> Publish to regions
        </Label>
        <button
          type="button"
          onClick={toggleAll}
          className="text-primary cursor-pointer text-xs hover:underline">
          {allSelected ? "Clear all" : "Select all"}
        </button>
      </div>

      <div className="space-y-1.5">
        {regions.map((region) => (
          <div
            key={region.code}
            className="border-border/50 bg-card/40 flex items-center justify-between gap-3 rounded-lg border px-3 py-2">
            <span className="text-foreground text-sm font-medium">{regionLabel(region.code)}</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 text-xs">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    region.live ? "bg-success" : "bg-destructive",
                  )}
                />
                <span className={region.live ? "text-success" : "text-destructive"}>
                  {region.live ? "Live" : "Off"}
                </span>
              </span>
              <Switch
                className="cursor-pointer"
                checked={region.live}
                onCheckedChange={(checked) => setLive(region.code, checked)}
                aria-label={`${regionLabel(region.code)} live`}
              />
              <button
                type="button"
                onClick={() => removeRegion(region.code)}
                aria-label={`Remove ${regionLabel(region.code)}`}
                className="text-muted-foreground hover:text-destructive cursor-pointer transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {unselected.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted-foreground text-xs">Add region:</span>
          {unselected.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => addRegion(code)}
              className="border-border text-muted-foreground hover:border-primary/40 hover:text-primary flex cursor-pointer items-center gap-1 rounded-full border px-3 py-1 text-xs transition-colors">
              <Plus className="h-3 w-3" />
              {regionLabel(code)}
            </button>
          ))}
        </div>
      )}

      <p className="text-muted-foreground text-xs">
        {regions.length === 0
          ? rightsRegion === RightsRegionEnum.Global
            ? "No regions picked — available everywhere, since the rights region is Global."
            : "No regions picked — not available anywhere until you add one (the rights region isn't Global)."
          : `Live in ${liveCount} of ${regions.length} selected region${regions.length > 1 ? "s" : ""}.`}{" "}
        Distinct from Rights region (above), which is the licensing focus.
      </p>
    </div>
  );
}
