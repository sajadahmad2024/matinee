"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { ChevronRight, RefreshCw } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import type { AdminContentInsightsControllerLicensesV1SortEnum as LicenseSort } from "@/app/_libs/api/generated";
import {
  type LicenseAgreementDto,
  useLicenses,
  useRefreshLicenses,
} from "@/app/_libs/hooks/api/use-admin-content";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect } from "@/components/custom/custom-select";
import { type Column, DataTable } from "@/components/custom/data-table";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { CONTENT_ROUTES } from "../../_shared/content-config";
import { EMPTY, formatCents, formatDate } from "../../_shared/content-format";
import { CONTENT_TABLE_CLASS_NAMES } from "../../_shared/content-table-class-names";
import {
  ALL_RENEWALS,
  LICENSES_DEFAULT_SORT,
  LICENSES_PAGE_SIZE,
  LICENSES_SEARCH_DEBOUNCE_MS,
  LICENSE_SORT_OPTIONS,
  LICENSING_COPY,
  RENEWAL_FILTER_OPTIONS,
  RENEWAL_LABELS,
  RENEWAL_TONES,
  type RenewalFilter,
  daysLeftTone,
  roiTone,
} from "./licensing-config";

const COLUMNS: Column<LicenseAgreementDto>[] = [
  {
    header: "Content",
    className: "max-w-[220px] font-medium",
    cell: (row) => (
      <div className="flex items-center gap-1.5">
        <span className="truncate">{row?.title}</span>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    ),
  },
  {
    header: "Licensor",
    cell: (row) => row?.licensorName || EMPTY,
    className: "text-muted-foreground text-sm",
  },
  { header: "Expires", cell: (row) => formatDate(row?.expiresAt), className: "text-sm" },
  {
    header: "Days Left",
    cell: (row) =>
      row?.daysLeft == null ? (
        EMPTY
      ) : (
        <span className={daysLeftTone(row.daysLeft)}>{row.daysLeft}</span>
      ),
    className: "text-sm font-medium tabular-nums",
  },
  {
    header: "Renewal",
    cell: (row) => {
      const status = row?.renewalStatus as keyof typeof RENEWAL_LABELS;
      return (
        <Badge className={cn("border-0 text-[10px]", RENEWAL_TONES[status])}>
          {RENEWAL_LABELS[status] ?? row?.renewalStatus ?? EMPTY}
        </Badge>
      );
    },
  },
  {
    header: "Revenue",
    cell: (row) => formatCents(row?.revenueGeneratedCents, row?.currency),
    className: "text-success text-sm tabular-nums",
  },
  {
    header: "Source",
    cell: (row) => row?.revenueSource || EMPTY,
    className: "text-muted-foreground text-xs",
  },
  {
    header: "License Cost",
    cell: (row) => formatCents(row?.licenseCostCents, row?.currency),
    className: "text-sm tabular-nums",
  },
  {
    header: "ROI",
    cell: (row) =>
      row?.roi == null ? EMPTY : <span className={roiTone(row.roi)}>{row.roi?.toFixed(1)}×</span>,
    className: "text-sm font-semibold tabular-nums",
  },
];

/**
 * Licence agreements (`GET /admin/content/licenses`) — server search, renewal filter and sort,
 * loaded page by page as the table scrolls. A row opens its video.
 */
export function LicensingTable() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [renewal, setRenewal] = useState<RenewalFilter>(ALL_RENEWALS);
  const [sort, setSort] = useState<LicenseSort>(LICENSES_DEFAULT_SORT);

  const { licensesQuery, licenses, total } = useLicenses({
    q: q || undefined,
    renewalStatus: renewal === ALL_RENEWALS ? undefined : renewal,
    sort,
    limit: LICENSES_PAGE_SIZE,
  });
  const loaderRef = useInfiniteScroll({
    hasNextPage: licensesQuery?.hasNextPage,
    isFetchingNextPage: licensesQuery?.isFetchingNextPage,
    fetchNextPage: () => licensesQuery?.fetchNextPage(),
  });
  const { refresh, isRefreshing } = useRefreshLicenses();
  const isFiltered = !!q || renewal !== ALL_RENEWALS;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {total} agreement{total === 1 ? "" : "s"} · {LICENSING_COPY.rowHint}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <CustomSearch
            value={q}
            onSearch={(value) => setQ(value.trim())}
            debounceMs={LICENSES_SEARCH_DEBOUNCE_MS}
            placeholder={LICENSING_COPY.searchPlaceholder}
            containerClassName="w-64"
            inputClassName="text-base md:text-sm"
          />
          <CustomSelect
            options={RENEWAL_FILTER_OPTIONS}
            value={renewal}
            onValueChange={setRenewal}
            triggerClassName="w-fit"
            aria-label="Filter by renewal status"
          />
          <CustomSelect
            options={LICENSE_SORT_OPTIONS}
            value={sort}
            onValueChange={setSort}
            triggerClassName="w-fit"
            aria-label="Sort agreements"
          />
          {/* Picks up other admins' changes and the licence-status job without a page reload */}
          <CustomButton
            variant="outline"
            size="icon"
            onClick={() => refresh()}
            disabled={isRefreshing}
            aria-label="Refresh agreements"
            title="Refresh">
            <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
          </CustomButton>
        </div>
      </div>

      {licensesQuery?.isError ? (
        <CustomRetryState
          title={LICENSING_COPY.loadError}
          description={licensesQuery?.error?.message || LICENSING_COPY.loadErrorFallback}
          onRetry={() => licensesQuery?.refetch()}
          isRetrying={licensesQuery?.isRefetching}
        />
      ) : (
        <DataTable
          columns={COLUMNS}
          data={licenses}
          rowIdKey="licenseId"
          onRowClick={(row) => router.push(CONTENT_ROUTES.details(row?.contentId))}
          className="border-border/40 max-h-130 rounded-lg border bg-transparent"
          classNames={{
            ...CONTENT_TABLE_CLASS_NAMES,
            row: "hover:bg-muted/30 group border-border",
          }}
          infiniteScrollRef={loaderRef}
          isFetchingNextPage={licensesQuery?.isFetchingNextPage}
          emptyState={
            licensesQuery?.isPending
              ? "Loading agreements…"
              : isFiltered
                ? LICENSING_COPY.noMatches
                : LICENSING_COPY.empty
          }
        />
      )}
    </div>
  );
}
