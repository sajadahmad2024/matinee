import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent } from "@/components/ui/card";

import { GlassCard } from "@/components/custom/glass-card";

import type { GameLeaderboardPlayer as LeaderboardPlayer } from "../../_libs/game-types";
import { RankIcon } from "./rank-icon";

/** One of the top three players; the winner's card is raised. */
export function PodiumCard({ player, isWinner }: { player: LeaderboardPlayer; isWinner: boolean }) {
  const name = player.username ?? player.firstName ?? player.userId;

  return (
    <GlassCard className={isWinner ? "ring-accent/30 scale-105 ring-2" : "text-center"}>
      <CardContent className="pt-6 pb-4 text-center">
        <div className="relative mb-3 inline-block">
          <Avatar className="border-border h-16 w-16 border-2">
            <AvatarImage src={player.avatarUrl ?? undefined} />
            <AvatarFallback className="bg-accent/10 text-accent font-bold">
              {name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -top-2 -right-2">
            <RankIcon rank={player.rank} />
          </div>
        </div>
        <h4 className="text-foreground mb-1 font-semibold">{name}</h4>
        <code className="text-muted-foreground font-mono text-xs">{player.userId}</code>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div>
            <p className="text-accent font-gaming text-lg font-bold">{player.totalWins}</p>
            <p className="text-muted-foreground text-xs">Wins</p>
          </div>
          <div>
            <p className="text-warning font-gaming text-lg font-bold">
              {(player.pointsBalance / 1000).toFixed(1)}K
            </p>
            <p className="text-muted-foreground text-xs">Points</p>
          </div>
        </div>
      </CardContent>
    </GlassCard>
  );
}
