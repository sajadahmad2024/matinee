"use client";

import { useCallback } from "react";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BarChart3, ChevronDown, Film, ScrollText, type LucideIcon } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";
import { CONTENT_INVENTORY, LICENSING_SUMMARY, PERFORMANCE_SUMMARY } from "../constants";

export type SummarySection = "inventory" | "licensing" | "performance";

interface SummaryCardConfig {
  section: SummarySection;
  title: string;
  icon: LucideIcon;
  headline: string;
  headlineClass?: string;
  headlineSuffix?: string;
  subline: string;
}

const CARDS: SummaryCardConfig[] = [
  {
    section: "inventory",
    title: "Content Inventory",
    icon: Film,
    headline: CONTENT_INVENTORY.activeLibrary.toLocaleString(),
    headlineSuffix: "live videos",
    subline: `+${CONTENT_INVENTORY.addedThisMonth} this month`,
  },
  {
    section: "licensing",
    title: "Licensing & Rights",
    icon: ScrollText,
    headline: String(LICENSING_SUMMARY.expiring30),
    headlineSuffix: "expiring ≤30d",
    // red when the expiring queue is heavy, amber otherwise
    headlineClass: LICENSING_SUMMARY.expiring30 > 5 ? "text-destructive" : "text-warning",
    subline: `${LICENSING_SUMMARY.licensed.toLocaleString()} licensed / ${LICENSING_SUMMARY.original.toLocaleString()} original`,
  },
  {
    section: "performance",
    title: "Content Performance",
    icon: BarChart3,
    headline: PERFORMANCE_SUMMARY.avgWatchTime,
    headlineSuffix: "avg watch",
    subline: `${PERFORMANCE_SUMMARY.hitRatePct}% hit rate`,
  },
];

interface ContentSummaryCardsProps {
  activeSection?: SummarySection;
}

/**
 * Three clickable summary cards — detail data appears only on click (?section=),
 * clicking the active card again collapses. The video timeline below never disappears.
 */
export function ContentSummaryCards({ activeSection }: ContentSummaryCardsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const toggleSection = useCallback(
    (section: SummarySection) => {
      const params = new URLSearchParams(searchParams.toString());
      if (activeSection === section) {
        params.delete("section");
      } else {
        params.set("section", section);
      }
      router.push(`${pathname}?${params.toString()}` as Route, { scroll: false });
    },
    [activeSection, pathname, router, searchParams],
  );

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {CARDS.map((card) => {
        const active = activeSection === card.section;
        const Icon = card.icon;
        return (
          <button
            key={card.section}
            type="button"
            onClick={() => toggleSection(card.section)}
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
                  {card.title}
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
                    card.headlineClass ?? "text-foreground",
                  )}>
                  {card.headline}
                </p>
                {card.headlineSuffix && (
                  <span className="text-muted-foreground text-xs">{card.headlineSuffix}</span>
                )}
              </div>
              <p className="text-muted-foreground mt-1 text-xs">{card.subline}</p>
            </GlassCard>
          </button>
        );
      })}
    </div>
  );
}
