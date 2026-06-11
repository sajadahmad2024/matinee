"use client";

import { useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { CalendarDays, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

const PRESETS = [
  { value: "24h", label: "Last 24 hours" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "12m", label: "Last 12 months" },
  { value: "all", label: "All time" },
] as const;

interface TimeRangeSelectorProps {
  /** current value of the ?timeRange= param (preset value or "custom") */
  defaultValue: string;
}

/**
 * App-wide analytics time filter — consistent presets + a Custom date range.
 * URL-driven: ?timeRange=<preset> or ?timeRange=custom&from=YYYY-MM-DD&to=YYYY-MM-DD.
 */
export function TimeRangeSelector({ defaultValue }: TimeRangeSelectorProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState(searchParams.get("from") ?? "");
  const [to, setTo] = useState(searchParams.get("to") ?? "");

  const push = (params: URLSearchParams) =>
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });

  const selectPreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", value);
    params.delete("from");
    params.delete("to");
    push(params);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!from || !to) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", "custom");
    params.set("from", from);
    params.set("to", to);
    push(params);
    setOpen(false);
  };

  const label =
    defaultValue === "custom" && from && to
      ? `${from} → ${to}`
      : (PRESETS.find((p) => p.value === defaultValue)?.label ?? "Last 30 days");

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="bg-background/50 w-[180px] justify-start gap-2 font-normal">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-border bg-card w-[260px] p-2" align="end">
        <div className="space-y-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => selectPreset(p.value)}
              className={cn(
                "hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                defaultValue === p.value && "text-primary",
              )}>
              {p.label}
              {defaultValue === p.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>

        <div className="border-border/40 mt-2 space-y-2 border-t pt-2">
          <Label className="text-muted-foreground text-xs">Custom range</Label>
          <div className="grid grid-cols-2 gap-2">
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-8 text-xs" />
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-8 text-xs" />
          </div>
          <Button size="sm" className="w-full" onClick={applyCustom} disabled={!from || !to}>
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
