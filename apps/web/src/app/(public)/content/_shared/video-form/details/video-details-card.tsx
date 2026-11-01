"use client";

import { useState } from "react";

import { MonitorPlay, Plus, Star, X } from "lucide-react";
import { Controller, useFieldArray, useFormContext, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { WatchLinkInputDtoPlatformEnum } from "@/app/_libs/api/generated";
import { useContentFull } from "@/app/_libs/hooks/api/use-admin-content";
import {
  useGenres,
  usePeople,
  useStudios,
  useTags,
} from "@/app/_libs/hooks/api/use-content-taxonomy";
import { CONTENT_LIMITS, type ContentCreateFormValues } from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomCombobox } from "@/components/custom/custom-combobox";
import { CustomField } from "@/components/custom/custom-field";
import { CustomSelect } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";
import { useDebounce } from "@/hooks/use-debounce";

import { useVideoFormContext } from "../../../_libs/video-form/context";
import {
  CAST_ROLE_LABELS,
  DEFAULT_CAST_ROLE,
  DEFAULT_WATCH_PLATFORM,
  PAGED_PICKER_PARAMS,
  PICKER_SEARCH_DEBOUNCE_MS,
  WATCH_PLATFORM_OPTIONS,
} from "../../../_libs/video-form/details/details-options";

/**
 * Wizard step 1 — reads and writes the shared add/edit form (`useFormContext`). Studio, genres,
 * tags and cast are picked from the Content Library.
 */
export function VideoDetailsCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground">Video Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <CustomField label="Video Title" htmlFor="title" error={errors?.title?.message}>
            <Input
              id="title"
              placeholder="Enter video title"
              maxLength={CONTENT_LIMITS.titleMax}
              {...register("title")}
            />
          </CustomField>
          <StudioField />
        </div>

        <CustomField label="Description" htmlFor="description" error={errors?.description?.message}>
          <Textarea
            id="description"
            placeholder="Describe your video..."
            rows={4}
            maxLength={CONTENT_LIMITS.descriptionMax}
            // Grows with the text up to ~8 lines, then scrolls.
            className="max-h-48 resize-none overflow-y-auto"
            {...register("description")}
          />
        </CustomField>

        <div className="grid items-start gap-4 md:grid-cols-3">
          <GenresField />
          <TagsField />
          <CastField />
        </div>

        <WhereToWatchField />
      </CardContent>
    </GlassCard>
  );
}

/** Studios are added in the Content Library; the form only picks one. */
function StudioField() {
  const { control } = useFormContext<ContentCreateFormValues>();
  const { studiosQuery, studios } = useStudios();

  const options = studios?.map((s) => ({ value: s?.id, label: s?.name, hint: s?.countryCode }));

  return (
    <CustomField label="Studio" htmlFor="studio">
      <Controller
        control={control}
        name="studioId"
        render={({ field }) => {
          const studio = studios?.find((s) => s?.id === field?.value);
          return (
            <CustomCombobox
              id="studio"
              options={options}
              selected={field.value ? [field.value] : []}
              placeholder={
                studio ? (
                  <span className="text-foreground">{studio?.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select a studio</span>
                )
              }
              searchPlaceholder="Search studios…"
              emptyText="No studios in the library"
              closeOnSelect
              onSelect={(id) => field.onChange(id === field.value ? "" : id)}
              isLoading={studiosQuery?.isLoading}
              isError={studiosQuery?.isError}
              onRetry={() => studiosQuery?.refetch()}
              onClear={field.value ? () => field.onChange("") : undefined}
            />
          );
        }}
      />
    </CustomField>
  );
}

/** Active genres only; the first chip is the primary genre. */
function GenresField() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const genreIds = useWatch({ control, name: "genreIds" });
  const { genresQuery, genres } = useGenres();

  const options = genres
    ?.filter((g) => g?.isActive)
    ?.map((g) => ({
      value: g?.id,
      label: g?.name,
      disabled: !genreIds.includes(g?.id) && genreIds?.length >= CONTENT_LIMITS.genresMax,
    }));
  const nameOf = (id: string) => genres?.find((g) => g?.id === id)?.name ?? "…";

  const update = (next: string[]) =>
    setValue("genreIds", next, { shouldDirty: true, shouldValidate: true });
  const toggle = (id: string) =>
    update(genreIds.includes(id) ? genreIds.filter((g) => g !== id) : [...genreIds, id]);
  const makePrimary = (id: string) => update([id, ...genreIds.filter((g) => g !== id)]);

  return (
    <CustomField
      label="Genres"
      htmlFor="genres"
      error={errors?.genreIds?.message}
      helperText={genreIds?.length > 1 ? "The first genre is the primary one." : undefined}>
      <CustomCombobox
        id="genres"
        options={options}
        selected={genreIds}
        onSelect={toggle}
        placeholder={
          <span className="text-muted-foreground">
            {genreIds?.length ? `${genreIds?.length} selected` : "Select genres"}
          </span>
        }
        searchPlaceholder="Search genres…"
        emptyText="No active genres"
        isLoading={genresQuery?.isLoading}
        isError={genresQuery?.isError}
        onRetry={() => genresQuery?.refetch()}
      />
      {genreIds?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {genreIds?.map((id, index) => (
            <RemovableChip key={id} label={nameOf(id)} onRemove={() => toggle(id)}>
              {index === 0 ? (
                <Star className="fill-primary text-primary h-3 w-3" aria-label="Primary genre" />
              ) : (
                <button
                  type="button"
                  onClick={() => makePrimary(id)}
                  aria-label={`Make ${nameOf(id)} the primary genre`}
                  className="hover:text-primary cursor-pointer">
                  <Star className="h-3 w-3" />
                </button>
              )}
            </RemovableChip>
          ))}
        </div>
      )}
    </CustomField>
  );
}

