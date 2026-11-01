import type { Metadata } from "next";

import { GAME_FORMATS, parseGameRegion } from "../../_libs/game-config";
import { FormatPageShell } from "../../_shared/format-page-shell";
import { PredictionSettings } from "./_components/prediction-settings";

export const metadata: Metadata = {
  title: "Predictive",
  description: "Prediction policy, predictions and analytics.",
};

interface PredictivePageProps {
  searchParams: Promise<{ region?: string }>;
}

export default async function PredictivePage({ searchParams }: PredictivePageProps) {
  const { region } = await searchParams;

  return (
    <FormatPageShell
      format={GAME_FORMATS.predictive}
      region={parseGameRegion(region)}
      settings={<PredictionSettings />}
      headerActions={false}
    />
  );
}
