"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { Globe } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { MACRO_REGIONS } from "@/app/_libs/regions";

interface RegionFilterProps {
  defaultValue?: string;
}

/** Territory lens for per-format analytics — writes ?region= (games & leaderboards differ by region). */
export function RegionFilter({ defaultValue = "all" }: RegionFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = useCallback(
    (value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === "all") {
        params.delete("region");
      } else {
        params.set("region", value);
      }
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  return (
    <Select defaultValue={defaultValue} onValueChange={handleChange}>
      <SelectTrigger className="w-[190px]">
        <Globe className="text-muted-foreground mr-1 h-4 w-4" />
        <SelectValue placeholder="All regions" />
      </SelectTrigger>
      <SelectContent className="border-border bg-card z-50">
        <SelectItem value="all">All regions</SelectItem>
        {MACRO_REGIONS.map((r) => (
          <SelectItem key={r.code} value={r.code}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
