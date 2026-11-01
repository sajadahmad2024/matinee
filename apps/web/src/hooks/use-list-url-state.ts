"use client";

import { useCallback, useMemo } from "react";

import { parseAsInteger, parseAsString, parseAsStringLiteral, useQueryStates } from "nuqs";

import { useCurrentHref } from "@/hooks/use-return-to";

/** One URL filter: the values it accepts and the one used when the URL has none (or a bad one). */
export interface ListFilterSpec {
  values: readonly string[];
  defaultValue: string;
}

export interface ListUrlStateOptions<F extends Record<string, ListFilterSpec>> {
  filters?: F;
  pageSizeOptions?: readonly number[];
  defaultPageSize?: number;
}

type FilterValues<F extends Record<string, ListFilterSpec>> = {
  [K in keyof F]: F[K]["values"][number];
};

/**
 * List state in the URL — `?page`, `?limit`, `?q` and the given filters — so a filtered list
 * survives refresh, back navigation and sharing. Unknown values fall back to the defaults, which
 * are left out of the URL. Changing the search, page size or a filter goes back to page 1.
 *
 * Backed by `nuqs` (replace, not push: paging and filtering don't stack browser history). Pass
 * `listReturnTo` to the pages a row opens (see `withReturnTo`) so their back link restores the list.
 *
 * @example
 * const { page, limit, q, filters, setFilter, listReturnTo } = useListUrlState({
 *   filters: { status: { values: ["all", "active"], defaultValue: "all" } },
 * });
 */
export function useListUrlState<F extends Record<string, ListFilterSpec> = Record<string, never>>({
  filters,
  pageSizeOptions = [10, 20, 50],
  defaultPageSize = 20,
}: ListUrlStateOptions<F> = {}) {

  // `filters` is static config (a module constant), so the parsers are built once
  const parsers = useMemo(
    () => ({
      page: parseAsInteger.withDefault(1),
      limit: parseAsInteger.withDefault(defaultPageSize),
      q: parseAsString.withDefault(""),
      ...Object.fromEntries(
        Object.entries(filters ?? {}).map(([key, spec]) => [
          key,
          parseAsStringLiteral(spec.values).withDefault(spec.defaultValue),
        ]),
      ),
    }),
    [filters, defaultPageSize],
  );

  const [query, setQuery] = useQueryStates(parsers, {
    history: "replace",
    clearOnDefault: true,
    scroll: false,
  });

  const page = query.page > 0 ? query.page : 1;
  const limit = pageSizeOptions.includes(query.limit) ? query.limit : defaultPageSize;
  const q = query.q;

  const filterValues = useMemo(() => {
    const out: Record<string, string> = {};
    for (const [key, spec] of Object.entries(filters ?? {})) {
      out[key] = ((query as Record<string, unknown>)[key] as string | null) ?? spec.defaultValue;
    }
    return out as FilterValues<F>;
  }, [filters, query]);

  const setPage = useCallback(
    (next: number) => setQuery({ page: next > 1 ? next : null }),
    [setQuery],
  );

  const setLimit = useCallback((next: number) => setQuery({ limit: next, page: null }), [setQuery]);

  const setQ = useCallback(
    (next: string) => setQuery({ q: next.trim() || null, page: null }),
    [setQuery],
  );

  const setFilter = useCallback(
    <K extends keyof F & string>(key: K, value: FilterValues<F>[K]) =>
      setQuery({ [key]: value, page: null }),
    [setQuery],
  );

  /** A search or a non-default filter is applied (page and page size don't count). */
  const isFiltered =
    !!q ||
    Object.entries(filters ?? {}).some(
      ([key, spec]) => (filterValues as Record<string, string>)[key] !== spec.defaultValue,
    );

  /** Back to the defaults: drops `q`, `page`, `limit` and every filter from the URL. */
  const reset = useCallback(
    () =>
      setQuery({
        q: null,
        page: null,
        limit: null,
        ...Object.fromEntries(Object.keys(filters ?? {}).map((key) => [key, null])),
      }),
    [filters, setQuery],
  );

  /** This list as it is now (path + query), for the back link of the pages a row opens. */
  const listReturnTo = useCurrentHref();

  return {
    page,
    limit,
    q,
    filters: filterValues,
    pageSizeOptions,
    isFiltered,
    listReturnTo,
    setPage,
    setLimit,
    setQ,
    setFilter,
    reset,
  };
}
