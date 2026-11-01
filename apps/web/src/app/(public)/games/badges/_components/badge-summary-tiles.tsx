"use client";

import { Award, CircleOff, type LucideIcon, Trophy, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useBadgeSummary } from "@/app/_libs/hooks/api/use-admin-games";

import type { BadgeSummaryDto } from "../../_libs/game-types";

const TONE = {
  accent: "text-accent",
  success: "text-success",
  muted: "text-muted-foreground",
} as const;

type TileKey = Exclude<keyof BadgeSummaryDto, "playersWithBadgePct">;

const TILES: ReadonlyArray<{
  key: TileKey;
  label: string;
  tone: keyof typeof TONE;
  icon: LucideIcon;
}> = [
  { key: "total", label: "Total badges", tone: "accent", icon: Award },
  { key: "active", label: "Active badges", tone: "success", icon: Trophy },
  { key: "playersWithBadge", label: "Players with a badge", tone: "accent", icon: Users },
  { key: "neverEarned", label: "Never earned", tone: "muted", icon: CircleOff },
];

/** Hint under a tile's number, from the rest of the summary. */
const tileHint = (key: TileKey, summary?: BadgeSummaryDto) => {
  if (!summary) return null;
  if (key === "playersWithBadge") return `${summary?.playersWithBadgePct ?? 0}% of players`;
  if (key === "neverEarned") return "Active, earned by nobody";
  return null;
};

/** Badge summary tiles, from `GET /admin/badges/summary`. A failed load shows "—". */
export function BadgeSummaryTiles() {
  const { badgeSummaryQuery, summary } = useBadgeSummary();

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {TILES?.map(({ key, label, tone, icon: Icon }) => {
        const hint = tileHint(key, summary);
        return (
          <Card key={key}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">{label}</span>
                <Icon className={`h-4 w-4 ${TONE[tone]}`} />
              </div>
              {badgeSummaryQuery?.isPending ? (
                <Skeleton className="bg-muted/30 mt-2 h-8 w-16" />
              ) : (
                <p className="text-foreground mt-2 text-2xl font-bold">
                  {summary ? (summary?.[key] ?? 0).toLocaleString() : "—"}
                </p>
              )}
              {hint && <p className="text-muted-foreground mt-1 text-xs">{hint}</p>}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
