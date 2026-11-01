import { Coins } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

// Whole-unit compact figures ("890K"), as the card has always shown them.
const compact = new Intl.NumberFormat("en", { notation: "compact" });

interface EconomyCardProps {
  pointsMinted: number;
  pointsSpent: number;
}

/** Points minted vs spent this period — points are the only currency (spec-05 §2.2). */
export function EconomyCard({ pointsMinted, pointsSpent }: EconomyCardProps) {
  return (
    <GlassCard>
      <AnalyticsCardHeader
        title="Economy"
        description="Both currencies this period"
        icon={Coins}
        iconColor="text-success"
      />
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Points Minted</span>
            <span className="text-success font-gaming text-2xl font-bold">
              {compact.format(pointsMinted)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">Points Spent</span>
            <span className="text-warning font-gaming text-2xl font-bold">
              {compact.format(pointsSpent)}
            </span>
          </div>
          <div className="border-border/30 border-t pt-2">
            <p className="text-muted-foreground text-[11px]">
              Points are the platform&apos;s only currency — spent on rewards and bidding.
            </p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
