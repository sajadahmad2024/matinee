"use client";

import { BarChart3, ChevronDown, Film, type LucideIcon, ScrollText } from "lucide-react";

import { useContentStats } from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { GlassCard } from "@/components/custom/glass-card";
import { useUpdateSearchParams } from "@/hooks/use-update-search-params";

import { ContentSection } from "../../_shared/content-config";
import { EMPTY } from "../../_shared/content-format";
import type { ContentRegionKey } from "../../_shared/content-types";
import { formatDuration } from "../listing/listing-config";
import { useContentPerformance } from "../performance/use-content-performance";

/** The Licensing card turns red past this many licences expiring within 30 days. */
const EXPIRING_ALERT_THRESHOLD = 5;

interface SummaryCardConfig {
  section: ContentSection;
  title: string;
  icon: LucideIcon;
  headline: string;
  headlineClass?: string;
  headlineSuffix?: string;
  subline: string;
}

interface ContentSummaryCardsProps {
  activeSection?: ContentSection;
  /** Every card follows the page's region. */
  region: ContentRegionKey;
}

/**
 * Three clickable summary cards — the active card's detail renders beneath them.
 * Content Inventory is active by default and owns the Recommended Actions + video
 * timeline; clicking the active card again collapses to the cards alone.
 * Headlines show a dash until their API responds.
 */
export function ContentSummaryCards({ activeSection, region }: ContentSummaryCardsProps) {
  const updateSearchParams = useUpdateSearchParams();
  const scopedRegion = region === ALL_REGIONS ? undefined : region;
  const { contentStats: stats } = useContentStats(scopedRegion);
  // Last 30 days — the same query (and cache) as the Performance section.
  const { performance } = useContentPerformance(region);

  // Licensing reads the same region-scoped stats (licences expiring in the next rolling 30 days).
  const expiring30 = stats?.expiringWithin30d ?? 0;
  const cards: SummaryCardConfig[] = [
    {
      section: ContentSection.Inventory,
      title: "Content Inventory",
      icon: Film,
      headline: stats ? (stats?.activeLibrary ?? 0)?.toLocaleString() : EMPTY,
      headlineSuffix: "live videos",
      subline: stats ? `+${stats?.addedThisMonth ?? 0} this month` : EMPTY,
    },
    {
      section: ContentSection.Licensing,
      title: "Licensing & Rights",
      icon: ScrollText,
      headline: stats ? String(expiring30) : EMPTY,
      headlineSuffix: "expiring ≤30d",
      // red when the expiring queue is heavy, amber otherwise
      headlineClass: !stats
        ? undefined
        : expiring30 > EXPIRING_ALERT_THRESHOLD
          ? "text-destructive"
          : "text-warning",
      subline: stats
        ? `${(stats?.licensed ?? 0)?.toLocaleString()} licensed / ${(stats?.original ?? 0)?.toLocaleString()} original`
        : EMPTY,
    },
    {
      section: ContentSection.Performance,
      title: "Content Performance",
      icon: BarChart3,
      headline: performance ? formatDuration(performance?.totals?.avgWatchSeconds) : EMPTY,
      headlineSuffix: "avg watch",
      subline: performance
        ? `${performance?.hitRate?.percent ?? 0}% hit rate · last 30 days`
        : EMPTY,
    },
  ];

  // Section toggles keep the list's current page.
  const toggleSection = (section: ContentSection) =>
    updateSearchParams(
      { section: activeSection === section ? ContentSection.None : section },
      { resetPage: false },
    );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards?.map((card) => {
        const active = activeSection === card?.section;
        const Icon = card?.icon;
        return (
          <button
            key={card?.section}
            type="button"
            onClick={() => toggleSection(card?.section)}
            aria-expanded={active}
            className="rounded-xl text-left">
            <GlassCard
              className={cn(
                "hover:border-primary/50 h-full cursor-pointer p-4 transition-all",
                active && "border-primary shadow-glow-sm shadow-primary/10",
              )}>
              <div className="flex items-center justify-between gap-2">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
                  <Icon className="text-primary h-4 w-4" />
                  {card?.title}
                </div>
                <ChevronDown
                  className={cn(
                    "text-muted-foreground h-4 w-4 transition-transform",
                    active && "text-primary rotate-180",
                  )}
                />
              </div>
              <div className="mt-2 flex items-baseline gap-1.5">
                <p
                  className={cn(
                    "font-gaming text-2xl font-bold tabular-nums",
                    card?.headlineClass ?? "text-foreground",
                  )}>
                  {card?.headline}
                </p>
                {card?.headlineSuffix && (
                  <span className="text-muted-foreground text-xs">{card?.headlineSuffix}</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{card?.subline}</p>
            </GlassCard>
          </button>
        );
      })}
    </div>
  );
}
