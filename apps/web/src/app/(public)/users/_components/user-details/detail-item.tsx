"use client";

import { cn } from "@/app/_libs/utils/cn";

interface DetailItemProps {
  label: string;
  value: React.ReactNode;
  className?: string;
  valueClassName?: string;
}

export function DetailItem({ label, value, className, valueClassName }: DetailItemProps) {
  return (
    <div className={cn("flex justify-between items-center", className)}>
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn("text-foreground text-sm", valueClassName)}>{value}</span>
    </div>
  );
}
