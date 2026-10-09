"use client";

import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomDatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  /** date-fns format for the trigger label. */
  dateFormat?: string;
  /** Days that can't be picked, e.g. `(d) => d < startOfToday()`. */
  isDateDisabled?: (date: Date) => boolean;
  id?: string;
  className?: string;
}

/** Outline-button trigger that opens a single-date calendar in a popover. */
export function CustomDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  dateFormat = "PPP",
  isDateDisabled,
  id,
  className,
}: CustomDatePickerProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
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
          onSelect={onChange}
          initialFocus
          disabled={isDateDisabled}
        />
      </PopoverContent>
    </Popover>
  );
}
