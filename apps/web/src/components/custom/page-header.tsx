import * as React from "react";

import type { Route } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

export interface PageHeaderProps {
  title: React.ReactNode;
  /** Line under the title (e.g. owner, dates). */
  subtitle?: React.ReactNode;
  /** Shows a back arrow linking here; sub-pages also get the smaller title. */
  backHref?: Route;
  backLabel?: string;
  /** Icon shown in a tinted box before the title (e.g. a game format's icon). */
  icon?: React.ElementType;
  /** Rendered next to the title (e.g. a `StatusBadge`). */
  titleAddon?: React.ReactNode;
  /** Right-aligned buttons; wraps under the title on small screens. */
  actions?: React.ReactNode;
  /** Extra content under the subtitle (e.g. a caption). */
  children?: React.ReactNode;
  className?: string;
}

/**
 * Page title row shared by list and detail screens: optional back link, title + addon,
 * subtitle and actions — so pages pass content instead of repeating the header markup.
 */
export function PageHeader({
  title,
  subtitle,
  backHref,
  backLabel = "Back",
  icon: Icon,
  titleAddon,
  actions,
  children,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className,
      )}>
      <div className="flex min-w-0 items-start gap-3">
        {backHref && (
          <Button asChild variant="ghost" size="icon" aria-label={backLabel} className="shrink-0">
            <Link href={backHref}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
        )}
        {Icon && (
          <div className="bg-accent/10 text-accent shrink-0 rounded-lg p-2">
            <Icon className="h-6 w-6" />
          </div>
        )}
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1
              className={cn(
                "font-gaming text-foreground font-bold",
                backHref ? "text-2xl" : "text-3xl",
              )}>
              {title}
            </h1>
            {titleAddon}
          </div>
          {subtitle && (
            <p
              className={cn(
                backHref ? "text-muted-foreground text-sm" : "text-foreground-secondary mt-1",
              )}>
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
