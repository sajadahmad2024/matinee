"use client";

import * as React from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: React.ReactNode;
  disabled?: boolean;
}

export interface CustomSelectProps<T extends string = string> {
  options: readonly CustomSelectOption<T>[];
  value?: T;
  onValueChange: (value: T) => void;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
  /** Rendered inside the trigger, before the selected value (e.g. a sort or calendar icon). */
  leftIcon?: React.ReactNode;
  triggerClassName?: string;
  /** Defaults to the app's card-coloured dropdown; pass `""` for the plain shadcn popover. */
  contentClassName?: string;
  "aria-label"?: string;
}

const DEFAULT_CONTENT_CLASS = "border-border bg-card z-50";

/**
 * Options-driven shadcn `Select`, so screens pass data instead of repeating the
 * Trigger/Value/Content/Item markup. `onValueChange` is typed to the option values, which lets
 * callers keep union types without casting.
 */
export function CustomSelect<T extends string = string>({
  options,
  value,
  onValueChange,
  placeholder,
  id,
  disabled,
  leftIcon,
  triggerClassName,
  contentClassName = DEFAULT_CONTENT_CLASS,
  "aria-label": ariaLabel,
}: CustomSelectProps<T>) {
  const handleChange = (next: string) => {
    const option = options.find((o) => o.value === next);
    if (option) onValueChange(option.value);
  };

  return (
    <Select value={value} onValueChange={handleChange} disabled={disabled}>
      <SelectTrigger id={id} className={triggerClassName} aria-label={ariaLabel}>
        {leftIcon}
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={contentClassName || undefined}>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
