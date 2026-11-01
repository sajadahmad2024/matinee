import { Trophy } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

// Tier dot colours, in tier order; anything past them uses the last.
const TIER_COLORS = [
  "hsl(var(--warning))",
  "hsl(var(--accent))",
  "hsl(var(--success))",
  "hsl(var(--primary))",
  "hsl(var(--muted))",
];

/** How many players landed in each reward tier. */
export function RewardDistributionCard({
  tiers,
}: {
  tiers: ProposedFormatAnalyticsDto["rewardTiers"];
}) {
  return (
    <GlassCard>
      <AnalyticsCardHeader title="Reward Distribution" icon={Trophy} iconColor="text-warning" />
      <CardContent>
        <div className="space-y-3">
          {tiers?.map((tier, i) => (
            <div key={tier.tier} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: TIER_COLORS[Math.min(i, TIER_COLORS.length - 1)] }}
                />
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
