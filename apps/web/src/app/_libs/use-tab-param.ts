"use client";

import { useEffect, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL-driven tab state (app convention — tabs are linkable/shareable).
 * Returns [activeTab, setTab] where setTab writes ?<key>=value to the URL.
 * Uses local state for instant transition and updates the router asynchronously.
 */
export function useTabParam(defaultTab: string, key = "tab") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlTab = searchParams.get(key) ?? defaultTab;
  const [tab, setTabState] = useState(urlTab);

  // Sync state if URL changes (e.g., back/forward navigation)
  useEffect(() => {
    setTabState(urlTab);
  }, [urlTab]);

  const setTab = (value: string) => {
    setTabState(value); // Instant UI response
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  return [tab, setTab] as const;
}
