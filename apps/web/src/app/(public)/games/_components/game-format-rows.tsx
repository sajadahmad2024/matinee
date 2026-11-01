"use client";

import { SectionHeading } from "@/components/custom/section-heading";

import { GAME_FORMAT_LIST } from "../_libs/game-config";
import { GameFormatRow } from "./game-format-row";

/**
 * The game-format control centre: one full-width row per fixed format, in the client's order,
 * each opening its settings. No stats on the rows: per-format numbers live on each format's
 * Analytics tab.
 */
export function GameFormatRows() {
  return (
    <div className="space-y-4">
      <SectionHeading
        title="Game Formats"
        subtitle="Fixed game types with dynamic, configurable rules — configure each via Settings · Analytics"
      />
      <div className="space-y-3">
        {GAME_FORMAT_LIST?.map((format) => (
          <GameFormatRow key={format.slug} format={format} />
        ))}
      </div>
    </div>
  );
}
