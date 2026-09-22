import { Suspense } from "react";

import type { Route } from "next";
import Link from "next/link";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

import { GlobalLeaderboards } from "../_components/global-leaderboards";

export default function LeaderboardsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={"/games" as Route}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="font-gaming text-foreground text-2xl font-bold">Leaderboards</h1>
          <p className="text-foreground-secondary text-sm">
            Top games by competition health, and the platform-wide top players.
          </p>
        </div>
      </div>

      <Suspense
        fallback={<div className="bg-muted/20 h-[400px] w-full animate-pulse rounded-xl" />}>
        <GlobalLeaderboards />
      </Suspense>
    </div>
  );
}
