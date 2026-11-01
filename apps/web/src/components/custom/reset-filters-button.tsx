"use client";

import { RotateCcw } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { CustomButton } from "./custom-button";

interface ResetFiltersButtonProps {
  onReset: () => void;
  className?: string;
}

/**
 * "Reset" for a list toolbar: clears its search and filters. Render it only while something is
 * applied. Same outline look as the toolbar's refresh button, with its own hover fill.
 */
export function ResetFiltersButton({ onReset, className }: ResetFiltersButtonProps) {
  return (
    <CustomButton
      variant="outline"
      onClick={onReset}
      className={cn("hover:bg-muted hover:text-foreground dark:hover:bg-muted gap-1.5", className)}>
      <RotateCcw className="h-4 w-4" /> Reset
    </CustomButton>
  );
}
