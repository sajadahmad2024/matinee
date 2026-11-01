"use client";

import {
  type AdminGenreResponseDto,
  useCreateGenre,
  useDeleteGenre,
  useGenres,
  useUpdateGenre,
} from "@/app/_libs/hooks/api/use-content-taxonomy";

import { TAXONOMY_TABS_CONFIG, TaxonomyTab } from "../../_shared/taxonomy-config";
import type { TaxonomyFormValues, TaxonomyMutationCallbacks } from "../../_shared/taxonomy-types";
import { useTaxonomyListState } from "../../_shared/use-taxonomy-list-state";
import { TaxonomyManager } from "../manager/taxonomy-manager";

/**
 * Genres — name + active status. Disabling hides a genre from the customer app's filters and stops
 * it being newly assigned (videos that have it keep it). Only an unused genre can be deleted.
 * TODO(BE): `sortOrder` exists on the API but has no UI yet.
 */
export function GenresTab() {
  const listState = useTaxonomyListState();
  const { genresQuery, genres, summary } = useGenres(listState.params);
  const { createGenreMutation } = useCreateGenre();
  const { updateGenreMutation } = useUpdateGenre();
  const { deleteGenreMutation } = useDeleteGenre();

  const onSave = (
    { name }: TaxonomyFormValues,
    editing: AdminGenreResponseDto | null,
    callbacks: TaxonomyMutationCallbacks,
  ) =>
    editing
      ? updateGenreMutation.mutate({ id: editing?.id, updateGenreDto: { name } }, callbacks)
      : createGenreMutation.mutate({ name }, callbacks);

  const onToggleActive = (
    genre: AdminGenreResponseDto,
    isActive: boolean,
    callbacks: TaxonomyMutationCallbacks,
  ) => updateGenreMutation.mutate({ id: genre?.id, updateGenreDto: { isActive } }, callbacks);

  const onDelete = (genre: AdminGenreResponseDto, callbacks: TaxonomyMutationCallbacks) =>
    deleteGenreMutation.mutate(genre?.id, callbacks);

  return (
    <TaxonomyManager
      {...TAXONOMY_TABS_CONFIG[TaxonomyTab.Genres]}
      items={genres}
      listState={listState}
      summary={summary}
      isActive={(genre) => !!genre?.isActive}
      onToggleActive={onToggleActive}
      onSave={onSave}
      onDelete={onDelete}
      isLoading={genresQuery?.isPending}
      isError={genresQuery?.isError}
      onRetry={() => genresQuery?.refetch()}
      isRetrying={genresQuery?.isFetching}
    />
  );
}
