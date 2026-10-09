import * as React from "react";

import { Label } from "@/components/ui/label";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomFieldProps {
  label: React.ReactNode;
  /** Id of the control, so clicking the label focuses it. */
  htmlFor?: string;
  error?: string;
  helperText?: React.ReactNode;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode;
}

/**
 * Label + form control + optional error/helper text. Wraps any control (`Input`, `Textarea`,
 * `CustomSelect`, `CustomDatePicker`, …) so field spacing and error rendering live in one place.
 */
export function CustomField({
  label,
  htmlFor,
  error,
  helperText,
  className,
  labelClassName,
  children,
}: CustomFieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={htmlFor} className={labelClassName}>
        {label}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-destructive text-sm">
          {error}
        </p>
      ) : (
        helperText && <p className="text-muted-foreground text-xs">{helperText}</p>
      )}
    </div>
  );
}
