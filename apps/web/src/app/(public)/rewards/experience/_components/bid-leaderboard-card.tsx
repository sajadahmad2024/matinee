"use client";

import { format } from "date-fns";
import { Trophy } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

import type { ExperienceReward } from "../../constants";

interface BidLeaderboardCardProps {
  experience: ExperienceReward;
  ended: boolean;
}

// Read-only. The customer app shows the top/leading bid points (not ranks-for-everyone) —
// mirror that framing here.
export function BidLeaderboardCard({ experience: e, ended }: BidLeaderboardCardProps) {
  const winningBids = ended ? e.leaderboard.slice(0, e.winners) : [];

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Trophy className="text-warning h-4 w-4" /> {ended ? "Final bids" : "Live bid leaderboard"}
        </CardTitle>
        <CardDescription>
          Top bids only — {ended ? "winners highlighted" : "real-time in production"}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {e.leaderboard.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">No bids yet.</p>
        ) : (
          <div className="divide-border/40 divide-y">
            {e.leaderboard.map((b, i) => {
              const isWinner = winningBids.some((w) => w.user === b.user);
              return (
                <div
                  key={`${b.user}-${b.bid}`}
                  className={cn(
                    "flex items-center gap-3 py-2.5",
                    isWinner && "bg-warning/5 -mx-2 rounded-md px-2",
                  )}>
                  <span className="text-muted-foreground w-6 text-center text-xs tabular-nums">
                    {i + 1}
                  </span>
                  <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                    {b.user}
                    {isWinner && (
                      <span className="bg-warning/15 text-warning ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold">
                        🏆 Winner
                      </span>
                    )}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {format(new Date(b.at), "MMM d, HH:mm")}
                  </span>
                  <span className="text-foreground text-sm font-semibold tabular-nums">
                    {b.bid.toLocaleString()} pts
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
