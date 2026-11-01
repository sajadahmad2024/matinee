import Link from "next/link";

import { ChevronRight, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { GlassCard } from "@/components/custom/glass-card";

import { GAME_ROUTES, type GameFormat } from "../_libs/game-config";

interface GameFormatRowProps {
  format: GameFormat;
}

/** One format as a full-width row (content-management style), linking to its settings. */
export function GameFormatRow({ format }: GameFormatRowProps) {
  const Icon = format.icon;

  return (
    <Link href={GAME_ROUTES.format(format.slug)} className="group block">
      <GlassCard className="group-hover:border-accent/40 transition-colors">
        <div className="flex items-center gap-4 p-4">
          <div className="bg-accent/10 text-accent shrink-0 rounded-lg p-3">
            <Icon className="h-6 w-6" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-foreground text-base font-semibold">{format.name}</h3>
              <span className="text-muted-foreground text-xs">{format.tagline}</span>
              {format.autonomous && (
                <Badge variant="secondary" className="gap-1 text-[10px]">
                  <Sparkles className="h-3 w-3" /> Autonomous
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-0.5 truncate text-sm">{format.description}</p>
            <code
              className="text-muted-foreground/70 mt-1 block truncate font-mono text-[10px]"
              title={format.dbMapping}>
              {format.dbMapping}
            </code>
          </div>

          <ChevronRight className="text-muted-foreground group-hover:text-foreground h-5 w-5 shrink-0 transition-colors" />
        </div>
      </GlassCard>
    </Link>
  );
}
