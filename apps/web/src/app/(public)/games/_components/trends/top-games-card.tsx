import { Play } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

import { AnalyticsCardHeader } from "@/components/custom/analytics-card-header";
import { GlassCard } from "@/components/custom/glass-card";

import type { ProposedGamesTrendsDto } from "../../_libs/game-types";

/** The five games with the highest participation. */
export function TopGamesCard({ games }: { games: ProposedGamesTrendsDto["topGames"] }) {
  return (
    <GlassCard>
      <AnalyticsCardHeader
        title="Top 5 Games"
        description="Highest game participation"
        icon={Play}
        iconColor="text-accent"
      />
      <CardContent>
        <div className="space-y-3">
          {games?.map((game, index) => (
            <div
              key={game.title}
              className="border-border/30 flex items-center justify-between border-b py-2 last:border-0">
              <div className="flex items-center gap-3">
                <span className="text-muted-foreground w-4 font-mono text-xs">#{index + 1}</span>
                <span className="text-foreground max-w-[240px] truncate text-sm">{game.title}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {game.participationPct}%
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </GlassCard>
  );
}
