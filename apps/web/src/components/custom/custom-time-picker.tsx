"use client";

import { Clock } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { CustomSelect } from "./custom-select";

const pad = (n: number) => String(n).padStart(2, "0");
const HOURS = Array.from({ length: 24 }, (_, h) => h);
const MINUTES = Array.from({ length: 60 }, (_, m) => m);

export interface CustomTimePickerProps {
  /** 24-hour `HH:mm`. */
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  id?: string;
  /** Earliest selectable `HH:mm`; earlier hours and minutes are disabled. */
  minTime?: string;
  /** Hides the leading clock icon (e.g. when the surrounding UI already shows one). */
  hideIcon?: boolean;
  className?: string;
}

/**
 * 24-hour time as hour and minute selects. Replaces `<input type="time">`, whose dropdown is drawn
 * by the browser and can't follow the app's theme.
 */
export function CustomTimePicker({
  value,
  onChange,
  disabled,
  id,
  minTime,
  hideIcon,
  className,
}: CustomTimePickerProps) {
  const [hours = "00", minutes = "00"] = value?.split(":") ?? [];
  const [minHour, minMinute] = minTime ? minTime.split(":").map(Number) : [];
  const atMinHour = minHour !== undefined && Number(hours) === minHour;

  const hourOptions = HOURS.map((h) => ({
    value: pad(h),
    label: pad(h),
    disabled: minHour !== undefined && h < minHour,
  }));
  const minuteOptions = MINUTES.map((m) => ({
    value: pad(m),
    label: pad(m),
    disabled: atMinHour && minMinute !== undefined && m < minMinute,
  }));

  // moving onto the earliest hour pulls the minutes up to the earliest minute
  const changeHours = (next: string) => {
    const clamp =
      minHour === Number(next) && minMinute !== undefined && Number(minutes) < minMinute;
    onChange(`${next}:${clamp ? pad(minMinute) : minutes}`);
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {!hideIcon && <Clock className="text-muted-foreground h-4 w-4 shrink-0" />}
      <CustomSelect
        id={id}
        options={hourOptions}
        value={hours}
        onValueChange={changeHours}
        disabled={disabled}
        triggerClassName="w-18"
        contentClassName="border-border bg-card z-50 max-h-60"
        aria-label="Hours"
      />
      <span className="text-muted-foreground">:</span>
      <CustomSelect
        options={minuteOptions}
        value={minutes}
        onValueChange={(next) => onChange(`${hours}:${next}`)}
        disabled={disabled}
        triggerClassName="w-18"
        contentClassName="border-border bg-card z-50 max-h-60"
        aria-label="Minutes"
      />
    </div>
  );
}
