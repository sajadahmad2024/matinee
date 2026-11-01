"use client";

import { useState } from "react";

import { format, isSameDay, startOfDay } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

import { PICKER_CALENDAR_CLASS_NAMES } from "./custom-date-picker";
import { CustomTimePicker } from "./custom-time-picker";

export interface CustomDateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** date-fns format for the trigger label. */
  dateFormat?: string;
  /** Days that can't be picked, e.g. `(d) => d < startOfToday()`. */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Earliest selectable moment, read each time the picker opens so "now + n" stays current. Earlier
   * days, hours and minutes are disabled, and a picked day is pulled up to it.
   */
  getMinDate?: () => Date;
  disabled?: boolean;
  id?: string;
  className?: string;
}

/** `HH:mm` of a date, for the time input. */
const toTimeInput = (date?: Date) => (date ? format(date, "HH:mm") : "00:00");

/** The next whole minute at or after `date` (the picker has no seconds). */
const ceilToMinute = (date: Date) => new Date(Math.ceil(date.getTime() / 60_000) * 60_000);

/** `date`'s day at the given `HH:mm`. */
const withTime = (date: Date, time: string) => {
  const [hours = 0, minutes = 0] = time?.split(":")?.map(Number) ?? [];
  const next = new Date(date);
  next.setHours(hours, minutes, 0, 0);
  return next;
};

/**
 * Date and time in one control: the same outline trigger and calendar as `CustomDatePicker`, with
 * `CustomTimePicker` under the calendar. Picking a day keeps the chosen time; the time applies to the
 * picked day (and needs one first).
 */
export function CustomDateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  dateFormat = "PPP, HH:mm",
  isDateDisabled,
  getMinDate,
  disabled,
  id,
  className,
}: CustomDateTimePickerProps) {
  const time = toTimeInput(value);
  const [minDate, setMinDate] = useState<Date | null>(null);

  const isDayDisabled = (day: Date) =>
    !!isDateDisabled?.(day) || (!!minDate && day < startOfDay(minDate));
  const minTime = minDate && value && isSameDay(value, minDate) ? toTimeInput(minDate) : undefined;
  const select = (date: Date) => onChange(minDate && date < minDate ? minDate : date);

  return (
    <Popover
      onOpenChange={(open) => open && setMinDate(getMinDate ? ceilToMinute(getMinDate()) : null)}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          disabled={disabled}
          className={cn(
            "w-full cursor-pointer justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className,
          )}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, dateFormat) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={(day) => (day ? select(withTime(day, time)) : onChange(undefined))}
          initialFocus
          disabled={isDayDisabled}
          classNames={PICKER_CALENDAR_CLASS_NAMES}
        />
        <div className="border-border border-t p-3">
          <CustomTimePicker
            value={time}
            minTime={minTime}
            disabled={!value}
            onChange={(next) => value && select(withTime(value, next))}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
