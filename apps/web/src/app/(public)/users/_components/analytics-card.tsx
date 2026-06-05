"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

interface AnalyticsCardProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function AnalyticsCard({
  title,
  subtitle,
  icon: Icon,
  iconClassName,
  badge,
  children,
  className,
}: AnalyticsCardProps) {
  return (
    <Card className={cn("bg-card/50 border-border/50 backdrop-blur-sm", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              {Icon && <Icon className={cn("h-4 w-4", iconClassName)} />}
              {title}
            </CardTitle>
            {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
          </div>
          {badge}
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
