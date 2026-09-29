import type { Route } from "next";
import Link from "next/link";

import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

import { StatTile } from "@/components/custom/stat-tile";

import { AdList } from "./_components/ad-list";
import { FeedRulesDialog } from "./_components/feed-rules-dialog";
import { fmtNum, MOCK_ADS } from "./constants";

export default function AdsManagementPage() {
  const live = MOCK_ADS.filter((a) => a.status === "live").length;
  const delivered = MOCK_ADS.filter((a) => a.stats.impressions > 0);
  const impressions = delivered.reduce((s, a) => s + a.stats.impressions, 0);
  const completion = impressions
    ? delivered.reduce((s, a) => s + a.stats.completionRate * a.stats.impressions, 0) / impressions
    : 0;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-gaming text-foreground text-3xl font-bold">Ads Management</h1>
          <p className="text-foreground-secondary mt-1">Video ads shown between reels</p>
        </div>
        <div className="flex items-center gap-2">
          <FeedRulesDialog />
          <Button asChild className="gap-2">
            <Link href={"/ads/new" as Route}>
              <Plus className="h-4 w-4" /> New Ad
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatTile label="Live ads" value={live} description="Ads showing in the feed right now" />
        <StatTile label="Total impressions" value={fmtNum(impressions)} description="Times ads were shown to users" />
        <StatTile label="Avg completion" value={`${completion.toFixed(0)}%`} description="Share of plays watched to the end" />
      </div>

      <AdList initialAds={MOCK_ADS} />
    </div>
  );
}
