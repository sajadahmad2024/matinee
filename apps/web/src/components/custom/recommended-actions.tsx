import { ArrowRight, ListChecks, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Consistent "insight → action" panel used across admin pages. Surfaces the
 * highest-priority tasks so admins can act without hunting through analytics.
 */
export type ActionSeverity = "high" | "medium" | "low";

export interface RecommendedAction {
  title: string;
  detail: string;
  severity: ActionSeverity;
  cta: string;
  icon?: LucideIcon;
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
        {actions.map((a) => {
          const Icon = a.icon;
          return (
            <div
              key={a.title}
              className="border-border/40 flex items-center justify-between gap-4 rounded-lg border p-3">
              <div className="flex items-start gap-3">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT[a.severity]}`} />
                <div>
                  <p className="text-foreground flex items-center gap-2 text-sm font-medium">
                    {Icon && <Icon className="text-muted-foreground h-3.5 w-3.5" />}
                    {a.title}
                  </p>
                  <p className="text-muted-foreground text-xs">{a.detail}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 cursor-pointer gap-1">
                {a.cta} <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
