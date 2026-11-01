import type { Metadata } from "next";

import { GAME_FORMATS, parseGameRegion } from "../../_libs/game-config";
import { FormatPageShell } from "../../_shared/format-page-shell";
import { QuestSettings } from "./_components/quest-settings";

export const metadata: Metadata = {
  title: "Weekly Quests",
  description: "Weekly Quests policy, quests and analytics.",
};

interface QuestsPageProps {
  searchParams: Promise<{ region?: string }>;
}

export default async function QuestsPage({ searchParams }: QuestsPageProps) {
  const { region } = await searchParams;

  return (
    <FormatPageShell
      format={GAME_FORMATS.quests}
      region={parseGameRegion(region)}
      settings={<QuestSettings />}
      headerActions={false}
    />
  );
}
