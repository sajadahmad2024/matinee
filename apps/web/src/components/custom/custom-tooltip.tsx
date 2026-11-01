"use client";

import * as React from "react";

import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { cn } from "@/app/_libs/utils/cn";

/**
 * Tooltip with the app's glass styling, so call sites pass only content and placement.
 * `disabled` renders the trigger alone — e.g. sidebar labels that only need a tooltip while
 * the sidebar is collapsed.
 */
export interface CustomTooltipProps {
  content: React.ReactNode;
  /** A single element; it becomes the trigger (`asChild`). */
  children: React.ReactElement;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  sideOffset?: number;
  delayDuration?: number;
  showArrow?: boolean;
  disabled?: boolean;
  /** Classes for the tooltip panel. */
  className?: string;
}

export function CustomTooltip({
  content,
  children,
  side = "top",
  align = "center",
  sideOffset = 4,
  delayDuration = 0,
  showArrow = false,
  disabled = false,
  className,
}: CustomTooltipProps) {
  if (disabled) return children;

  return (
    <Tooltip delayDuration={delayDuration}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent
        side={side}
        align={align}
        sideOffset={sideOffset}
        showArrow={showArrow}
        className={cn(
          "bg-card/95 text-card-foreground border-border/50 rounded-lg border shadow-xl backdrop-blur-xl",
          className,
        )}>
        {content}
      </TooltipContent>
    </Tooltip>
  );
}
