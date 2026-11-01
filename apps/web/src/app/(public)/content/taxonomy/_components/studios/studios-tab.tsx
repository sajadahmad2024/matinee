"use client";

import { useCountries } from "@/app/_libs/hooks/api/use-admin-regions";
import {
  type StudioResponseDto,
  useCreateStudio,
  useDeleteStudio,
  useStudios,
  useUpdateStudio,
} from "@/app/_libs/hooks/api/use-content-taxonomy";
import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";

import { TAXONOMY_TABS_CONFIG, TaxonomyTab } from "../../_shared/taxonomy-config";
import {
  type TaxonomyFormValues,
  type TaxonomyMutationCallbacks,
  imageMediaIdChange,
} from "../../_shared/taxonomy-types";
import { useTaxonomyListState } from "../../_shared/use-taxonomy-list-state";
import { TaxonomyManager } from "../manager/taxonomy-manager";

/**
 * Studios — `meta` is the ISO-2 `countryCode` (picked from the countries API, shown by name); a
 * picked logo is uploaded, then saved as `logoMediaId`.
 */
export function StudiosTab() {
  const listState = useTaxonomyListState();
  const { studiosQuery, studios, summary } = useStudios(listState.params);
  const { countries } = useCountries();
  const { createStudioMutation } = useCreateStudio();
  const { updateStudioMutation } = useUpdateStudio();
  const { deleteStudioMutation } = useDeleteStudio();
  const { mediaUploadMutation } = useMediaUpload();

  const countryOptions = countries?.map(({ code, name }) => ({ value: code, label: name }));

  // Create omits an empty country; update sends `null` to clear it (omitted = unchanged).
  // A newly picked logo is uploaded first; a removed one is sent as `logoMediaId: null`.
  const onSave = (
    values: TaxonomyFormValues,
    editing: StudioResponseDto | null,
    callbacks: TaxonomyMutationCallbacks,
  ) => {
    const { name, meta, imageFile } = values;
    const saveStudio = (uploadedId?: string) => {
      const logoMediaId = imageMediaIdChange(values, !!editing?.logoUrl, uploadedId);
      if (editing) {
        return updateStudioMutation.mutate(
          {
            id: editing?.id,
            updateStudioDto: {
              name,
              countryCode: meta || null,
              ...(logoMediaId !== undefined && { logoMediaId }),
            },
          },
          callbacks,
        );
      }
      createStudioMutation.mutate(
        { name, countryCode: meta || undefined, logoMediaId: logoMediaId ?? undefined },
        callbacks,
      );
    };

    if (!imageFile) return saveStudio();
    mediaUploadMutation.mutate(
      { file: imageFile, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.StudioLogo },
      { onSuccess: (media) => saveStudio(media?.id), onError: callbacks.onError },
    );
  };

  const onDelete = (studio: StudioResponseDto, callbacks: TaxonomyMutationCallbacks) =>
    deleteStudioMutation.mutate(studio?.id, callbacks);

  return (
    <TaxonomyManager
      {...TAXONOMY_TABS_CONFIG[TaxonomyTab.Studios]}
      items={studios}
      listState={listState}
      summary={summary}
      getMeta={(studio) => studio?.countryCode}
      getImageUrl={(studio) => studio?.logoUrl}
      metaOptions={countryOptions}
      onSave={onSave}
      onDelete={onDelete}
      isLoading={studiosQuery?.isPending}
      isError={studiosQuery?.isError}
      onRetry={() => studiosQuery?.refetch()}
      isRetrying={studiosQuery?.isFetching}
    />
  );
}
