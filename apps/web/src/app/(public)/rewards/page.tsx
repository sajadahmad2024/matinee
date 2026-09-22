import type { Route } from "next";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { MacroRegion } from "@/app/_libs/regions";

import { ExperiencesSection } from "./_components/experiences-section";
import { RewardsAnalytics } from "./_components/rewards-analytics";
import { UnlockContentSection } from "./_components/unlock-content-section";

export type RewardsSearchParams = {
  region?: string;
};

interface PageProps {
  searchParams: Promise<RewardsSearchParams>;
}

const REGION_CODES = new Set(["NA", "EU", "APAC", "LATAM", "MEA"]);

// Single scrollable master page: analytics → unlock content → experiences.
export default async function RewardsPage({ searchParams }: PageProps) {
  const { region: regionParam = "global" } = await searchParams;
  const region: "global" | MacroRegion = REGION_CODES.has(regionParam)
    ? (regionParam as MacroRegion)
    : "global";

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Rewards</h1>
          <p className="text-foreground-secondary mt-1">
            Points-gated content and bidding for experiences.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button asChild className="gap-2">
            <Link href={"/rewards/experience/new" as Route}>
              <Plus className="h-4 w-4" />
              New Experience
            </Link>
          </Button>
        </div>
      </div>

      {/* Master analytics — statistics only; the Regional Activity grid was taken out
          at the client's request. ?region= still scopes the page for deep links. */}
      <RewardsAnalytics region={region} />

      {/* Section 1 — Unlock Content (configured in Content Management; tracked here) */}
      <UnlockContentSection region={region} />

      {/* Section 2 — Bidding for Experiences */}
      <ExperiencesSection region={region} />
    </div>
  );
}
