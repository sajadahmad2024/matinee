"use client";

import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { LuSearch, LuX } from "react-icons/lu";

import { cn } from "@/app/_libs/utils/cn";
import { useDebounce } from "@/hooks/use-debounce";

export interface CustomSearchProps extends Omit<
  React.ComponentPropsWithoutRef<"input">,
  "onChange" | "value"
> {
  value?: string;
  onSearch?: (value: string) => void;
  debounceMs?: number;
  containerClassName?: string;
  inputClassName?: string;
  leftIcon?: React.ReactNode;
  isClearable?: boolean;
}

export const CustomSearch = React.forwardRef<HTMLInputElement, CustomSearchProps>(
  (
    {
      placeholder = "Search...",
      onSearch,
      debounceMs = 300,
      className,
      containerClassName,
      inputClassName,
      leftIcon = <LuSearch className="size-4" />,
      value: controlledValue,
      isClearable = true,
      disabled,
      ...props
    },
    ref,
  ) => {
    const [value, setValue] = useState(controlledValue ?? "");
    const debouncedValue = useDebounce(value, debounceMs);
    const isMounted = useRef(false);

    // Latest callback without re-running the debounce effect when the parent re-renders.
    const onSearchRef = useRef(onSearch);
    useEffect(() => {
      onSearchRef.current = onSearch;
    }, [onSearch]);

    // Follow the parent when it changes the value (e.g. "clear filters").
    useEffect(() => {
      if (controlledValue !== undefined) setValue(controlledValue);
    }, [controlledValue]);

    // Report the debounced value; skip the initial empty value on mount.
    useEffect(() => {
      if (!isMounted.current) {
        isMounted.current = true;
        if (!debouncedValue) return;
      }
      onSearchRef.current?.(debouncedValue);
    }, [debouncedValue]);

    const handleClear = useCallback(() => setValue(""), []);

    return (
      <div
        className={cn(
          "border-input dark:bg-input/30 flex h-9 w-full items-center gap-2 rounded-md border bg-transparent px-3 shadow-xs transition-[color,box-shadow]",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          disabled && "cursor-not-allowed opacity-50",
          containerClassName,
          className,
        )}>
        {leftIcon && (
          <span className="text-muted-foreground inline-flex shrink-0" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <input
          ref={ref}
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            "text-foreground placeholder:text-muted-foreground h-full w-full min-w-0 flex-1 border-none bg-transparent p-0 text-sm outline-none disabled:cursor-not-allowed",
            "shadow-none ring-0 focus:border-transparent focus:shadow-none focus:ring-0 focus:outline-none",
            inputClassName,
          )}
          {...props}
        />
        {isClearable && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            tabIndex={-1}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground inline-flex shrink-0 cursor-pointer rounded p-0.5 transition-colors">
            <LuX className="size-4" />
          </button>
        )}
      </div>
    );
  },
);
CustomSearch.displayName = "CustomSearch";
