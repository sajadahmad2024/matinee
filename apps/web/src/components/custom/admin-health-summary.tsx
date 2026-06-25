import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

/**
 * Consistent "status at a glance" strip used at the top of every admin page.
 * Turns raw numbers into actionable health indicators (tone + trend + short insight)
 * so admins instantly see what's healthy vs what needs attention.
 */
export type HealthTone = "good" | "warning" | "critical" | "neutral";

export interface HealthStat {
  label: string;
  value: string;
  insight?: string;
  trend?: "up" | "down";
  tone: HealthTone;
  icon: LucideIcon;
}

const TONE_TEXT: Record<HealthTone, string> = {
  good: "text-success",
  warning: "text-warning",
  critical: "text-destructive",
  neutral: "text-accent",
};

export function AdminHealthSummary({
  stats,
  columns = 4,
}: {
  stats: HealthStat[];
  columns?: 3 | 4;
}) {
  const grid = columns === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4";
  return (
    <div className={`grid grid-cols-2 gap-4 ${grid}`}>
      {stats.map((s) => {
        const Icon = s.icon;
        return (
          <Card key={s.label}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">{s.label}</span>
                <Icon className={`h-4 w-4 ${TONE_TEXT[s.tone]}`} />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">{s.value}</p>
              {s.insight && (
                <div className={`mt-1 flex items-center gap-1 text-xs ${TONE_TEXT[s.tone]}`}>
                  {s.trend === "up" && <TrendingUp className="h-3 w-3" />}
                  {s.trend === "down" && <TrendingDown className="h-3 w-3" />}
                  <span>{s.insight}</span>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
