"use client";

import type { ReactNode } from "react";

import Link from "next/link";

import type { UseQueryResult } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import { ApiError } from "@/app/_libs/api/api-error";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { useReturnTo } from "@/hooks/use-return-to";

import { AD_ROUTES, adBackLabel } from "../_libs/ad-config";

/**
 * What an ad page shows while its campaign isn't there: the page's own `skeleton` while loading,
 * "Ad not found" on 404 (or a missing id), retry on any other error.
 */
export function AdQueryState({
  query,
  skeleton,
}: {
  query: UseQueryResult<unknown, Error>;
  /** Mirrors the page's real layout, so nothing jumps when the data lands. */
  skeleton: ReactNode;
}) {
  const listHref = useReturnTo(AD_ROUTES.LIST);
  if (query.isPending && query.fetchStatus !== "idle") return skeleton;

  const notFound =
    !query.isError || (query.error instanceof ApiError && query.error.statusCode === 404);
  if (!notFound) {
    return (
      <CustomRetryState
        title="Couldn't load this ad"
        description={query.error?.message}
        onRetry={() => void query.refetch()}
        isRetrying={query.isFetching}
      />
    );
  }

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <p className="text-foreground text-lg font-semibold">Ad not found</p>
      <Button asChild variant="outline">
        <Link href={listHref ?? AD_ROUTES.LIST}>{adBackLabel(listHref)}</Link>
      </Button>
    </div>
  );
}
