"use client";

import type { LucideIcon } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

interface DashboardCardProps {
  title: string;
  icon?: LucideIcon;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function DashboardCard({
  title,
  icon: Icon,
  iconColor,
  children,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn("bg-card border-border", className)}>
      <CardHeader className="pb-2">
        <CardTitle className="text-foreground flex items-center gap-2 text-2xl">
          {Icon && <Icon className={cn("h-5 w-5", iconColor)} />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
