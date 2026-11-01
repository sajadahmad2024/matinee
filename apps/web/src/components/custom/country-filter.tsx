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

import { useCountries } from "@/app/_libs/hooks/api/use-admin-regions";

/**
 * App-wide country scope — URL-driven (?country=). Reusable across every module so the
 * geographic filter is consistent everywhere. "all" = no country filter.
 */
export function CountryFilter({ defaultValue = "all" }: { defaultValue?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { countries } = useCountries();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") params.delete("country");
    else params.set("country", value);
    params.delete("page"); // reset pagination when scope changes
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  return (
    <Select value={defaultValue} onValueChange={onChange}>
      <SelectTrigger className="bg-background/50 w-fit cursor-pointer gap-2">
        <MapPin className="h-4 w-4 shrink-0" />
        {/* Explicit label: a ?country= deep link still reads right while the list loads. */}
        <SelectValue>
          {defaultValue === "all"
            ? "All countries"
            : (countries?.find((c) => c?.code === defaultValue)?.name ?? defaultValue)}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="border-border bg-card max-h-80 **:[[role=option]]:cursor-pointer">
        <SelectItem value="all">All countries</SelectItem>
        {countries?.map((c) => (
          <SelectItem key={c?.code} value={c?.code}>
            {c?.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
