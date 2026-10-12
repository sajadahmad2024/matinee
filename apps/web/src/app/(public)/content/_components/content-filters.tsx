"use client";

import { ArrowUpDown, CalendarClock } from "lucide-react";

import { CustomSearch } from "@/components/custom/custom-search";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

export type SortValue = "newest" | "most-viewed" | "least-viewed";
export type DateRangeValue = "30d" | "90d" | "all";

const SORT_OPTIONS: CustomSelectOption<SortValue>[] = [
  { value: "newest", label: "Newest" },
  { value: "most-viewed", label: "Most viewed" },
  { value: "least-viewed", label: "Least viewed" },
];

const RANGE_OPTIONS: CustomSelectOption<DateRangeValue>[] = [
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "all", label: "All time" },
];

interface ContentFiltersProps {
  searchQuery: string;
  sort: SortValue;
  range: DateRangeValue;
}

export function ContentFilters({ searchQuery, sort, range }: ContentFiltersProps) {
  const updateSearchParams = useUpdateSearchParams();

  const handleSearch = (value: string) => {
    if (value !== searchQuery) updateSearchParams({ q: value });
  };

  return (
    <div className="flex items-center gap-2">
      <CustomSearch
        value={searchQuery}
        onSearch={handleSearch}
        debounceMs={500}
        placeholder="Search videos..."
        isClearable={false}
        containerClassName="w-64 gap-3"
        inputClassName="text-base md:text-sm"
      />

      {/* Sort — sponsor packages are sold against "top 10 most-viewed"; find them instantly */}
      <CustomSelect
        options={SORT_OPTIONS}
        value={sort}
        onValueChange={(v) => updateSearchParams({ sort: v === "newest" ? null : v })}
        leftIcon={<ArrowUpDown className="text-muted-foreground h-3.5 w-3.5" />}
        triggerClassName="w-[150px] gap-1.5"
        aria-label="Sort videos"
      />

      {/* Upload-date filter */}
      <CustomSelect
        options={RANGE_OPTIONS}
        value={range}
        onValueChange={(v) => updateSearchParams({ range: v === "all" ? null : v })}
        leftIcon={<CalendarClock className="text-muted-foreground h-3.5 w-3.5" />}
        triggerClassName="w-[150px] gap-1.5"
        aria-label="Upload date range"
      />
    </div>
  );
}
