"use client";

import { Users } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { REGION_ANALYTICS, type MonetizationData } from "../constants";

// Signup → first session → engaged → subscribed, with drop-off at each step. Region-scoped
// via the `funnel` prop; defaults to the global baseline (ties to total users 248,500,
// active 198,000, and total subscribers 8,923 shown elsewhere on the dashboard).
const STEP_COLORS = [
  "from-primary to-primary",
  "from-primary to-accent",
  "from-accent to-accent",
  "from-success to-success",
];

interface ConversionFunnelChartProps {
  funnel?: MonetizationData["funnel"];
}

export function ConversionFunnelChart({
  funnel = REGION_ANALYTICS["global"]!.monetization.funnel,
}: ConversionFunnelChartProps) {
  const steps = [
    { label: "Signups", value: funnel.signups, color: STEP_COLORS[0]! },
    { label: "First session", value: funnel.firstSession, color: STEP_COLORS[1]! },
    { label: "Engaged user", value: funnel.engaged, color: STEP_COLORS[2]! },
    { label: "Subscribed", value: funnel.subscribed, color: STEP_COLORS[3]! },
  ];
  const REFERRED = funnel.referred; // referral-attributed signups (slice of the funnel top)
  const top = steps[0]!.value;
  const referredPct = Math.round((REFERRED / top) * 100);
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

            {/* Referrals — nested breakdown under Signups */}
            {i === 0 && (
              <div className="mt-1.5 ml-4 border-l border-dashed border-border/60 pl-3">
                <div className="mb-0.5 flex items-center justify-between text-xs">
                  <span className="text-foreground-secondary flex items-center gap-1">
                    <Users className="text-featured h-3 w-3" /> via Referral
                  </span>
                  <span className="text-muted-foreground tabular-nums">
                    {REFERRED.toLocaleString()} · {referredPct}% of signups
                  </span>
                </div>
                <div className="bg-muted/30 h-4 overflow-hidden rounded-md">
                  <div
                    className="from-featured to-accent h-full rounded-md bg-gradient-to-r"
                    style={{ width: `${referredPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <p className="text-muted-foreground pt-1 text-[11px]">
        Biggest drop-off: engaged → subscribed. Overall signup→subscriber{" "}
        {Math.round((steps[3]!.value / top) * 100)}% · {referredPct}% of signups via referral.
      </p>
    </div>
  );
}
