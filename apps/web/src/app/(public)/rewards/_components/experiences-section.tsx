"use client";

import { useMemo, useState } from "react";

import { CalendarDays, Gavel, List } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import type { MacroRegion } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { SectionHeading } from "@/components/custom/section-heading";

import { type ExperienceStatus, MOCK_EXPERIENCES } from "../constants";
import { ExperienceListItem } from "./experience-list-item";
import { ExperiencesCalendar } from "./experiences-calendar";

type FilterKey = "all" | "live" | "scheduled" | "ended" | "archived";

// Same chip pattern as games' instances-list FILTERS.
const FILTERS: { key: FilterKey; label: string; match: (s: ExperienceStatus) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "live", label: "Live", match: (s) => s === "live" },
  { key: "scheduled", label: "Scheduled", match: (s) => s === "scheduled" || s === "draft" },
  { key: "ended", label: "Ended", match: (s) => s === "ended" },
  { key: "archived", label: "Archived", match: (s) => s === "archived" },
];

interface ExperiencesSectionProps {
  region: "global" | MacroRegion;
}

export function ExperiencesSection({ region }: ExperiencesSectionProps) {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [view, setView] = useState<"list" | "calendar">("list");

  const scoped = useMemo(
    () =>
      region === "global" ? MOCK_EXPERIENCES : MOCK_EXPERIENCES.filter((e) => e.region === region),
    [region],
  );

  const counts = useMemo(
    () =>
      FILTERS.reduce(
        (acc, f) => ({ ...acc, [f.key]: scoped.filter((e) => f.match(e.status)).length }),
        {} as Record<FilterKey, number>,
      ),
    [scoped],
  );

  const visible = scoped.filter((e) => FILTERS.find((f) => f.key === filter)!.match(e.status));

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Bidding for Experiences"
        subtitle="Points-based auctions for real-world experiences — geofenced per market"
        icon={Gavel}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* status filter chips — list view only; the calendar has its own date filter */}
        <div
          className={cn(
            "bg-muted/30 inline-flex items-center gap-1 rounded-lg p-1",
            view === "calendar" && "invisible",
          )}>
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1 text-sm transition-colors",
                filter === f.key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}>
              {f.label}
              <span className="text-muted-foreground ml-1.5 text-xs">{counts[f.key]}</span>
            </button>
          ))}
        </div>

        {/* list ↔ calendar, same toggle pattern as Content Management */}
        <div className="border-border/50 flex items-center rounded-lg border p-0.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={view === "list" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setView("list")}>
                <List className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>List view</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={view === "calendar" ? "secondary" : "ghost"}
                size="icon"
                className="h-8 w-8 cursor-pointer"
                onClick={() => setView("calendar")}>
                <CalendarDays className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Calendar view</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {view === "calendar" ? (
        <ExperiencesCalendar experiences={scoped} />
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground py-8 text-center text-sm">
          No experiences match this filter.
        </p>
      ) : (
        <div className="space-y-3">
          {visible.map((e) => (
            <ExperienceListItem key={e.id} experience={e} />
          ))}
        </div>
      )}
    </section>
  );
}
