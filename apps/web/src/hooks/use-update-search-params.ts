"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/** `null` or `""` removes the key. */
export type SearchParamUpdates = Record<string, string | null>;

interface UpdateOptions {
  /** Drop `?page=` so a filter change starts from the first page. Defaults to `true`. */
  resetPage?: boolean;
}

/**
 * Returns `update(updates)`, which merges the given keys into the current query string and
 * pushes the URL without scrolling — for URL-driven filters, tabs and pagination.
 */
export function useUpdateSearchParams() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return useCallback(
    (updates: SearchParamUpdates, { resetPage = true }: UpdateOptions = {}) => {
      const params = new URLSearchParams(searchParams.toString());
      if (resetPage) params.delete("page");
      for (const [key, value] of Object.entries(updates)) {
        if (value) params.set(key, value);
        else params.delete(key);
      }
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );
}
