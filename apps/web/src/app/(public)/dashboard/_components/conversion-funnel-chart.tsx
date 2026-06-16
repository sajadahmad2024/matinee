"use client";

import { cn } from "@/app/_libs/utils/cn";

// Signup → first session → engaged → subscribed (all-time, whole base): ties to total users
// 248,500, active 198,000, and total subscribers 8,923 shown elsewhere on the dashboard.
const steps = [
  { label: "Signups", value: 248500, color: "from-primary to-primary" },
  { label: "First session", value: 198000, color: "from-primary to-accent" },
  { label: "Engaged user", value: 120000, color: "from-accent to-accent" },
  { label: "Subscribed", value: 8923, color: "from-success to-success" },
];

export function ConversionFunnelChart() {
  const top = steps[0]!.value;
  return (
    <div className="space-y-2">
      {steps.map((s, i) => {
        const pctOfTop = Math.round((s.value / top) * 100);
        const prev = i === 0 ? s.value : steps[i - 1]!.value;
        const drop = i === 0 ? 0 : Math.round((1 - s.value / prev) * 100);
        return (
          <div key={s.label}>
            <div className="mb-0.5 flex items-center justify-between text-xs">
              <span className="text-foreground">{s.label}</span>
              <span className="text-muted-foreground tabular-nums">
                {s.value.toLocaleString()} · {pctOfTop}%
                {drop > 0 && <span className="text-destructive ml-1">−{drop}%</span>}
              </span>
            </div>
            <div className="bg-muted/30 h-6 overflow-hidden rounded-md">
              <div
                className={cn("h-full rounded-md bg-gradient-to-r", s.color)}
                style={{ width: `${pctOfTop}%` }}
              />
            </div>
          </div>
        );
      })}
      <p className="text-muted-foreground pt-1 text-[11px]">
        Biggest drop-off: engaged → subscribed. Overall signup→subscriber {Math.round((steps[3]!.value / top) * 100)}%.
      </p>
    </div>
  );
}
