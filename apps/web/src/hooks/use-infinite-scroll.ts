import { useCallback, useEffect, useRef } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  /** How early to load, measured from the viewport edge. */
  rootMargin?: string;
  enabled?: boolean;
}

/**
 * Infinite scroll via IntersectionObserver: attach the returned ref to an element at the end of a
 * list (e.g. `DataTable`'s `infiniteScrollRef`); when it comes within `rootMargin` of the
 * viewport, the next page is fetched — once at a time, and only while one exists.
 */
export function useInfiniteScroll({
  hasNextPage,
  isFetchingNextPage,
  fetchNextPage,
  rootMargin = "300px",
  enabled = true,
}: UseInfiniteScrollOptions) {
  const loaderRef = useRef<HTMLDivElement>(null);

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && fetchNextPage && enabled) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage, enabled]);

  useEffect(() => {
    if (!enabled) return;

    const loader = loaderRef.current;
    if (!loader) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) handleLoadMore();
      },
      { rootMargin },
    );

    observer.observe(loader);
    return () => observer.disconnect();
  }, [handleLoadMore, rootMargin, enabled]);

  return loaderRef;
}
