"use client";

import { useRef, useState } from "react";

import type { UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import {
  useCreateContent,
  useRemoveContentLicense,
  useRemoveContentSponsorship,
  useSetContentLicense,
  useSetContentRegions,
  useSetContentSponsorship,
  useUpdateContent,
} from "@/app/_libs/hooks/api/use-admin-content";
import {
  type ContentCreateFormValues,
  type ContentLicenseValues,
  type ContentPublishRegion,
  type ContentSponsorshipValues,
  LicenseKind,
  SponsorshipFormat,
} from "@/app/_libs/schemas";

import {
  RECORD_FIELDS,
  toCreateContentDto,
  toLicenseDto,
  toRegionsDto,
  toSponsorshipDto,
  toUpdateContentDto,
} from "../mappers/to-api";
import { VideoFormStep } from "../steps";

const sameValue = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

interface UseVideoFormSaveOptions {
  form: UseFormReturn<ContentCreateFormValues>;
  /**
   * Edit: the loaded video — its id, and its values as the last-saved baseline, so only what
   * the user changes is sent. Add: omitted; the first save creates the draft.
   */
  existing?: { id: string; values: ContentCreateFormValues };
}

/**
 * The wizard's save calls, shared by add and edit. Each part compares against what was last
 * saved, so an unchanged part makes no call:
 *  - `persist`: the content record — create the first time, then PATCH only the changed fields.
 *  - licence, regions, sponsorship: their own APIs, PUT (or DELETE when switched back off).
 */
export function useVideoFormSave({ form, existing }: UseVideoFormSaveOptions) {
  const { getValues } = form;

  const { createContentMutation } = useCreateContent();
  const { updateContentMutation } = useUpdateContent();
  const { setContentLicenseMutation } = useSetContentLicense();
  const { removeContentLicenseMutation } = useRemoveContentLicense();
  const { setContentRegionsMutation } = useSetContentRegions();
  const { setContentSponsorshipMutation } = useSetContentSponsorship();
  const { removeContentSponsorshipMutation } = useRemoveContentSponsorship();

  // Add: set by the first save; every later call targets this draft.
  const [contentId, setContentId] = useState<string | null>(existing?.id ?? null);
  // Values as last saved — a PATCH sends only the fields that differ from them.
  const savedValues = useRef<ContentCreateFormValues | null>(existing?.values ?? null);
  // Licence as last saved (null = never saved) — skips unchanged PUTs, and tells whether a
  // switch back to Original has a licence to DELETE.
  const savedLicense = useRef<ContentLicenseValues | null>(existing?.values.license ?? null);
  // Publish regions as last saved. A new draft has none, so leaving them empty makes no call.
  const savedRegions = useRef<ContentPublishRegion[]>(existing?.values.publishRegions ?? []);
  // Sponsorship as last saved (null = never saved) — like the licence.
  const savedSponsorship = useRef<ContentSponsorshipValues | null>(
    existing?.values.sponsorship ?? null,
  );

  const changedFields = (values: ContentCreateFormValues) =>
    RECORD_FIELDS.filter((field) => !sameValue(values[field], savedValues.current?.[field]));

  const saveFailed = (onFailed?: () => void) => (error: Error) => {
    toast.error(error?.message || "Unable to save the video. Please try again.");
    onFailed?.();
  };

  /**
   * Saves the content record: create the draft the first time, then PATCH only the changed
   * fields; nothing changed → no call. `onSaved` gets the draft's id.
   */
  const persist = (onSaved: (id: string) => void, onFailed?: () => void) => {
    const values = structuredClone(getValues());
    const saved = (id: string) => {
      savedValues.current = values;
      onSaved(id);
    };
    const failed = saveFailed(onFailed);

    if (!contentId) {
      createContentMutation.mutate(toCreateContentDto(values), {
        onSuccess: (created) => {
          const id = created?.data?.id;
          if (!id) return failed(new Error("The video was saved without an id."));
          setContentId(id);
          saved(id);
        },
        onError: failed,
      });
      return;
    }

    const changed = changedFields(values);
    if (!changed.length) return onSaved(contentId);
    updateContentMutation.mutate(
      { id: contentId, updateContentDto: toUpdateContentDto(values, changed) },
      { onSuccess: () => saved(contentId), onError: failed },
    );
  };

  /**
   * Saves the Rights step: Licensed → `PUT /:id/license`; back to Original after a saved licence →
   * `DELETE`; unchanged, or Original that was never licensed → no call.
   */
  const saveLicense = (id: string, onSaved: () => void, onFailed?: () => void) => {
    const license = structuredClone(getValues("license"));
    if (sameValue(license, savedLicense.current)) return onSaved();
    const saved = () => {
      savedLicense.current = license;
      onSaved();
    };
    const callbacks = { onSuccess: saved, onError: saveFailed(onFailed) };

    if (license.kind === LicenseKind.Licensed) {
      setContentLicenseMutation.mutate({ id, licenseDto: toLicenseDto(license) }, callbacks);
    } else if (savedLicense.current?.kind === LicenseKind.Licensed) {
      removeContentLicenseMutation.mutate(id, callbacks);
    } else {
      saved();
    }
  };

  /** Saves the Distribution regions with `PUT /:id/regions`; unchanged → no call. */
  const saveRegions = (id: string, onSaved: () => void, onFailed?: () => void) => {
    const regions = structuredClone(getValues("publishRegions"));
    if (sameValue(regions, savedRegions.current)) return onSaved();
    setContentRegionsMutation.mutate(
      { id, setRegionsDto: toRegionsDto(regions) },
      {
        onSuccess: () => {
          savedRegions.current = regions;
          onSaved();
        },
        onError: saveFailed(onFailed),
      },
    );
  };

  /**
   * Saves Ad Sales: Sponsored → `PUT /:id/sponsorship`; back to Organic after a saved sponsorship →
   * `DELETE`; unchanged, or Organic that was never sponsored → no call.
   */
  const saveSponsorship = (id: string, onSaved: () => void, onFailed?: () => void) => {
    const sponsorship = structuredClone(getValues("sponsorship"));
    if (sameValue(sponsorship, savedSponsorship.current)) return onSaved();
    const saved = () => {
      savedSponsorship.current = sponsorship;
      onSaved();
    };
    const callbacks = { onSuccess: saved, onError: saveFailed(onFailed) };

    if (sponsorship.format === SponsorshipFormat.Sponsored) {
      setContentSponsorshipMutation.mutate(
        { id, sponsorshipDto: toSponsorshipDto(sponsorship) },
        callbacks,
      );
    } else if (savedSponsorship.current?.format === SponsorshipFormat.Sponsored) {
      removeContentSponsorshipMutation.mutate(id, callbacks);
    } else {
      saved();
    }
  };

  /**
   * Everything, in order: record → licence → regions → sponsorship. Used by the footer actions,
   * where every step is valid. Ad Sales is the last step (no Next), so it's saved only here.
   * `onSaved` gets the content id.
   */
  const saveAll = (onSaved: (id: string) => void, onFailed?: () => void) =>
    persist((id) => {
      const sponsorship = () => saveSponsorship(id, () => onSaved(id), onFailed);
      const regions = () => saveRegions(id, sponsorship, onFailed);
      saveLicense(id, regions, onFailed);
    }, onFailed);

  // A step's own API call, after the record is saved. Ad Sales has no Next — `saveAll` covers it.
  const STEP_SAVES: Partial<
    Record<VideoFormStep, (id: string, onSaved: () => void, onFailed?: () => void) => void>
  > = {
    [VideoFormStep.Rights]: saveLicense,
    [VideoFormStep.Distribution]: saveRegions,
  };

  /** Leaving a step: the record (Media's uploads included), then the step's own API. */
  const saveStep = (step: VideoFormStep, proceed: () => void) =>
    persist((id) => {
      const saveOwn = STEP_SAVES[step];
      if (saveOwn) saveOwn(id, proceed);
      else proceed();
    });

  const isPersisting =
    createContentMutation.isPending ||
    updateContentMutation.isPending ||
    setContentLicenseMutation.isPending ||
    removeContentLicenseMutation.isPending ||
    setContentRegionsMutation.isPending ||
    setContentSponsorshipMutation.isPending ||
    removeContentSponsorshipMutation.isPending;

  return { contentId, saveStep, saveAll, isPersisting };
}

export type VideoFormSave = ReturnType<typeof useVideoFormSave>;
