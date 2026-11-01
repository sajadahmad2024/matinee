"use client";

import { Star } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { type Column, DataTable } from "@/components/custom/data-table";
import { GlassCard } from "@/components/custom/glass-card";

import type { GameLeaderboardPlayer as LeaderboardPlayer } from "../../_libs/game-types";
import { useLeaderboardPlayers } from "../../_libs/use-games";
import { PLAYER_FORMAT_FILTERS } from "../_libs/leaderboard-config";
import { FormatFilter } from "./format-filter";
import { PodiumCard } from "./podium-card";
import { RankIcon } from "./rank-icon";

const nameOf = (p: LeaderboardPlayer) => p.username ?? p.firstName ?? p.userId;

const COLUMNS: Column<LeaderboardPlayer>[] = [
  {
    header: "Rank",
    headerClassName: "w-[80px]",
    cell: (p) => (
      <div className="flex items-center justify-center">
        <RankIcon rank={p.rank} />
      </div>
    ),
  },
  {
    header: "User",
    cell: (p) => (
      <div className="flex items-center gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src={p.avatarUrl ?? undefined} />
          <AvatarFallback className="bg-accent/10 text-accent text-xs">
            {nameOf(p).slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-foreground font-medium">{nameOf(p)}</p>
          <code className="text-muted-foreground font-mono text-xs">{p.userId}</code>
        </div>
      </div>
    ),
  },
  {
    header: "Total Wins",
    headerClassName: "text-right",
    className: "text-foreground text-right font-mono",
    cell: (p) => p.totalWins,
  },
  {
    header: "Points",
    headerClassName: "text-right",
    className: "text-warning text-right font-mono",
    cell: (p) => p.pointsBalance.toLocaleString(),
  },
  {
    header: "Games Played",
    headerClassName: "text-right",
    className: "text-muted-foreground text-right font-mono",
    cell: (p) => p.gamesPlayed,
  },
];

/** The platform-wide top players: the podium, then the full ranking. */
export function TopPlayersTab() {
  const { playersQuery, players } = useLeaderboardPlayers({ limit: 50 });
  const [first, second, third] = players;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Top Players — All Formats</h3>
          <p className="text-muted-foreground text-sm">Top users across all games</p>
        </div>
        <FormatFilter options={PLAYER_FORMAT_FILTERS} />
      </div>

      {first && second && third && (
        <div className="mb-6 grid grid-cols-3 gap-4">
          <PodiumCard player={second} isWinner={false} />
          <PodiumCard player={first} isWinner />
          <PodiumCard player={third} isWinner={false} />
        </div>
      )}

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Star className="text-warning h-4 w-4" />
            Complete Rankings
          </CardTitle>
          <p className="text-muted-foreground text-xs">
            Ranked by current points balance — spending points moves you down.
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={COLUMNS}
            data={players}
            rowIdKey="userId"
            isLoading={playersQuery.isPending}
            isError={playersQuery.isError}
            onRetry={() => void playersQuery.refetch()}
            isRetrying={playersQuery.isFetching}
            classNames={{
              container: "bg-transparent",
              header: "bg-transparent",
              head: "bg-transparent",
              cell: "p-2",
            }}
            emptyState={<span className="text-muted-foreground">No ranked players yet.</span>}
          />
        </CardContent>
      </GlassCard>
    </div>
  );
}
