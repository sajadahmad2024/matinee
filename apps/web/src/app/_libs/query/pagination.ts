import type { PaginationDetailsDto } from "@/app/_libs/api/generated";

/**
 * Backend paginated envelope: `data: { items: T[], pagination: { pageNo, pageSize,
 * totalCount, totalPages } }` (query params `page` / `limit`).
 */
export interface PaginatedPage {
  data?: { pagination?: PaginationDetailsDto };
}

/** `getNextPageParam` for `useInfiniteQuery` over page-number pagination. */
export const getNextPageParam = (lastPage: PaginatedPage): number | undefined => {
  const pagination = lastPage.data?.pagination;
  if (!pagination) return undefined;
  return pagination.pageNo < pagination.totalPages ? pagination.pageNo + 1 : undefined;
};
