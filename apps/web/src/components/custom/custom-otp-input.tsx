"use client";

import * as React from "react";

import { REGEXP_ONLY_DIGITS } from "input-otp";

import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomOtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  label?: string;
  error?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  id?: string;
  className?: string;
}

export function CustomOtpInput({
  value,
  onChange,
  length = 6,
  label,
  error,
  disabled,
  autoFocus,
  id,
  className,
}: CustomOtpInputProps) {
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={inputId} className="text-foreground-secondary">
          {label}
        </Label>
      )}

      <InputOTP
        id={inputId}
        maxLength={length}
        pattern={REGEXP_ONLY_DIGITS}
        value={value}
        onChange={onChange}
        disabled={disabled}
        autoFocus={autoFocus}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        containerClassName="justify-center">
        <InputOTPGroup className="gap-3">
          {Array.from({ length }, (_, index) => (
            <InputOTPSlot
              key={index}
              index={index}
              aria-invalid={hasError}
              className={cn(
                // Separate boxes (override the joined shadcn group styling) in the app's input look.
                "bg-input/50 text-foreground h-14 w-12 rounded-lg border text-xl font-semibold backdrop-blur-sm",
                "first:rounded-lg last:rounded-lg",
                "data-[active=true]:border-primary data-[active=true]:ring-primary/50 data-[active=true]:ring-2",
                hasError ? "border-destructive" : "border-border",
              )}
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {hasError && (
        <p id={errorId} role="alert" className="text-destructive text-center text-sm">
          {error}
        </p>
      )}
    </div>
  );
}
