"use client";

import { useState } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  addDays,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfHour,
  subDays,
  subHours,
} from "date-fns";
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
/** Days back for each preset; "all" is the analytics API's longest window (366 days). */
const PRESET_DAYS: Record<string, number> = { "7d": 7, "30d": 30, "90d": 90, "12m": 365, all: 366 };

/** The analytics APIs reject windows over 366 days (`MAX_WINDOW_DAYS`). */
const MAX_WINDOW_DAYS = PRESET_DAYS.all ?? 366;
/**
 * Furthest a custom end may sit from its start: the window runs to the end of the end day, so
 * start + 365 days is a 366-day window.
 */
const MAX_CUSTOM_SPAN_DAYS = MAX_WINDOW_DAYS - 1;

/**
 * The selected range as an API window: `from` inclusive, `to` exclusive, ISO. Presets end at the
 * start of the current hour (so repeat requests within the hour share a cache entry); a custom range
 * covers its whole start and end days. `undefined` lets the API use its default (last 30 days).
 */
export const analyticsWindowFor = (
  timeRange: string,
  startDate?: Date,
  endDate?: Date,
): { from: string; to: string } | undefined => {
  if (timeRange === "custom") {
    return startDate && endDate
      ? {
          from: startOfDay(startDate).toISOString(),
          to: addDays(startOfDay(endDate), 1).toISOString(),
        }
      : undefined;
  }
  const to = startOfHour(new Date());
  if (timeRange === "24h") return { from: subHours(to, 24).toISOString(), to: to.toISOString() };
  const days = PRESET_DAYS[timeRange];
  return days ? { from: subDays(to, days).toISOString(), to: to.toISOString() } : undefined;
};

export function useAnalyticsDateRange() {
  const searchParams = useSearchParams();
  const timeRange = searchParams.get("timeRange") ?? DEFAULT_RANGE;
  const startDate = parseDate(searchParams.get("from"));
  const endDate = parseDate(searchParams.get("to"));

  const label =
    timeRange === "custom" && startDate && endDate
      ? `${format(startDate, "PP")} → ${format(endDate, "PP")}`
      : (PRESETS.find((p) => p.value === timeRange)?.label ?? "Last 30 days");

  return {
    timeRange,
    startDate,
    endDate,
    label,
    /** `{ from, to }` for analytics APIs that take a window. */
    window: analyticsWindowFor(timeRange, startDate, endDate),
  };
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
          <Label className="text-muted-foreground text-xs">
            Custom range · up to {MAX_WINDOW_DAYS} days
          </Label>
          <div className="space-y-2">
            <DatePickerField
              label="Start date"
              placeholder="Pick a start date"
              value={startDate}
              onChange={handleStartChange}
              disabled={(date) =>
                isFuture(date) ||
                (endDate
                  ? date > endDate || date < subDays(startOfDay(endDate), MAX_CUSTOM_SPAN_DAYS)
                  : false)
              }
            />
            <DatePickerField
              label="End date"
              placeholder="Pick an end date"
              value={endDate}
              onChange={setEndDate}
              disabled={(date) =>
                isFuture(date) ||
                (startDate
                  ? date < startDate || date > addDays(startOfDay(startDate), MAX_CUSTOM_SPAN_DAYS)
                  : false)
              }
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
