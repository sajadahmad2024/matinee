"use client";

import {
  type AdminTagResponseDto,
  useCreateTag,
  useDeleteTag,
  useTags,
  useUpdateTag,
} from "@/app/_libs/hooks/api/use-content-taxonomy";

import { TAXONOMY_TABS_CONFIG, TaxonomyTab } from "../../_shared/taxonomy-config";
import type { TaxonomyFormValues, TaxonomyMutationCallbacks } from "../../_shared/taxonomy-types";
import { useTaxonomyListState } from "../../_shared/use-taxonomy-list-state";
import { TaxonomyManager } from "../manager/taxonomy-manager";

/** Tags — name only, infinite scroll; rename reuses the create body. Only an unused tag can be deleted. */
export function TagsTab() {
  const listState = useTaxonomyListState();
  const { tagsQuery, tags, summary } = useTags(listState.pagedParams);
  const { createTagMutation } = useCreateTag();
  const { updateTagMutation } = useUpdateTag();
  const { deleteTagMutation } = useDeleteTag();

  const onSave = (
    { name }: TaxonomyFormValues,
    editing: AdminTagResponseDto | null,
    callbacks: TaxonomyMutationCallbacks,
  ) =>
    editing
      ? updateTagMutation.mutate({ id: editing?.id, createTagDto: { name } }, callbacks)
      : createTagMutation.mutate({ name }, callbacks);

  const onDelete = (tag: AdminTagResponseDto, callbacks: TaxonomyMutationCallbacks) =>
    deleteTagMutation.mutate(tag?.id, callbacks);

  return (
    <TaxonomyManager
      {...TAXONOMY_TABS_CONFIG[TaxonomyTab.Tags]}
      items={tags}
      listState={listState}
      summary={summary}
      infiniteScroll={{
        hasNextPage: tagsQuery?.hasNextPage,
        isFetchingNextPage: tagsQuery?.isFetchingNextPage,
        fetchNextPage: () => tagsQuery?.fetchNextPage(),
      }}
      onSave={onSave}
      onDelete={onDelete}
      isLoading={tagsQuery?.isPending}
      isError={tagsQuery?.isError}
      onRetry={() => tagsQuery?.refetch()}
      isRetrying={tagsQuery?.isFetching}
    />
  );
}
