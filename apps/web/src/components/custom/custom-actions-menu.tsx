"use client";

import * as React from "react";

import { type LucideIcon, MoreHorizontal } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";

export interface CustomAction {
  label: React.ReactNode;
  icon?: LucideIcon;
  onClick: () => void;
  /** `destructive` (red) for delete / revoke, `success` (green) for enable / restore. */
  tone?: "default" | "destructive" | "success";
  /** Leave the item out — for actions that depend on the row's state. */
  hidden?: boolean;
  disabled?: boolean;
  /** Draw a divider above this item (e.g. before Delete). */
  separatorBefore?: boolean;
}

export interface CustomActionsMenuProps {
  actions: CustomAction[];
  /** Accessible name of the ⋯ trigger, e.g. "Actions for Seoul Studios". */
  label: string;
  /** Spinner on the trigger while one of the actions is running. */
  isLoading?: boolean;
  align?: "start" | "center" | "end";
  contentClassName?: string;
}

const TONE_CLASSES = {
  default: { item: "", icon: "" },
  destructive: {
    item: "text-destructive focus:bg-destructive/10 focus:text-destructive",
    icon: "text-destructive",
  },
  success: { item: "text-success focus:bg-success/10 focus:text-success", icon: "text-success" },
} as const;

/**
 * Row "⋯" menu driven by an `actions` list, so tables pass data instead of repeating the
 * DropdownMenu markup. Hidden actions are dropped; a separator is never drawn first.
 */
export function CustomActionsMenu({
  actions,
  label,
  isLoading,
  align = "end",
  contentClassName,
}: CustomActionsMenuProps) {
  const visible = actions.filter((action) => !action.hidden);
  if (visible.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CustomButton
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={label}
          isLoading={isLoading}>
          <MoreHorizontal className="h-4 w-4" />
        </CustomButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align={align}
        className={cn(
          "border-border bg-card w-44 **:[[role=menuitem]]:cursor-pointer",
          contentClassName,
        )}>
        {visible.map(
          (
            { label: itemLabel, icon: Icon, onClick, tone = "default", disabled, separatorBefore },
            index,
          ) => (
            <React.Fragment key={index}>
              {separatorBefore && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                className={TONE_CLASSES[tone].item}
                disabled={disabled}
                onClick={onClick}>
                {Icon && <Icon className={cn("mr-2 h-4 w-4", TONE_CLASSES[tone].icon)} />}
                {itemLabel}
              </DropdownMenuItem>
            </React.Fragment>
          ),
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
