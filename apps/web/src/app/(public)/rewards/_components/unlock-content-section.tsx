import type { Route } from "next";
import Link from "next/link";

import { ArrowDownRight, ArrowRight, ArrowUpRight, ExternalLink, LockOpen } from "lucide-react";

import { SectionHeading } from "@/components/custom/section-heading";

import type { MacroRegion } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

import { MOCK_UNLOCK_CONTENT, type UnlockStatus, formatPoints } from "../constants";

// Reuses content's StatusBadge semantics (live = success, scheduled = info, off = muted).
const UNLOCK_STATUS: Record<UnlockStatus, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-success/20 text-success" },
  scheduled: { label: "Scheduled", className: "bg-info/20 text-info" },
  off: { label: "Off", className: "bg-muted/50 text-muted-foreground" },
};

const TREND_ICON = { up: ArrowUpRight, down: ArrowDownRight, flat: ArrowRight } as const;

interface UnlockContentSectionProps {
  region: "global" | MacroRegion;
}

export function UnlockContentSection({ region }: UnlockContentSectionProps) {
  const rows =
    region === "global"
      ? MOCK_UNLOCK_CONTENT
      : MOCK_UNLOCK_CONTENT.filter((r) => r.region === region);

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Unlock Content"
        subtitle="Points-gated content — configured in Content Management, tracked here"
        icon={LockOpen}
      />

      <GlassCard className="divide-border/40 divide-y p-0">
        {rows.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No unlock content for this region.
          </p>
        ) : (
          rows.map((row) => {
            const status = UNLOCK_STATUS[row.status];
            const TrendIcon = TREND_ICON[row.trend.direction];
            return (
              <Link
                key={row.contentId}
                href={`/content/details/${row.contentId}` as Route}
                className="hover:bg-muted/20 group flex items-center gap-4 px-4 py-3 transition-colors">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">
                      {row.title}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
                        status.className,
                      )}>
                      {status.label}
                    </span>
                  </div>
                  <p className="text-muted-foreground mt-0.5 text-xs">
                    Unlock cost {row.unlockCost.toLocaleString()} pts
                  </p>
                </div>

                <div className="hidden text-right sm:block">
                  <p className="text-foreground text-sm font-medium tabular-nums">
                    {row.unlocks.toLocaleString()}
                  </p>
                  <p className="text-muted-foreground text-[11px]">unlocks</p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-foreground text-sm font-medium tabular-nums">
                    {formatPoints(row.pointsSpent)} pts
                  </p>
                  <p className="text-muted-foreground text-[11px]">points spent</p>
                </div>
                <span
                  className={cn(
                    "flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-medium",
                    row.trend.direction === "up"
                      ? "text-success bg-success/10"
                      : row.trend.direction === "down"
                        ? "text-destructive bg-destructive/10"
                        : "text-muted-foreground bg-muted/40",
                  )}>
                  <TrendIcon className="h-3 w-3" />
                  {row.trend.label}
                </span>

                {/* explicit hand-off to the video's edit page in Content Management */}
                <ExternalLink className="text-muted-foreground group-hover:text-primary h-4 w-4 shrink-0 transition-colors" />
              </Link>
            );
          })
        )}
      </GlassCard>

      <div className="flex justify-end">
        <Link
          href={"/content" as Route}
          className="text-primary hover:text-primary/80 text-xs font-medium transition-colors">
          Manage exclusivity in Content Management →
        </Link>
      </div>
    </section>
  );
}
