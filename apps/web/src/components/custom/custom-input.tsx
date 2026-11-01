"use client";

import * as React from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";

import { Label } from "@/components/ui/label";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomInputProps extends React.ComponentProps<"input"> {
  label?: string;
  labelAction?: React.ReactNode;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
  labelClassName?: string;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  (
    {
      className,
      type,
      id,
      label,
      labelAction,
      required,
      error,
      helperText,
      leftIcon,
      rightIcon,
      containerClassName,
      labelClassName,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const inputId = id ?? generatedId;
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const hasError = Boolean(error);
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={cn("w-full space-y-2", containerClassName)}>
        {(label || labelAction) && (
          <div className="flex items-center justify-between">
            {label && (
              <Label htmlFor={inputId} className={cn("text-foreground-secondary", labelClassName)}>
                {label}
                {required && (
                  <span className="text-destructive" aria-hidden="true">
                    *
                  </span>
                )}
              </Label>
            )}
            {labelAction}
          </div>
        )}

        <div className="relative w-full">
          {leftIcon && (
            <span className="text-muted-foreground pointer-events-none absolute top-1/2 left-3 -translate-y-1/2">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={isPassword && showPassword ? "text" : type}
            required={required}
            data-slot="input"
            aria-invalid={hasError}
            aria-describedby={hasError ? errorId : helperText ? helperId : undefined}
            className={cn(
              "bg-input/50 text-foreground placeholder:text-muted-foreground flex h-11 w-full rounded-lg border px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200",
              "focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none",
              "disabled:cursor-not-allowed disabled:opacity-50",
              hasError
                ? "border-destructive focus:border-destructive focus:ring-destructive/50"
                : "border-border hover:border-border/80",
              leftIcon && "pl-10",
              (isPassword || rightIcon) && "pr-12",
              className,
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-10 -translate-y-1/2 cursor-pointer transition-colors">
              {showPassword ? (
                <LuEyeOff className="pointer-events-none size-5" />
              ) : (
                <LuEye className="pointer-events-none size-5" />
              )}
            </button>
          ) : (
            rightIcon && (
              <span className="text-muted-foreground absolute top-1/2 right-3 -translate-y-1/2">
                {rightIcon}
              </span>
            )
          )}
        </div>

        {hasError ? (
          <p id={errorId} role="alert" className="text-destructive text-sm">
            {error}
          </p>
        ) : (
          helperText && (
            <p id={helperId} className="text-muted-foreground text-xs">
              {helperText}
            </p>
          )
        )}
      </div>
    );
  },
);
CustomInput.displayName = "CustomInput";

export { CustomInput };
