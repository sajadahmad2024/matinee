"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

/**
 * URL-driven tab state (app convention — tabs are linkable/shareable).
 * Returns [activeTab, setTab] where setTab writes ?<key>=value to the URL.
 */
export function useTabParam(defaultTab: string, key = "tab") {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const tab = searchParams.get(key) ?? defaultTab;

  const setTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  return [tab, setTab] as const;
}
