import type { Metadata } from "next";

import { GAME_FORMATS, parseGameRegion } from "../../_libs/game-config";
import { FormatPageShell } from "../../_shared/format-page-shell";
import { SharedContentSettings } from "./_components/shared-content-settings";

export const metadata: Metadata = {
  title: "Shared Content",
  description: "Sharing rewards, daily cap, app widget and analytics.",
};

interface SharedContentPageProps {
  searchParams: Promise<{ region?: string }>;
}

export default async function SharedContentPage({ searchParams }: SharedContentPageProps) {
  const { region } = await searchParams;

  return (
    <FormatPageShell
      format={GAME_FORMATS["shared-content"]}
      region={parseGameRegion(region)}
      settings={<SharedContentSettings />}
    />
  );
}
