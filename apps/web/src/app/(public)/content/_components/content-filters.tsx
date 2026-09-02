"use client";

import { useCallback, useEffect, useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ArrowUpDown, CalendarClock, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SortValue = "newest" | "most-viewed" | "least-viewed";
export type DateRangeValue = "30d" | "90d" | "all";

const SORT_OPTIONS: { value: SortValue; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "most-viewed", label: "Most viewed" },
  { value: "least-viewed", label: "Least viewed" },
];

const RANGE_OPTIONS: { value: DateRangeValue; label: string }[] = [
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
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [localSearch, setLocalSearch] = useState(searchQuery);

  const updateQuery = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [searchParams, pathname, router],
  );

  // Debounce search update to URL
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== searchQuery) {
        updateQuery("q", localSearch);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-64">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          placeholder="Search videos..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort — sponsor packages are sold against "top 10 most-viewed"; find them instantly */}
      <Select value={sort} onValueChange={(v) => updateQuery("sort", v === "newest" ? "" : v)}>
        <SelectTrigger className="w-[150px] gap-1.5">
          <ArrowUpDown className="text-muted-foreground h-3.5 w-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border bg-card z-50">
          {SORT_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Upload-date filter */}
      <Select value={range} onValueChange={(v) => updateQuery("range", v === "all" ? "" : v)}>
        <SelectTrigger className="w-[150px] gap-1.5">
          <CalendarClock className="text-muted-foreground h-3.5 w-3.5" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="border-border bg-card z-50">
          {RANGE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
