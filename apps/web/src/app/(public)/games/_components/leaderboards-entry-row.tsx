import Link from "next/link";

import { Gamepad2, Trophy, Users } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GAME_ROUTES } from "../_libs/game-config";

/**
 * Leaderboards get their own row above the analytics — the client reads them as a destination of
 * their own, not as one more header button.
 */
export function LeaderboardsEntryRow() {
  return (
    <section className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <span className="bg-warning/10 flex h-9 w-9 items-center justify-center rounded-lg">
          <Trophy className="text-warning h-5 w-5" />
        </span>
        <div>
          <p className="text-foreground text-sm font-semibold">Leaderboards</p>
          <p className="text-muted-foreground text-xs">
            Which games are pulling players, and who is on top across the platform
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" className="gap-2">
          <Link href={GAME_ROUTES.leaderboards("instances")}>
            <Gamepad2 className="h-4 w-4" />
            Top Games
          </Link>
        </Button>
        <Button asChild variant="outline" className="gap-2">
          <Link href={GAME_ROUTES.leaderboards("hall-of-fame")}>
            <Users className="h-4 w-4" />
            Top Players
          </Link>
        </Button>
      </div>
    </section>
  );
}
