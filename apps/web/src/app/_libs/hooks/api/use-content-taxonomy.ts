"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AdminTaxonomyControllerGenresV1Request,
  AdminTaxonomyControllerPeopleV1Request,
  AdminTaxonomyControllerStudiosV1Request,
  AdminTaxonomyControllerTagsV1Request,
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  CreateTagDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from "@/app/_libs/api/generated";
import { adminContentLibraryApi } from "@/app/_libs/api/sdk/admin-content-library-api";
import { getNextPageParam } from "@/app/_libs/query/pagination";
import { TAXONOMY_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type {
  AdminGenreResponseDto,
  AdminTagResponseDto,
  CreateGenreDto,
  CreatePersonDto,
  CreateStudioDto,
  CreateTagDto,
  PersonResponseDto,
  StudioResponseDto,
  TaxonomySummaryDto,
  UpdateGenreDto,
  UpdatePersonDto,
  UpdateStudioDto,
} from "@/app/_libs/api/generated";
export {
  CreatePersonDtoKnownForEnum as PersonKnownForEnum,
  PersonKnownFor,
  TaxonomySort,
} from "@/app/_libs/api/generated";

/** Shared list-query options: always refetch on mount, keep rows on screen while params change. */
const LIST_QUERY_OPTIONS = {
  refetchOnMount: "always",
  placeholderData: keepPreviousData,
} as const;

const useInvalidateTaxonomy = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: TAXONOMY_QUERY_KEYS.all });
};

// ─── Studios ─────────────────────────────────────────────────────────────────

export const useStudios = (params: AdminTaxonomyControllerStudiosV1Request = {}) => {
  const query = useQuery({
    queryKey: TAXONOMY_QUERY_KEYS.studios(params),
    queryFn: () => adminContentLibraryApi.adminTaxonomyControllerStudiosV1(params),
    ...LIST_QUERY_OPTIONS,
  });

  return {
    studiosQuery: query,
    studios: query?.data?.data?.items ?? [],
    summary: query?.data?.data?.summary,
  };
};

export const useCreateStudio = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (createStudioDto: CreateStudioDto) =>
      adminContentLibraryApi.adminTaxonomyControllerCreateStudioV1({ createStudioDto }),
    onSuccess: invalidate,
  });

  return { createStudioMutation: mutation };
};

export const useUpdateStudio = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: ({ id, updateStudioDto }: { id: string; updateStudioDto: UpdateStudioDto }) =>
      adminContentLibraryApi.adminTaxonomyControllerUpdateStudioV1({ id, updateStudioDto }),
    onSuccess: invalidate,
  });

  return { updateStudioMutation: mutation };
};

/** Refused (409) while any video uses the studio. */
export const useDeleteStudio = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      adminContentLibraryApi.adminTaxonomyControllerDeleteStudioV1({ id }),
    onSuccess: invalidate,
  });

  return { deleteStudioMutation: mutation };
};

// ─── Genres ──────────────────────────────────────────────────────────────────

export const useGenres = (params: AdminTaxonomyControllerGenresV1Request = {}) => {
  const query = useQuery({
    queryKey: TAXONOMY_QUERY_KEYS.genres(params),
    queryFn: () => adminContentLibraryApi.adminTaxonomyControllerGenresV1(params),
    ...LIST_QUERY_OPTIONS,
  });

  return {
    genresQuery: query,
    genres: query?.data?.data?.items ?? [],
    summary: query?.data?.data?.summary,
  };
};

export const useCreateGenre = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (createGenreDto: CreateGenreDto) =>
      adminContentLibraryApi.adminTaxonomyControllerCreateGenreV1({ createGenreDto }),
    onSuccess: invalidate,
  });

  return { createGenreMutation: mutation };
};

