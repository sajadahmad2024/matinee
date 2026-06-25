"use client";

import { useEffect, useState } from "react";

/**
 * URL-driven tab state (app convention — tabs are linkable/shareable).
 * Returns [activeTab, setTab] where setTab writes ?<key>=value to the URL.
 */
export function useTabParam(defaultTab: string, key = "tab") {
  // Initialize state with defaultTab to avoid server-side/client-side hydration mismatch
  const [tab, setTabState] = useState(defaultTab);

  // Sync state on mount and when URL navigation events occur
  useEffect(() => {
    // Read from the URL once mounted, deferred to avoid synchronous setState warning
    const params = new URLSearchParams(window.location.search);
    const initialTab = params.get(key);
    let timer: NodeJS.Timeout;

    if (initialTab && initialTab !== defaultTab) {
      timer = setTimeout(() => {
        setTabState(initialTab);
      }, 0);
    }

    const handlePopState = () => {
      const currentParams = new URLSearchParams(window.location.search);
      setTabState(currentParams.get(key) ?? defaultTab);
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      if (timer) clearTimeout(timer);
      window.removeEventListener("popstate", handlePopState);
    };
  }, [defaultTab, key]);

  const setTab = (value: string) => {
    // 1. Update React state instantly
    setTabState(value);

    // 2. Update the browser URL without triggering Next.js router lag/re-renders
    const params = new URLSearchParams(window.location.search);
    params.set(key, value);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, "", newUrl);
  };

  return [tab, setTab] as const;
}
