import { CircleDashed, Layers, TrendingUp } from "lucide-react";

import type { TaxonomySummaryDto } from "@/app/_libs/api/generated";
import { cn } from "@/app/_libs/utils/cn";

/**
 * Footer strip: total, most used, and unused (safe to remove) — the API's `summary`, over every row
 * the search matched (all pages). Dashes until it loads.
 */
export function TaxonomySummary({ summary }: { summary?: TaxonomySummaryDto }) {
  const unusedCount = summary?.unusedCount ?? 0;
  const mostUsed = summary?.mostUsed;

  return (
    <div className="border-border/40 bg-muted/10 flex flex-wrap items-center gap-x-6 gap-y-2 rounded-b-xl border-t px-4 py-3 text-xs">
      <span className="text-muted-foreground flex items-center gap-1.5">
        <Layers className="h-3.5 w-3.5" />
        Total
        <span className="text-foreground font-semibold tabular-nums">
          {summary ? summary.total.toLocaleString() : "—"}
        </span>
      </span>
      <span className="text-muted-foreground flex min-w-0 items-center gap-1.5">
        <TrendingUp className="h-3.5 w-3.5 shrink-0" />
        Most used
        <span className="text-foreground truncate font-semibold">{mostUsed?.name ?? "—"}</span>
        {mostUsed && (
          <span className="tabular-nums">({mostUsed.contentCount.toLocaleString()})</span>
        )}
      </span>
      <span className="text-muted-foreground flex items-center gap-1.5">
        <CircleDashed className="h-3.5 w-3.5" />
        Unused
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold tabular-nums",
            unusedCount > 0 ? "bg-warning/15 text-warning" : "bg-muted/40 text-foreground",
          )}>
          {summary ? unusedCount.toLocaleString() : "—"}
        </span>
        {unusedCount > 0 && <span>· safe to remove</span>}
      </span>
    </div>
  );
}
