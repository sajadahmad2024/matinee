import { Suspense } from "react";

import type { Metadata } from "next";

import { Skeleton } from "@/components/ui/skeleton";

import { PageHeader } from "@/components/custom/page-header";

import { GAME_ROUTES } from "../_libs/game-config";
import { LeaderboardsTabs } from "./_components/leaderboards-tabs";

export const metadata: Metadata = {
  title: "Leaderboards",
  description: "Top games by competition health, and the platform-wide top players.",
};

export default function LeaderboardsPage() {
  return (
    <div className="animate-fade-in space-y-6">
      <PageHeader
        title="Leaderboards"
        subtitle="Top games by competition health, and the platform-wide top players."
        backHref={GAME_ROUTES.LIST}
        backLabel="Back to Game Management"
      />
      <Suspense fallback={<Skeleton className="bg-muted/20 h-[400px] w-full rounded-xl" />}>
        <LeaderboardsTabs />
      </Suspense>
    </div>
  );
}
