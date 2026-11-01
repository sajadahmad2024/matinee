"use client";

import { ArrowUpDown, CalendarClock, RefreshCw } from "lucide-react";

import { useRefreshContent } from "@/app/_libs/hooks/api/use-admin-content";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect } from "@/components/custom/custom-select";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import {
  CONTENT_LIST_COPY,
  CONTENT_LIST_DEFAULTS,
  CONTENT_SEARCH_DEBOUNCE_MS,
  CONTENT_SORT_OPTIONS,
  type ContentDateRange,
  type ContentSort,
  DATE_RANGE_OPTIONS,
} from "./listing-config";

interface ContentFiltersProps {
  searchQuery: string;
  sort: ContentSort;
  range: ContentDateRange;
  /** Calendar view: sort can't reorder a calendar and the upload-date range would hide entries. */
  isCalendarView?: boolean;
}

export function ContentFilters({ searchQuery, sort, range, isCalendarView }: ContentFiltersProps) {
  const updateSearchParams = useUpdateSearchParams();
  const { refresh, isRefreshing } = useRefreshContent();

  const handleSearch = (value: string) => {
    if (value !== searchQuery) updateSearchParams({ q: value });
  };

  return (
    <div className="flex items-center gap-2">
      <CustomSearch
        value={searchQuery}
        onSearch={handleSearch}
        debounceMs={CONTENT_SEARCH_DEBOUNCE_MS}
        placeholder={CONTENT_LIST_COPY.searchPlaceholder}
        containerClassName="w-64 gap-3"
        inputClassName="text-base md:text-sm"
      />

      {!isCalendarView && (
        <>
          {/* Sort — sponsor packages are sold against "top 10 most-viewed"; find them instantly */}
          <CustomSelect
            options={CONTENT_SORT_OPTIONS}
            value={sort}
            onValueChange={(v) =>
              updateSearchParams({ sort: v === CONTENT_LIST_DEFAULTS.sort ? null : v })
            }
            leftIcon={<ArrowUpDown className="text-muted-foreground h-3.5 w-3.5" />}
            triggerClassName="w-fit gap-1.5"
            aria-label="Sort videos"
          />

          {/* Upload-date filter */}
          <CustomSelect
            options={DATE_RANGE_OPTIONS}
            value={range}
            onValueChange={(v) =>
              updateSearchParams({ range: v === CONTENT_LIST_DEFAULTS.range ? null : v })
            }
            leftIcon={<CalendarClock className="text-muted-foreground h-3.5 w-3.5" />}
            triggerClassName="w-fit gap-1.5"
            aria-label="Upload date range"
          />
        </>
      )}

      {/* Picks up other admins' changes without a page reload */}
      <CustomButton
        variant="outline"
        size="icon"
        onClick={() => refresh()}
        disabled={isRefreshing}
        aria-label="Refresh videos"
        title="Refresh">
        <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
      </CustomButton>
    </div>
  );
}