/**
 * A picker searched through the API: the typed query (debounced) for the list request, and chip
 * names for selected entries — which may not be in the current results — remembered when picked,
 * else read from the saved video.
 */
function usePagedPicker(saved?: { id: string; name: string }[]) {
  const [search, setSearch] = useState("");
  const q = useDebounce(search, PICKER_SEARCH_DEBOUNCE_MS);
  const [picked, setPicked] = useState<Record<string, string>>({});

  const remember = (id: string, name?: string) =>
    name && setPicked((prev) => ({ ...prev, [id]: name }));
  const nameOf = (id: string, results: { id: string; name: string }[]) =>
    picked?.[id] ??
    results?.find((row) => row?.id === id)?.name ??
    saved?.find((row) => row?.id === id)?.name ??
    "…";

  return { q, setSearch, remember, nameOf };
}

/** Tags are added in the Content Library; the form only picks them (searched through the API). */
function TagsField() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const tagIds = useWatch({ control, name: "tagIds" });
  const { contentId } = useVideoFormContext();
  const { contentFull } = useContentFull(contentId ?? "");
  const picker = usePagedPicker(contentFull?.content?.tags);
  const { tagsQuery, tags } = useTags({ ...PAGED_PICKER_PARAMS, q: picker.q || undefined });

  const options = tags?.map((t) => ({
    value: t?.id,
    label: t?.name,
    disabled: !tagIds?.includes(t?.id) && tagIds?.length >= CONTENT_LIMITS.tagsMax,
  }));
  const nameOf = (id: string) => picker.nameOf(id, tags);

  const toggle = (id: string) => {
    picker.remember(id, tags?.find((t) => t?.id === id)?.name);
    setValue("tagIds", tagIds.includes(id) ? tagIds.filter((t) => t !== id) : [...tagIds, id], {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  return (
    <CustomField label="Tags" htmlFor="tags" error={errors?.tagIds?.message}>
      <CustomCombobox
        id="tags"
        options={options}
        selected={tagIds}
        onSelect={toggle}
        placeholder={
          <span className="text-muted-foreground">
            {tagIds?.length ? `${tagIds?.length} selected` : "Select tags"}
          </span>
        }
        searchPlaceholder="Search tags…"
        emptyText={picker.q ? "No matching tags" : "No tags in the library"}
        onSearchChange={picker.setSearch}
        isLoading={tagsQuery?.isLoading}
        isError={tagsQuery?.isError}
        onRetry={() => tagsQuery?.refetch()}
      />
      {tagIds?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tagIds?.map((id) => (
            <RemovableChip key={id} label={nameOf(id)} onRemove={() => toggle(id)} />
          ))}
        </div>
      )}
    </CustomField>
  );
}

/**
 * People come from the Library, like tags (searched through the API). Each pick stores the person's
 * Library role (`knownFor`) — the API defaults a missing role to actor. Chip order is the billing
 * order.
 */
