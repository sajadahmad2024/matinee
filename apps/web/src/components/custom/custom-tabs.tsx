"use client";

import * as React from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/app/_libs/utils/cn";

export interface CustomTabItem<T extends string = string> {
  value: T;
  label: React.ReactNode;
  icon?: React.ElementType;
  /** Badge after the label; hidden when `undefined` (e.g. while counts load). */
  count?: number;
  disabled?: boolean;
}

export interface CustomTabsProps<T extends string = string> {
  items: readonly CustomTabItem<T>[];
  value: T;
  onValueChange: (value: T) => void;
  className?: string;
  triggerClassName?: string;
  /** `pill`: compact segmented filter on a tinted track, counts as muted text. */
  variant?: "default" | "pill";
  "aria-label"?: string;
}

const VARIANTS = {
  default: {
    list: "",
    trigger: "gap-2",
    count: "bg-primary/20 text-primary rounded-full px-1.5 py-0.5 text-xs tabular-nums",
  },
  pill: {
    list: "bg-muted/30 gap-1 p-1",
    trigger:
      "text-muted-foreground hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground dark:data-[state=active]:bg-background dark:text-muted-foreground dark:data-[state=active]:text-foreground flex-none gap-0 border-0 px-3 py-1 font-normal transition-colors data-[state=active]:shadow-none",
    count: "text-muted-foreground ml-1.5 text-xs",
  },
} as const;

/**
 * Options-driven tab strip (no panels) for filters and URL-driven views. `onValueChange` is typed
 * to the item values, so callers keep their union types without casting.
 */
export function CustomTabs<T extends string = string>({
  items,
  value,
  onValueChange,
  className,
  triggerClassName,
  variant = "default",
  "aria-label": ariaLabel,
}: CustomTabsProps<T>) {
  const styles = VARIANTS[variant];
  const handleChange = (next: string) => {
    const item = items?.find((i) => i.value === next);
    if (item) onValueChange(item.value);
  };

  return (
    <Tabs value={value} onValueChange={handleChange}>
      <TabsList aria-label={ariaLabel} className={cn("h-auto flex-wrap", styles.list, className)}>
        {items?.map(({ value: itemValue, label, icon: Icon, count, disabled }) => (
          <TabsTrigger
            key={itemValue}
            value={itemValue}
            disabled={disabled}
            className={cn("cursor-pointer", styles.trigger, triggerClassName)}>
            {Icon && <Icon className="h-4 w-4" />}
            {label}
            {count !== undefined && <span className={styles.count}>{count}</span>}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
