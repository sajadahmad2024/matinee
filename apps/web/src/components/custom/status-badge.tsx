"use client";

import * as React from "react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/app/_libs/utils/cn";

export interface StatusBadgeProps {
  /** Any status word (case-insensitive), e.g. `active`, `invited`, `disabled`. Shown as-is. */
  status?: string | null;
  /** Display text when it differs from the status word (e.g. `active` shown as "Live"). */
  label?: React.ReactNode;
  className?: string;
}

/** Colour families shared by every status badge in the app. */
const TONES = {
  success: "bg-success/20 border-success/30 text-success",
  warning: "bg-warning/20 border-warning/30 text-warning",
  danger: "bg-destructive/20 border-destructive/30 text-destructive",
  info: "bg-primary/20 border-primary/30 text-primary",
  neutral: "bg-muted border-border text-muted-foreground",
} as const;

type Tone = keyof typeof TONES;

/**
 * Status word → colour. Add new words here (not per screen) so the same status always looks the
 * same everywhere. Unknown words fall back to `neutral`.
 */
const STATUS_TONES: Record<string, Tone> = {
  active: "success",
  approved: "success",
  completed: "success",
  open: "success",
  locked: "warning",
  paying: "warning",
  resolved: "neutral",
  archived: "neutral",
  cancelled: "danger",
  invited: "warning",
  pending: "warning",
  suspended: "warning",
  paused: "warning",
  scheduled: "info",
  disabled: "neutral",
  draft: "neutral",
  ended: "neutral",
  banned: "danger",
  rejected: "danger",
  failed: "danger",
};

/** Outlined, colour-coded status pill. Renders "-" when there is no status. */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  if (!status) return <span className="text-muted-foreground">-</span>;

  const tone = STATUS_TONES[status.toLowerCase()] ?? "neutral";

  return (
    <Badge variant="outline" className={cn("capitalize", TONES[tone], className)}>
      {label ?? status}
    </Badge>
  );
}
