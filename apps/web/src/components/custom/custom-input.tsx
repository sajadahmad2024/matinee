"use client";

import * as React from "react";

import { LuEye, LuEyeOff } from "react-icons/lu";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomInputProps extends React.ComponentProps<"input"> {
  error?: boolean;
}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className, type, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";

    const input = (
      <input
        type={isPassword ? (showPassword ? "text" : "password") : type}
        ref={ref}
        data-slot="input"
        className={cn(
          "bg-input/50 text-foreground placeholder:text-muted-foreground flex h-11 w-full rounded-lg border px-4 py-2 text-sm backdrop-blur-sm transition-all duration-200",
          "focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/50"
            : "border-border hover:border-border/80",
          isPassword && "pr-12",
          className,
        )}
        {...props}
      />
    );

    if (isPassword) {
      return (
        <div className="relative w-full">
          {input}
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="text-muted-foreground hover:text-foreground absolute top-1/2 right-3 z-50 -translate-y-1/2 cursor-pointer transition-colors"
          >
            {showPassword ? (
              <LuEyeOff className="pointer-events-none size-5" />
            ) : (
              <LuEye className="pointer-events-none size-5" />
            )}
          </button>
        </div>
      );
    }

    return input;
  },
);
CustomInput.displayName = "CustomInput";

export { CustomInput };
