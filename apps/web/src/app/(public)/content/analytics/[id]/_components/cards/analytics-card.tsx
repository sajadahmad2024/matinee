import type * as React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

interface AnalyticsCardProps {
  title: string;
  icon: React.ElementType;
  /** Title + icon colour, e.g. `text-success`. */
  tone: string;
  className?: string;
  contentClassName?: string;
  children: React.ReactNode;
}

/** The frame every card on the page shares: a coloured icon + title over the content. */
export function AnalyticsCard({
  title,
  icon: Icon,
  tone,
  className,
  contentClassName,
  children,
}: AnalyticsCardProps) {
  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardHeader>
        <CardTitle className={cn("flex items-center gap-2", tone)}>
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  );
}
