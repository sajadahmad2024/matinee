import * as React from "react";

import type { LucideIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";
import { GlassCard } from "@/components/custom/glass-card";

import { EMPTY } from "../../../_shared/content-format";

export interface DetailsCardProps {
  title: string;
  icon?: LucideIcon;
  /** Shown beside the title (e.g. a status chip). */
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

/** A details section: a glass card with a title over a list of `DetailRow`s. */
export const DetailsCard: React.FC<DetailsCardProps> = ({
  title,
  icon: Icon,
  action,
  children,
  className,
}) => (
  <GlassCard className={className}>
    <CardHeader className="flex flex-row items-center justify-between gap-2">
      <CardTitle className="text-foreground flex items-center gap-2 text-base">
        {Icon && <Icon className="text-primary h-4 w-4" />}
        {title}
      </CardTitle>
      {action}
    </CardHeader>
    <CardContent>
      <dl>{children}</dl>
    </CardContent>
  </GlassCard>
);

DetailsCard.displayName = "DetailsCard";

export interface DetailChipsProps {
  items?: { key: string; label: React.ReactNode; highlight?: boolean }[];
  className?: string;
}

/** Wrapped chips (genres, tags, regions); the empty dash when there are none. */
export const DetailChips: React.FC<DetailChipsProps> = ({ items, className }) => {
  if (!items?.length) return <>{EMPTY}</>;
  return (
    <div className={cn("flex flex-wrap gap-1.5", className)}>
      {items.map((item) => (
        <Badge
          key={item.key}
          variant="secondary"
          className={cn(item.highlight && "bg-primary/15 text-primary")}>
          {item.label}
        </Badge>
      ))}
    </div>
  );
};

DetailChips.displayName = "DetailChips";