export const useUpdateGenre = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: ({ id, updateGenreDto }: { id: string; updateGenreDto: UpdateGenreDto }) =>
      adminContentLibraryApi.adminTaxonomyControllerUpdateGenreV1({ id, updateGenreDto }),
    onSuccess: invalidate,
  });

  return { updateGenreMutation: mutation };
};

/** Refused (409) while any video uses the genre. */
export const useDeleteGenre = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentLibraryApi.adminTaxonomyControllerDeleteGenreV1({ id }),
    onSuccess: invalidate,
  });

  return { deleteGenreMutation: mutation };
};

// ─── Tags ────────────────────────────────────────────────────────────────────

/**
 * Paged: `tags` grows as `fetchNextPage` loads the next page; `summary` covers every match.
 * `page` is the query's own — callers set the rest (`limit` is the page size).
 */
export const useTags = (params: Omit<AdminTaxonomyControllerTagsV1Request, "page"> = {}) => {
  const query = useInfiniteQuery({
    queryKey: TAXONOMY_QUERY_KEYS.tags(params),
    queryFn: ({ pageParam }) =>
      adminContentLibraryApi.adminTaxonomyControllerTagsV1({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam,
    ...LIST_QUERY_OPTIONS,
  });

  return {
    tagsQuery: query,
    tags: query?.data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    summary: query?.data?.pages?.[0]?.data?.summary,
  };
};

export const useCreateTag = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (createTagDto: CreateTagDto) =>
      adminContentLibraryApi.adminTaxonomyControllerCreateTagV1({ createTagDto }),
    onSuccess: invalidate,
  });

  return { createTagMutation: mutation };
};

/** Rename — the backend reuses the create body. */
export const useUpdateTag = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: ({ id, createTagDto }: { id: string; createTagDto: CreateTagDto }) =>
      adminContentLibraryApi.adminTaxonomyControllerUpdateTagV1({ id, createTagDto }),
    onSuccess: invalidate,
  });

  return { updateTagMutation: mutation };
};

/** Refused (409) while any video uses the tag. */
export const useDeleteTag = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (id: string) => adminContentLibraryApi.adminTaxonomyControllerDeleteTagV1({ id }),
    onSuccess: invalidate,
  });

  return { deleteTagMutation: mutation };
};

// ─── People (cast & crew) ────────────────────────────────────────────────────

/**
 * Paged: `people` grows as `fetchNextPage` loads the next page; `summary` covers every match.
 * `page` is the query's own — callers set the rest (`limit` is the page size).
 */
export const usePeople = (params: Omit<AdminTaxonomyControllerPeopleV1Request, "page"> = {}) => {
  const query = useInfiniteQuery({
    queryKey: TAXONOMY_QUERY_KEYS.people(params),
    queryFn: ({ pageParam }) =>
      adminContentLibraryApi.adminTaxonomyControllerPeopleV1({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam,
    ...LIST_QUERY_OPTIONS,
  });

  return {
    peopleQuery: query,
    people: query?.data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    summary: query?.data?.pages?.[0]?.data?.summary,
  };
};

export const useCreatePerson = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (createPersonDto: CreatePersonDto) =>
      adminContentLibraryApi.adminTaxonomyControllerCreatePersonV1({ createPersonDto }),
    onSuccess: invalidate,
  });

  return { createPersonMutation: mutation };
};

export const useUpdatePerson = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: ({ id, updatePersonDto }: { id: string; updatePersonDto: UpdatePersonDto }) =>
      adminContentLibraryApi.adminTaxonomyControllerUpdatePersonV1({ id, updatePersonDto }),
    onSuccess: invalidate,
  });

  return { updatePersonMutation: mutation };
};

/** Refused (409) while any video credits the person. */
export const useDeletePerson = () => {
  const invalidate = useInvalidateTaxonomy();
  const mutation = useMutation({
    mutationFn: (id: string) =>
      adminContentLibraryApi.adminTaxonomyControllerDeletePersonV1({ id }),
    onSuccess: invalidate,
  });

  return { deletePersonMutation: mutation };
};
