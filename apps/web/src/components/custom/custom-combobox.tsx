"use client";

import * as React from "react";

import { Check, Loader2, RotateCw, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomComboboxOption {
  value: string;
  label: string;
  /** Muted text on the right of the row (e.g. a role or usage count). */
  hint?: React.ReactNode;
  disabled?: boolean;
}

export interface CustomComboboxProps {
  options: readonly CustomComboboxOption[];
  /** Values rendered with a check mark. */
  selected?: readonly string[];
  onSelect: (value: string) => void;
  /** Trigger text. */
  placeholder: React.ReactNode;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Shows a clear (✕) inside the trigger — pass it only while there's a value to clear. */
  onClear?: () => void;
  /** Multi-pickers stay open so several rows can be toggled in one go. */
  closeOnSelect?: boolean;
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
  /**
   * Server-side search: called with each typed query (and "" when the picker resets). The options
   * are then shown as given — the browser doesn't filter them. Omit to filter in the browser.
   */
  onSearchChange?: (query: string) => void;
  disabled?: boolean;
  id?: string;
  triggerClassName?: string;
  "aria-label"?: string;
}

/**
 * Searchable picker (Popover + cmdk). Filters in the browser by default, for lists the API returns
 * in full; with `onSearchChange` the caller searches through the API instead. The caller owns the
 * selection and renders it (chips, rows, the trigger text).
 */
export function CustomCombobox({
  options,
  selected = [],
  onSelect,
  placeholder,
  searchPlaceholder = "Search…",
  emptyText = "No results",
  onClear,
  closeOnSelect = false,
  isLoading,
  isError,
  onRetry,
  onSearchChange,
  disabled,
  id,
  triggerClassName,
  "aria-label": ariaLabel,
}: CustomComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQueryState] = React.useState("");
  const setQuery = (next: string) => {
    setQueryState(next);
    onSearchChange?.(next);
  };

  const pick = (value: string) => {
    onSelect(value);
    setQuery("");
    if (closeOnSelect) setOpen(false);
  };

  return (
    <div className="relative w-full">
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (!next) setQuery("");
        }}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={ariaLabel}
            disabled={disabled}
            className={cn(
              "w-full cursor-pointer justify-between font-normal",
              // Room for the clear button, which sits over the trigger (no button-in-button).
              onClear && "pr-9",
              triggerClassName,
            )}>
            <span className="truncate">{placeholder}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="border-border bg-card w-(--radix-popover-trigger-width) min-w-60 p-0">
          <Command shouldFilter={!onSearchChange}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={query}
              onValueChange={setQuery}
              onClear={() => setQuery("")}
            />
            <CommandList>
              {isLoading ? (
                <div className="text-muted-foreground flex items-center justify-center gap-2 py-6 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Loading…
                </div>
              ) : isError ? (
                <div className="flex flex-col items-center gap-2 py-6 text-sm">
                  <span className="text-muted-foreground">Couldn&apos;t load the list</span>
                  {onRetry && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={onRetry}
                      className="gap-1">
                      <RotateCw className="h-3.5 w-3.5" /> Retry
                    </Button>
                  )}
                </div>
              ) : (
                <>
                  <CommandEmpty>{emptyText}</CommandEmpty>
                  <CommandGroup>
                    {options.map((option) => (
                      <CommandItem
                        key={option.value}
                        // cmdk matches on `value`; the label keeps search on what the user sees.
                        value={`${option.label} ${option.value}`}
                        disabled={option.disabled}
                        className="cursor-pointer"
                        onSelect={() => pick(option.value)}>
                        <Check
                          className={cn(
                            "h-4 w-4",
                            selected.includes(option.value) ? "opacity-100" : "opacity-0",
                          )}
                        />
                        <span className="flex-1 truncate">{option.label}</span>
                        {option.hint && (
                          <span className="text-muted-foreground text-xs">{option.hint}</span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {onClear && !disabled && (
        <button
          type="button"
          aria-label="Clear selection"
          onClick={onClear}
          className="text-muted-foreground hover:text-destructive absolute top-1/2 right-3 -translate-y-1/2 cursor-pointer rounded-sm transition-colors">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
