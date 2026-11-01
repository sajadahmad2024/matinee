"use client";

import { LuRotateCw } from "react-icons/lu";

import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";

export interface CustomRetryStateProps {
  title?: string;
  description?: string;
  onRetry: () => void;
  /** Spinner on the button while the retry request runs. */
  isRetrying?: boolean;
  className?: string;
}

/** Error state with a Retry button — for a list or section whose request failed. */
export function CustomRetryState({
  title = "Something went wrong",
  description = "Please try again.",
  onRetry,
  isRetrying,
  className,
}: CustomRetryStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-4 px-6 py-10 text-center",
        className,
      )}>
      <p className="text-foreground text-base font-semibold">{title}</p>
      <p className="text-muted-foreground max-w-md text-sm">{description}</p>
      <CustomButton
        onClick={onRetry}
        isLoading={isRetrying}
        loadingText="Retrying..."
        leftIcon={<LuRotateCw className="size-4" />}>
        Retry
      </CustomButton>
    </div>
  );
}
