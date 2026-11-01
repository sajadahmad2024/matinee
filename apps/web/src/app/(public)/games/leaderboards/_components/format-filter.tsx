"use client";

import { useSearchParams } from "next/navigation";

import { CustomSelect } from "@/components/custom/custom-select";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { type LeaderboardFormatFilter, parseFormatFilter } from "../_libs/leaderboard-config";

interface FormatFilterProps {
  options: { value: LeaderboardFormatFilter; label: string }[];
}

/** The `?format=` filter both leaderboard tabs share. */
export function FormatFilter({ options }: FormatFilterProps) {
  const searchParams = useSearchParams();
  const updateSearchParams = useUpdateSearchParams();

  return (
    <CustomSelect
      options={options}
      value={parseFormatFilter(searchParams.get("format"))}
      onValueChange={(format) => updateSearchParams({ format })}
      placeholder="Filter by format"
      triggerClassName="w-[180px]"
      aria-label="Filter by format"
    />
  );
}
