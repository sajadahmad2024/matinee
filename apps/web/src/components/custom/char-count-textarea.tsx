"use client";

import * as React from "react";

import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/app/_libs/utils/cn";

export interface CharCountTextareaProps extends React.ComponentProps<"textarea"> {
  maxLength: number;
  containerClassName?: string;
}

/**
 * Textarea with a "12/300" counter under it, for capped text such as captions. Pass `value`
 * (e.g. through react-hook-form's `Controller`) when the field starts with a value: an uncontrolled
 * textarea only counts from `defaultValue` and typing.
 */
export const CharCountTextarea = React.forwardRef<HTMLTextAreaElement, CharCountTextareaProps>(
  ({ maxLength, containerClassName, className, onChange, value, defaultValue, ...props }, ref) => {
    const [count, setCount] = React.useState(() => String(value ?? defaultValue ?? "").length);

    // controlled: follow the value; uncontrolled (register): count on change
    React.useEffect(() => {
      if (value !== undefined) setCount(String(value).length);
    }, [value]);

    return (
      <div className={cn("space-y-1", containerClassName)}>
        <Textarea
          ref={ref}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          // same surface, border and focus ring as `CustomInput`, so it sits with the form's inputs
          className={cn(
            "bg-input/50 dark:bg-input/50 border-border hover:border-border/80 text-foreground resize-none rounded-lg px-4 backdrop-blur-sm transition-all duration-200",
            "focus-visible:border-primary focus-visible:ring-primary/50 focus-visible:ring-2",
            "aria-invalid:border-destructive",
            className,
          )}
          onChange={(e) => {
            setCount(e.target.value.length);
            onChange?.(e);
          }}
          {...props}
        />
        <p className="text-muted-foreground text-right text-xs tabular-nums">
          {count}/{maxLength}
        </p>
      </div>
    );
  },
);

CharCountTextarea.displayName = "CharCountTextarea";
