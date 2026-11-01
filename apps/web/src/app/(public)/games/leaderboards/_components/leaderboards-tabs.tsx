"use client";

import { useSearchParams } from "next/navigation";

import { useTabParam } from "@/app/_libs/use-tab-param";
import { CustomTabs } from "@/components/custom/custom-tabs";

import type { LeaderboardSubtab } from "../../_libs/game-config";
import { LEADERBOARD_TABS } from "../_libs/leaderboard-config";
import { TopGamesTab } from "./top-games-tab";
import { TopPlayersTab } from "./top-players-tab";

/** Top Games | Top Players, kept in `?subtab=` (the master page links straight to each). */
export function LeaderboardsTabs() {
  const [subtabParam, setSubtab] = useTabParam("instances", "subtab");
  const subtab: LeaderboardSubtab = subtabParam === "hall-of-fame" ? "hall-of-fame" : "instances";
  const format = useSearchParams().get("format") ?? "all";

  return (
    <div className="space-y-8">
      <CustomTabs
        items={LEADERBOARD_TABS}
        value={subtab}
        onValueChange={setSubtab}
        className="bg-muted/30 h-9"
      />
      {subtab === "instances" ? <TopGamesTab format={format} /> : <TopPlayersTab />}
    </div>
  );
}
