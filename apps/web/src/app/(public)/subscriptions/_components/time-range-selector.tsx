"use client";

import { useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TimeRangeSelectorProps {
  defaultValue: string;
}

export function TimeRangeSelector({ defaultValue }: TimeRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(name, value);
      return params.toString();
    },
    [searchParams],
  );

  const handleValueChange = (value: string) => {
    router.push(`${pathname}?${createQueryString("timeRange", value)}` as Route, { scroll: false });
  };

  return (
    <Select value={defaultValue} onValueChange={handleValueChange}>
      <SelectTrigger className="bg-background/50 w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-card animate-in fade-in-80 duration-100">
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="30d">Last 30 days</SelectItem>
        <SelectItem value="90d">Last 90 days</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
        <SelectItem value="all">All time</SelectItem>
      </SelectContent>
    </Select>
  );
}
