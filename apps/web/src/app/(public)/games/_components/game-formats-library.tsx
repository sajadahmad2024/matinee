import type { Route } from "next";
import Link from "next/link";

import { ChevronRight, Gamepad2, Play, Plus, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { SectionHeading } from "@/components/custom/section-heading";

import { GAME_TYPES, type GameTypeDef, type GameTypeSlug } from "../_config/game-types";
import { GlassCard } from "./glass-card";

// Client's stated row order: Daily Streak, Weekly Quests, Shared Content, Predictive.
const ROW_ORDER: GameTypeSlug[] = ["daily-streak", "quests", "shared-content", "predictive"];

/**
 * The game-format control centre. Types are FIXED (backed by our DB); their rules are
 * configured per format via Settings / Analytics. Formats render as full-width rows
 * (content-management-style), one per format, in the client's order.
 */
export function GameFormatsLibrary() {
  const orderedTypes = ROW_ORDER.map((slug) => GAME_TYPES.find((t) => t.slug === slug)).filter(
    (t): t is GameTypeDef => Boolean(t),
  );

  return (
    <div className="space-y-4">
      <SectionHeading
        title="Game Formats"
        subtitle="Fixed game types with dynamic, configurable rules — configure each via Settings · Analytics"
      />

      <div className="space-y-3">
        {orderedTypes.map((type) => (
          <GameTypeRow key={type.slug} type={type} />
        ))}

        {/* Client: "if you want to add a new analytic/game we'll ask and you add it as another row" */}
        <Link href={"/games/format/new" as Route} className="group block">
          <div className="border-border/60 hover:border-accent/40 text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 rounded-xl border border-dashed p-4 text-sm transition-colors">
            <Plus className="h-4 w-4" />
            New game format
          </div>
        </Link>
      </div>
    </div>
  );
}

function GameTypeRow({ type }: { type: GameTypeDef }) {
  const Icon = type.icon;
  return (
    <Link href={`/games/format/${type.slug}` as Route} className="group block">
      <GlassCard className="group-hover:border-accent/40 transition-colors">
        <div className="flex items-center gap-4 p-4">
          {/* Icon block */}
          <div className="bg-accent/10 text-accent shrink-0 rounded-lg p-3">
            <Icon className="h-6 w-6" />
          </div>

          {/* Name + tagline + description */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-foreground text-base font-semibold">{type.name}</h3>
              <span className="text-muted-foreground text-xs">{type.tagline}</span>
              {type.autonomous && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Sparkles className="h-3 w-3" /> Autonomous
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-sm">{type.description}</p>
            <code
              className="text-muted-foreground/70 mt-1 block truncate font-mono text-[10px]"
              title={type.dbMapping}>
              {type.dbMapping}
            </code>
          </div>

          {/* Right-aligned stats */}
          <div className="hidden shrink-0 items-center gap-6 text-sm sm:flex">
            <div className="flex items-center gap-2">
              <Gamepad2 className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground-secondary">
                {type.activeInstances} {type.instanceNoun ? "active" : "enabled"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Play className="text-muted-foreground h-4 w-4" />
              <span className="text-foreground-secondary">
                {(type.totalPlays / 1000).toFixed(1)}K plays
              </span>
            </div>
          </div>

          <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-colors" />
        </div>
      </GlassCard>
    </Link>
  );
}
