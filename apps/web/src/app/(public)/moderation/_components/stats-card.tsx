"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

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
        onClick && "hover:bg-accent/5 cursor-pointer",
        className,
      )}
      onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
              {label}
            </p>
            <p className="text-foreground text-2xl font-bold">{value}</p>
            {subtitle && <div className="text-xs">{subtitle}</div>}
          </div>
          <div
            className={cn(
              "bg-accent/10 flex h-10 w-10 items-center justify-center rounded-lg",
              iconContainerClassName,
            )}>
            <Icon className={cn("text-accent h-5 w-5", iconClassName)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
