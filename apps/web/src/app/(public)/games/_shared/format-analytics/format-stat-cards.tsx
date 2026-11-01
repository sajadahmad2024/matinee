import { Coins, Play, TrendingUp, Users } from "lucide-react";

import { CardContent } from "@/components/ui/card";

import { formatCount } from "@/app/_libs/utils/format";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedFormatAnalyticsDto } from "../../_libs/game-types";

type FormatStats = Pick<
  ProposedFormatAnalyticsDto,
  "totalPlays" | "uniquePlayers" | "pointsMinted" | "completionRatePct"
>;

/** The four headline figures at the top of a format's Analytics tab. */
export function FormatStatCards({ stats }: { stats: FormatStats }) {
  const cards = [
    {
      label: "Total Plays",
      value: formatCount(stats.totalPlays),
      icon: Play,
      wrap: "bg-accent/10",
      cls: "text-accent",
    },
    {
      label: "Unique Players",
      value: formatCount(stats.uniquePlayers),
      icon: Users,
      wrap: "bg-success/10",
      cls: "text-success",
    },
    {
      label: "Points Minted",
      value: formatCount(stats.pointsMinted),
      icon: Coins,
      wrap: "bg-warning/10",
      cls: "text-warning",
    },
    {
      label: "Completion Rate",
      value: `${stats.completionRatePct.toFixed(1)}%`,
      icon: TrendingUp,
      wrap: "bg-primary/10",
      cls: "text-primary",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards?.map(({ label, value, icon: Icon, wrap, cls }) => (
        <GlassCard key={label}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`${wrap} rounded-lg p-2`}>
                <Icon className={`${cls} h-5 w-5`} />
              </div>
              <div>
                <p className="text-muted-foreground text-xs">{label}</p>
                <p className="font-gaming text-foreground text-2xl font-bold">{value}</p>
              </div>
            </div>
          </CardContent>
        </GlassCard>
      ))}
    </div>
  );
}
