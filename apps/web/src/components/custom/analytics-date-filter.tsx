"use client";

import { useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { endOfDay, format, parseISO } from "date-fns";
import { CalendarDays, CalendarIcon, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

const DEFAULT_RANGE = "30d";
const URL_DATE = "yyyy-MM-dd";

// Analytics only exist for the past, so future dates are never selectable.
const isFuture = (date: Date) => date > endOfDay(new Date());

const parseDate = (value: string | null) => (value ? parseISO(value) : undefined);

/** Reads the current ?timeRange= / ?from= / ?to= selection and its display label. */
export function useAnalyticsDateRange() {
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? DEFAULT_RANGE;
  const startDate = parseDate(searchParams.get("from"));
  const endDate = parseDate(searchParams.get("to"));

  const label =
    timeRange === "custom" && startDate && endDate
      ? `${format(startDate, "PP")} → ${format(endDate, "PP")}`
      : (PRESETS.find((p) => p.value === timeRange)?.label ?? "Last 30 days");

  return { timeRange, startDate, endDate, label };
}

interface DatePickerFieldProps {
  label: string;
  placeholder: string;
  value?: Date;
  onChange: (date?: Date) => void;
  disabled: (date: Date) => boolean;
}

function DatePickerField({ label, placeholder, value, onChange, disabled }: DatePickerFieldProps) {
  return (
    <div className="space-y-1">
      <Label className="text-muted-foreground text-[10px]">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "w-full justify-start text-left text-xs font-normal",
              !value && "text-muted-foreground",
            )}>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "PP") : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
            disabled={disabled}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

/**
 * Video analytics time filter — same presets + Custom range as the dashboard's
 * TimeRangeSelector, but the custom range is picked with calendar popovers.
 * URL-driven: ?timeRange=<preset> or ?timeRange=custom&from=YYYY-MM-DD&to=YYYY-MM-DD.
 */
export function AnalyticsDateFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const {
    timeRange,
    startDate: appliedStart,
    endDate: appliedEnd,
    label,
  } = useAnalyticsDateRange();

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(appliedStart);
  const [endDate, setEndDate] = useState<Date | undefined>(appliedEnd);

  const push = (params: URLSearchParams) =>
    router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });

  const selectPreset = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", value);
    params.delete("from");
    params.delete("to");
    push(params);
    setStartDate(undefined);
    setEndDate(undefined);
    setOpen(false);
  };

  const applyCustom = () => {
    if (!startDate || !endDate) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeRange", "custom");
    params.set("from", format(startDate, URL_DATE));
    params.set("to", format(endDate, URL_DATE));
    push(params);
    setOpen(false);
  };

  const handleStartChange = (date?: Date) => {
    setStartDate(date);
    // keep the range valid — drop an end date that now falls before the new start
    if (date && endDate && endDate < date) setEndDate(undefined);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="bg-background/50 w-[180px] justify-start gap-2 font-normal">
          <CalendarDays className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="border-border bg-card w-[280px] p-2" align="end">
        <div className="space-y-0.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              type="button"
              onClick={() => selectPreset(p.value)}
              className={cn(
                "hover:bg-muted/40 flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm",
                timeRange === p.value && "text-primary",
              )}>
              {p.label}
              {timeRange === p.value && <Check className="h-4 w-4" />}
            </button>
          ))}
        </div>

        <div className="border-border/40 mt-2 space-y-2 border-t pt-2">
          <Label className="text-muted-foreground text-xs">Custom range</Label>
          <div className="space-y-2">
            <DatePickerField
              label="Start date"
              placeholder="Pick a start date"
              value={startDate}
              onChange={handleStartChange}
              disabled={(date) => isFuture(date) || (endDate ? date > endDate : false)}
            />
            <DatePickerField
              label="End date"
              placeholder="Pick an end date"
              value={endDate}
              onChange={setEndDate}
              disabled={(date) => isFuture(date) || (startDate ? date < startDate : false)}
            />
          </div>
          <Button
            size="sm"
            className="w-full"
            onClick={applyCustom}
            disabled={!startDate || !endDate}>
            Apply range
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
