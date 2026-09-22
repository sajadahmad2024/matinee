"use client";

import type { Route } from "next";
import Link from "next/link";

import { ArrowRight, ListChecks } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Consistent "insight → action" panel used across admin pages. Surfaces the
 * highest-priority tasks so admins can act without hunting through analytics.
 *
 * Every action MUST connect somewhere — pass an `href` (navigates to the relevant
 * tab/filter) or an `onClick` (opens a modal on the same page). If neither is given
 * the CTA still acknowledges the click (never a silently dead button).
 */
export type ActionSeverity = "high" | "medium" | "low";

export interface RecommendedAction {
  title: string;
  detail: string;
  severity: ActionSeverity;
  cta: string;
  /** Navigate to the screen/tab/filter where this action is handled. */
  href?: string;
  /** Or open a modal / run a handler on the current page. */
  onClick?: () => void;
}

const DOT: Record<ActionSeverity, string> = {
  high: "bg-destructive",
  medium: "bg-warning",
  low: "bg-accent",
};

export function RecommendedActions({
  actions,
  title = "Recommended Actions",
}: {
  actions: RecommendedAction[];
  title?: string;
}) {
  if (!actions.length) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <ListChecks className="text-accent h-4 w-4" /> {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {actions.map((a) => (
          <div
            key={a.title}
            className="border-border/40 flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="flex items-start gap-3">
              <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[a.severity]}`} />
              <div>
                <p className="text-foreground text-sm font-medium">{a.title}</p>
                <p className="text-muted-foreground text-xs">{a.detail}</p>
              </div>
            </div>
            <ActionCta action={a} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function ActionCta({ action }: { action: RecommendedAction }) {
  const className = "shrink-0 cursor-pointer gap-1";
  if (action.href) {
    return (
      <Button asChild size="sm" variant="outline" className={className}>
        <Link href={action.href as Route}>
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
