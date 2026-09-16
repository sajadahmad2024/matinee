"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { ArrowRight, ListChecks, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import { cn } from "@/app/_libs/utils/cn";

import type { RecommendedAction } from "./recommended-actions";

const DOT: Record<RecommendedAction["severity"], string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-accent",
};

interface FloatingRecommendedActionsProps {
  actions: RecommendedAction[];
  title?: string;
}

/**
 * Recommended Actions as a floating dock instead of a panel in the page flow — the
 * client wanted the list out of the way at the bottom, reachable from anywhere on the
 * page. Collapsed it is a pill with the open-action count; expanded it is the same
 * insight → action list, so the two presentations stay interchangeable.
 */
export function FloatingRecommendedActions({
  actions,
  title = "Recommended Actions",
}: FloatingRecommendedActionsProps) {
  const [open, setOpen] = useState(false);
  if (!actions.length) return null;

  const highest = actions.some((a) => a.severity === "high")
    ? "high"
    : actions.some((a) => a.severity === "medium")
      ? "medium"
      : "low";

  return (
    <div className="pointer-events-none fixed right-6 bottom-6 z-40 flex flex-col items-end gap-3 print:hidden">
      {open && (
        <div className="glass-card animate-fade-in border-border bg-card pointer-events-auto w-[min(26rem,calc(100vw-3rem))] rounded-xl border shadow-xl">
          <div className="border-border/50 flex items-center justify-between gap-2 border-b px-4 py-3">
            <p className="text-foreground flex items-center gap-2 text-sm font-semibold">
              <ListChecks className="text-accent h-4 w-4" /> {title}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 cursor-pointer"
              onClick={() => setOpen(false)}
              aria-label="Close recommended actions">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[60vh] space-y-2 overflow-auto p-3">
            {actions.map((a) => (
              <div key={a.title} className="border-border/40 rounded-lg border p-3">
                <div className="flex items-start gap-2.5">
                  <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", DOT[a.severity])} />
                  <div className="min-w-0 flex-1">
                    <p className="text-foreground text-sm font-medium">{a.title}</p>
                    <p className="text-muted-foreground text-xs">{a.detail}</p>
                    <ActionCta action={a} onNavigate={() => setOpen(false)} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "bg-primary text-primary-foreground hover:bg-primary/90 pointer-events-auto relative flex cursor-pointer items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg transition-all hover:scale-105",
        )}>
        <ListChecks className="h-5 w-5" />
        <span className="hidden sm:inline">{title}</span>
        <span className="bg-background/25 rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums">
          {actions.length}
        </span>
        {!open && (
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 h-3 w-3 animate-ping rounded-full opacity-70",
              DOT[highest],
            )}
          />
        )}
      </button>
    </div>
  );
}

function ActionCta({ action, onNavigate }: { action: RecommendedAction; onNavigate: () => void }) {
  const className = "mt-2 h-7 cursor-pointer gap-1 px-2 text-xs";
  if (action.href) {
    return (
      <Button asChild size="sm" variant="outline" className={className}>
        <Link href={action.href as Route} onClick={onNavigate}>
          {action.cta} <ArrowRight className="h-3 w-3" />
        </Link>
      </Button>
    );
  }
  return (
    <Button
      size="sm"
      variant="outline"
      className={className}
      onClick={
        action.onClick ?? (() => toast.info(`${action.cta}: routed to the backend-driven flow`))
      }>
      {action.cta} <ArrowRight className="h-3 w-3" />
    </Button>
  );
}
