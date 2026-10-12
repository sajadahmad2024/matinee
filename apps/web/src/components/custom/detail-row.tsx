import * as React from "react";

import { cn } from "@/app/_libs/utils/cn";

export interface DetailRowProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** Label/value row for read-only detail pages. Render inside a `<dl>`. */
export function DetailRow({ label, children, className }: DetailRowProps) {
  return (
    <div
      className={cn(
        "border-border/30 grid grid-cols-[10rem_1fr] gap-3 border-b py-2 text-sm last:border-b-0",
        className,
      )}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="text-foreground min-w-0 break-words">{children}</dd>
    </div>
  );
}