function CastField() {
  const {
    control,
    setValue,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const cast = useWatch({ control, name: "cast" });
  const { contentId } = useVideoFormContext();
  const { contentFull } = useContentFull(contentId ?? "");
  const picker = usePagedPicker(
    contentFull?.content?.cast?.map((member) => ({ id: member?.personId, name: member?.name })),
  );
  const { peopleQuery, people } = usePeople({ ...PAGED_PICKER_PARAMS, q: picker.q || undefined });

  const castIds = cast?.map((member) => member?.personId) ?? [];
  const isFull = castIds?.length >= CONTENT_LIMITS.castMax;
  const options = people?.map((p) => ({
    value: p?.id,
    label: p?.name,
    hint: p?.knownFor ? CAST_ROLE_LABELS[p.knownFor] : undefined,
    disabled: isFull && !castIds?.includes(p?.id),
  }));
  const nameOf = (id: string) => picker.nameOf(id, people);

  const update = (next: ContentCreateFormValues["cast"]) =>
    setValue("cast", next, { shouldDirty: true, shouldValidate: true });
  const toggle = (personId: string) => {
    if (castIds?.includes(personId)) return update(cast?.filter((m) => m?.personId !== personId));
    const person = people?.find((p) => p?.id === personId);
    if (!person || isFull) return;
    picker.remember(person?.id, person?.name);
    update([...cast, { personId: person?.id, role: person?.knownFor ?? DEFAULT_CAST_ROLE }]);
  };

  return (
    <CustomField label="Cast & Crew" htmlFor="cast" error={errors?.cast?.message}>
      <CustomCombobox
        id="cast"
        options={options}
        selected={castIds}
        onSelect={toggle}
        placeholder={
          <span className="text-muted-foreground">
            {castIds?.length ? `${castIds?.length} selected` : "Select cast or crew"}
          </span>
        }
        searchPlaceholder="Search people…"
        emptyText={picker.q ? "No matching people" : "No people in the library"}
        onSearchChange={picker.setSearch}
        isLoading={peopleQuery?.isLoading}
        isError={peopleQuery?.isError}
        onRetry={() => peopleQuery?.refetch()}
      />
      {castIds?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {castIds?.map((id) => (
            <RemovableChip key={id} label={nameOf(id)} onRemove={() => toggle(id)} />
          ))}
        </div>
      )}
    </CustomField>
  );
}

function RemovableChip({
  label,
  onRemove,
  children,
}: {
  label: string;
  onRemove: () => void;
  children?: React.ReactNode;
}) {
  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {children}
      {label}
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${label}`}
        className="hover:text-destructive ml-1 cursor-pointer">
        <X className="h-3 w-3" />
      </button>
    </Badge>
  );
}

function WhereToWatchField() {
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<ContentCreateFormValues>();
  const { fields, append, remove } = useFieldArray({ control, name: "watchLinks" });
  const links = useWatch({ control, name: "watchLinks" });

  return (
    <div className="border-border/40 space-y-2 border-t pt-4">
      <Label className="flex items-center gap-2">
        <MonitorPlay className="text-muted-foreground h-4 w-4" />
        Where to watch
      </Label>
      <p className="text-muted-foreground text-xs">
        Shown as a call-to-action on the video in the app (&ldquo;Find it on Netflix&rdquo;). URL is
        optional — the platform name alone still renders. Up to {CONTENT_LIMITS.watchLinksMax}.
      </p>

      {fields?.length === 0 && (
        <p className="text-muted-foreground text-xs italic">No watch destinations configured.</p>
      )}

      {fields?.map((field, i) => {
        const rowErrors = errors?.watchLinks?.[i];
        return (
          <div key={field.id} className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <Controller
                control={control}
                name={`watchLinks.${i}.platform`}
                render={({ field: platform }) => (
                  <CustomSelect
                    options={WATCH_PLATFORM_OPTIONS}
                    value={platform?.value}
                    onValueChange={platform.onChange}
                    triggerClassName="w-[160px]"
                    aria-label="Watch platform"
                  />
                )}
              />

              {links?.[i]?.platform === WatchLinkInputDtoPlatformEnum.Other && (
                <Input
                  placeholder="Platform name"
                  maxLength={CONTENT_LIMITS.watchLabelMax}
                  className="w-40"
                  aria-invalid={!!rowErrors?.label}
                  {...register(`watchLinks.${i}.label`)}
                />
              )}

              <Input
                placeholder="https://… (optional)"
                maxLength={CONTENT_LIMITS.watchUrlMax}
                className="min-w-50 flex-1"
                aria-invalid={!!rowErrors?.url}
                {...register(`watchLinks.${i}.url`)}
              />

              <CustomButton
                type="button"
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive"
                aria-label="Remove destination"
                onClick={() => remove(i)}>
                <X className="h-4 w-4" />
              </CustomButton>
            </div>
            {(rowErrors?.label || rowErrors?.url) && (
              <p role="alert" className="text-destructive text-sm">
                {rowErrors?.label?.message ?? rowErrors?.url?.message}
              </p>
            )}
          </div>
        );
      })}

      {fields?.length < CONTENT_LIMITS.watchLinksMax && (
        <CustomButton
          type="button"
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => append({ platform: DEFAULT_WATCH_PLATFORM, label: "", url: "" })}>
          <Plus className="h-4 w-4" /> Add destination
        </CustomButton>
      )}
    </div>
  );
}
