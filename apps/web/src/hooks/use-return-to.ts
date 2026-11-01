"use client";

import { useMemo } from "react";

import type { Route } from "next";
import { usePathname, useSearchParams } from "next/navigation";

import { parseAsString, useQueryState } from "nuqs";

/** Query key carrying the page to go back to (a list URL with its page, search and filters). */
export const RETURN_TO_PARAM = "from";

/** `href?from=<returnTo>` — the opened page's back link returns to `returnTo` instead of a default. */
export const withReturnTo = (href: Route, returnTo?: string | null): Route =>
  (returnTo ? `${href}?${RETURN_TO_PARAM}=${encodeURIComponent(returnTo)}` : href) as Route;

/** The current page as it is now (path + query) — the `returnTo` for the pages it opens. */
export function useCurrentHref(): Route {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  return useMemo(() => {
    const qs = searchParams?.toString();
    return (qs ? `${pathname}?${qs}` : pathname) as Route;
  }, [pathname, searchParams]);
}

/**
 * The `?from=` of the current page when it points inside `section` (e.g. `/ads` or `/ads?page=3`),
 * else `null` — so a crafted link can't send the back button to another section or site.
 */
export function useReturnTo(section: Route): Route | null {
  const [from] = useQueryState(RETURN_TO_PARAM, parseAsString);
  if (!from || from.startsWith("//")) return null;
  const rest = from.slice(section.length);
  const inSection = from.startsWith(section) && (!rest || rest[0] === "?" || rest[0] === "/");
  return inSection ? (from as Route) : null;
}
