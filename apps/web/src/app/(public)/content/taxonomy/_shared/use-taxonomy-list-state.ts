"use client";

import { useState } from "react";

import type { TaxonomySort } from "@/app/_libs/api/generated";

import { TAXONOMY_DEFAULTS } from "./taxonomy-config";

/**
 * A library tab's list controls: search and sort. `params` is what a full list hook (studios,
 * genres) takes; `pagedParams` adds the page size for the infinite-scroll lists (tags, people).
 */
export function useTaxonomyListState() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<TaxonomySort>(TAXONOMY_DEFAULTS.sort);
  const params = { q: q || undefined, sort };

  return {
    q,
    sort,
    onSearch: (value: string) => setQ(value.trim()),
    onSortChange: setSort,
    params,
    pagedParams: { ...params, limit: TAXONOMY_DEFAULTS.pageSize },
  };
}

export type TaxonomyListState = ReturnType<typeof useTaxonomyListState>;
