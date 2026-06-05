"use client";

import type { LucideIcon } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";
import { Card, CardContent } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: string | number;
  subtitle?: React.ReactNode;
  icon: LucideIcon;
  iconClassName?: string;
  iconContainerClassName?: string;
  className?: string;
  onClick?: () => void;
}

export function StatsCard({
  label,
  value,
  subtitle,
  icon: Icon,
  iconClassName,
  iconContainerClassName,
  className,
  onClick,
}: StatsCardProps) {
  return (
    <Card
      className={cn(
        "border-border/50 bg-card/50 backdrop-blur-sm transition-all",
        onClick && "cursor-pointer hover:bg-accent/5",
        className,
      )}
      onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {label}
            </p>
            <p className="text-foreground text-2xl font-bold">{value}</p>
            {subtitle && <div className="text-xs">{subtitle}</div>}
          </div>
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10",
              iconContainerClassName,
            )}>
            <Icon className={cn("h-5 w-5 text-accent", iconClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
