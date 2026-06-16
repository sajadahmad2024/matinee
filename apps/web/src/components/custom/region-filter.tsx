"use client";

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
  /** current value of the ?region= param ("global" or a macro-region code) */
  defaultValue: string;
}

/** App-wide region scope for analytics — URL-driven (?region=). "global" = all regions. */
export function RegionFilter({ defaultValue }: RegionFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "global") params.delete("region");
    else params.set("region", value);
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
  };

  return (
    <Select value={defaultValue} onValueChange={onChange}>
      <SelectTrigger className="bg-background/50 w-[150px] gap-2">
        <Globe className="h-4 w-4 shrink-0" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="border-border bg-card">
        <SelectItem value="global">All regions</SelectItem>
        {MACRO_REGIONS.map((r) => (
          <SelectItem key={r.code} value={r.code}>
            {r.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
