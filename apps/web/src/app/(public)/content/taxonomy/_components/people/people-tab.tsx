"use client";

import { useState } from "react";

import {
  type PersonKnownForEnum,
  type PersonResponseDto,
  useCreatePerson,
  useDeletePerson,
  usePeople,
  useUpdatePerson,
} from "@/app/_libs/hooks/api/use-content-taxonomy";
import {
  MediaTypeEnum,
  MediaUsageEnum,
  useMediaUpload,
} from "@/app/_libs/hooks/api/use-media-upload";
import { CustomSelect } from "@/components/custom/custom-select";

import { TAXONOMY_TABS_CONFIG, TaxonomyTab } from "../../_shared/taxonomy-config";
import {
  type TaxonomyFormValues,
  type TaxonomyMutationCallbacks,
  imageMediaIdChange,
} from "../../_shared/taxonomy-types";
import { useTaxonomyListState } from "../../_shared/use-taxonomy-list-state";
import { TaxonomyManager } from "../manager/taxonomy-manager";
import {
  ALL_ROLES,
  PERSON_ROLE_FILTER_OPTIONS,
  PERSON_ROLE_OPTIONS,
  type PersonRoleFilter,
} from "./people-config";

/**
 * Cast & crew — infinite scroll, searchable by name or role, filterable by `knownFor`. `meta` is the
 * person's role; a picked photo is uploaded, then saved as `photoMediaId`. Only a person no video
 * credits can be deleted.
 */
export function PeopleTab() {
  const listState = useTaxonomyListState();
  const [role, setRole] = useState<PersonRoleFilter>(ALL_ROLES);
  const { peopleQuery, people, summary } = usePeople({
    ...listState.pagedParams,
    knownFor: role === ALL_ROLES ? undefined : role,
  });
  const { createPersonMutation } = useCreatePerson();
  const { updatePersonMutation } = useUpdatePerson();
  const { deletePersonMutation } = useDeletePerson();
  const { mediaUploadMutation } = useMediaUpload();

  // Create omits an empty role; update sends `null` to clear it (omitted = unchanged).
  // A newly picked photo is uploaded first; a removed one is sent as `photoMediaId: null`.
  const onSave = (
    values: TaxonomyFormValues,
    editing: PersonResponseDto | null,
    callbacks: TaxonomyMutationCallbacks,
  ) => {
    const { name, meta, imageFile } = values;
    const knownFor = (meta || null) as PersonKnownForEnum | null;
    const savePerson = (uploadedId?: string) => {
      const photoMediaId = imageMediaIdChange(values, !!editing?.photoUrl, uploadedId);
      if (editing) {
        return updatePersonMutation.mutate(
          {
            id: editing?.id,
            updatePersonDto: {
              name,
              knownFor,
              ...(photoMediaId !== undefined && { photoMediaId }),
            },
          },
          callbacks,
        );
      }
      createPersonMutation.mutate(
        { name, knownFor: knownFor ?? undefined, photoMediaId: photoMediaId ?? undefined },
        callbacks,
      );
    };

    if (!imageFile) return savePerson();
    mediaUploadMutation.mutate(
      { file: imageFile, mediaType: MediaTypeEnum.Image, usageType: MediaUsageEnum.PersonPhoto },
      { onSuccess: (media) => savePerson(media?.id), onError: callbacks.onError },
    );
  };

  const onDelete = (person: PersonResponseDto, callbacks: TaxonomyMutationCallbacks) =>
    deletePersonMutation.mutate(person?.id, callbacks);

  return (
    <TaxonomyManager
      {...TAXONOMY_TABS_CONFIG[TaxonomyTab.People]}
      items={people}
      listState={listState}
      summary={summary}
      infiniteScroll={{
        hasNextPage: peopleQuery?.hasNextPage,
        isFetchingNextPage: peopleQuery?.isFetchingNextPage,
        fetchNextPage: () => peopleQuery?.fetchNextPage(),
      }}
      filters={
        <CustomSelect
          options={PERSON_ROLE_FILTER_OPTIONS}
          value={role}
          onValueChange={setRole}
          triggerClassName="w-fit shrink-0"
          aria-label="Filter by role"
        />
      }
      isFiltered={role !== ALL_ROLES}
      getMeta={(person) => person?.knownFor}
      getImageUrl={(person) => person?.photoUrl}
      metaOptions={PERSON_ROLE_OPTIONS}
      onSave={onSave}
      onDelete={onDelete}
      isLoading={peopleQuery?.isPending}
      isError={peopleQuery?.isError}
      onRetry={() => peopleQuery?.refetch()}
      isRetrying={peopleQuery?.isFetching}
    />
  );
}
