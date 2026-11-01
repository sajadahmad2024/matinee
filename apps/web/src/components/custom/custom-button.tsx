import * as React from "react";

import { AiOutlineLoading3Quarters } from "react-icons/ai";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

/**
 * shadcn `Button` plus the behaviour every form/mutation button needs: a loading state and
 * optional icons. Variants and sizes are the shadcn ones, so it looks the same as `Button`.
 *
 * `asChild` is not supported — the spinner/icon wrappers need a real `<button>`; use the
 * plain `Button` for link-styled buttons.
 */
export interface CustomButtonProps extends Omit<React.ComponentProps<typeof Button>, "asChild"> {
  isLoading?: boolean;
  /** Shown next to the spinner while loading; without it only the spinner is shown. */
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const CustomButton = React.forwardRef<HTMLButtonElement, CustomButtonProps>(
  (
    {
      className,
      isLoading = false,
      loadingText,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref,
  ) => (
    <Button
      ref={ref}
      disabled={disabled || isLoading}
      aria-busy={isLoading}
      className={cn("cursor-pointer", className)}
      {...props}>
      {isLoading ? (
        <>
          <AiOutlineLoading3Quarters className="size-4 shrink-0 animate-spin" aria-hidden="true" />
          {loadingText}
        </>
      ) : (
        <>
          {leftIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {leftIcon}
            </span>
          )}
          {children}
          {rightIcon && (
            <span className="inline-flex shrink-0" aria-hidden="true">
              {rightIcon}
            </span>
          )}
        </>
      )}
    </Button>
  ),
);
CustomButton.displayName = "CustomButton";

export { CustomButton };
