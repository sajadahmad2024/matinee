"use client";

import { useCallback } from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { Route } from "next";

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
      <SelectTrigger className="w-[140px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-card z-50">
        <SelectItem value="24h">Last 24 hours</SelectItem>
        <SelectItem value="7d">Last 7 days</SelectItem>
        <SelectItem value="1m">Last month</SelectItem>
        <SelectItem value="1y">Last year</SelectItem>
      </SelectContent>
    </Select>
  );
}
