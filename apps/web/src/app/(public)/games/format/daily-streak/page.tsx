import type { Metadata } from "next";

import { GAME_FORMATS, parseGameRegion } from "../../_libs/game-config";
import { FormatPageShell } from "../../_shared/format-page-shell";
import { StreakSettings } from "./_components/streak-settings";

export const metadata: Metadata = {
  title: "Daily Streak",
  description: "Daily Streak rules, milestone bonuses, app widget and analytics.",
};

interface DailyStreakPageProps {
  searchParams: Promise<{ region?: string }>;
}

export default async function DailyStreakPage({ searchParams }: DailyStreakPageProps) {
  const { region } = await searchParams;

  return (
    <FormatPageShell
      format={GAME_FORMATS["daily-streak"]}
      region={parseGameRegion(region)}
      settings={<StreakSettings />}
    />
  );
}
