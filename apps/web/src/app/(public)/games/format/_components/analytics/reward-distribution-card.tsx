"use client";

import { Trophy } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsHeader } from "../../../_components/analytics-header";
import { GlassCard } from "../../../_components/glass-card";

const rewardDistribution = [
  { tier: "1st Place", count: 245, color: "hsl(var(--warning))" },
  { tier: "2nd Place", count: 245, color: "hsl(var(--accent))" },
  { tier: "3rd Place", count: 245, color: "hsl(var(--success))" },
  { tier: "Top 10", count: 1715, color: "hsl(var(--primary))" },
  { tier: "Participation", count: 8540, color: "hsl(var(--muted))" },
];

export function RewardDistributionCard() {
  return (
    <GlassCard>
      <AnalyticsHeader title="Reward Distribution" icon={Trophy} iconColor="text-warning" />
      <CardContent>
        <div className="space-y-3">
          {rewardDistribution.map((tier) => (
            <div key={tier.tier} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: tier.color }} />
                <span className="text-foreground-secondary text-sm">{tier.tier}</span>
              </div>
              <span className="text-foreground text-sm font-medium">
                {tier.count.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}
