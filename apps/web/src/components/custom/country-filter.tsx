"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { MapPin } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { COUNTRIES } from "@/app/_libs/regions";

/**
 * App-wide country scope — URL-driven (?country=). Reusable across every module so the
 * geographic filter is consistent everywhere. "all" = no country filter.
 */
export function CountryFilter({ defaultValue = "all" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("country");
    else params.set("country", value);
    params.delete("page"); // reset pagination when scope changes
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  return (
    <Select value={defaultValue} onValueChange={onChange}>
      <SelectTrigger className="bg-background/50 w-[160px] gap-2">
        <MapPin className="h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-card max-h-[320px]">
        <SelectItem value="all">All countries</SelectItem>
        {COUNTRIES.map((c) => (
          <SelectItem key={c.code} value={c.code}>
            {c.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
