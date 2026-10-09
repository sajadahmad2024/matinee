import * as React from "react";

import { Card } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

export function GlassCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={cn("border-border/50 bg-card/50 backdrop-blur-sm transition-colors", className)}
      {...props}
    />
  );
}
