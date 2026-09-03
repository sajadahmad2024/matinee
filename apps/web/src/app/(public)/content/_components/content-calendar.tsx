"use client";

import { useMemo, useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";
import { MOCK_VIDEOS, type VideoItem, parseMockDate } from "../constants";

interface DayEntry {
  video: VideoItem;
  kind: "scheduled" | "live";
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Month calendar of the master list — see across months what is live (success)
 * and what is scheduled (primary). Operational monitoring only, no editing.
 */
export function ContentCalendar() {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const { cells, entriesByDay } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Monday-first offset
    const leading = (firstOfMonth.getDay() + 6) % 7;

    const cells: (Date | null)[] = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const entriesByDay = new Map<string, DayEntry[]>();
    const push = (d: Date, entry: DayEntry) => {
      const key = dayKey(d);
      entriesByDay.set(key, [...(entriesByDay.get(key) ?? []), entry]);
    };

    for (const video of MOCK_VIDEOS) {
      if (video.status === "scheduled") {
        const at = parseMockDate(video.scheduledAt);
        if (at && at.getFullYear() === year && at.getMonth() === month) {
          push(at, { video, kind: "scheduled" });
        }
      }
      const from = parseMockDate(video.liveFrom);
      const until = parseMockDate(video.liveUntil);
      if (from && until) {
        for (let day = 1; day <= daysInMonth; day++) {
          const d = new Date(year, month, day);
          if (d >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) && d <= until) {
            push(d, { video, kind: "live" });
          }
        }
      }
    }

    // Scheduled entries lead each day so they aren't buried under long live spans.
    for (const [key, entries] of entriesByDay) {
      entriesByDay.set(
        key,
        [...entries].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === "scheduled" ? -1 : 1)),
      );
    }

    return { cells, entriesByDay };
  }, [cursor]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <GlassCard className="p-4">
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-foreground font-gaming text-lg font-semibold">{monthLabel}</h3>
        <div className="flex items-center gap-2">
          <span className="mr-2 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-success h-2 w-2 rounded-full" />
              <span className="text-muted-foreground">Live</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-primary h-2 w-2 rounded-full" />
              <span className="text-muted-foreground">Scheduled</span>
            </span>
          </span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => setCursor(new Date(today.getFullYear(), today.getMonth(), 1))}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-muted-foreground pb-2 text-center text-xs font-medium">
            {d}
          </div>
        ))}
      </div>

      {/* Day grid */}
      <div className="border-border/40 grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
        {cells.map((date, i) => {
          const entries = date ? (entriesByDay.get(dayKey(date)) ?? []) : [];
          const visible = entries.slice(0, MAX_VISIBLE);
          const overflow = entries.length - visible.length;
          const isToday = date && dayKey(date) === dayKey(today);

          return (
            <div
              key={i}
              className={cn(
                "bg-card/40 min-h-[96px] p-1.5",
                !date && "bg-muted/10",
                isToday && "bg-primary/5",
              )}>
              {date && (
                <>
                  <span
                    className={cn(
                      "text-xs tabular-nums",
                      isToday
                        ? "bg-primary text-primary-foreground inline-flex h-5 w-5 items-center justify-center rounded-full font-semibold"
                        : "text-muted-foreground",
                    )}>
                    {date.getDate()}
                  </span>
                  <div className="mt-1 space-y-0.5">
                    {visible.map((entry) => (
                      <EntryPill key={`${entry.video.id}-${entry.kind}`} entry={entry} />
                    ))}
                    {overflow > 0 && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground w-full truncate rounded px-1 text-left text-[10px] font-medium">
                            +{overflow} more
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="border-border bg-card w-64 space-y-1 p-2">
                          <p className="text-muted-foreground px-1 text-xs font-medium">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {entries.map((entry) => (
                            <EntryPill
                              key={`${entry.video.id}-${entry.kind}-full`}
                              entry={entry}
                              full
                            />
                          ))}
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </GlassCard>
  );
}

function EntryPill({ entry, full }: { entry: DayEntry; full?: boolean }) {
  const { video, kind } = entry;
  return (
    <Link
      href={`/content/details/${video.id}` as Route}
      title={`${video.title} — ${kind === "live" ? "live" : "scheduled"}`}
      className={cn(
        "block truncate rounded px-1 py-0.5 text-[10px] font-medium transition-colors",
        full && "px-2 py-1 text-xs",
        kind === "live"
          ? "bg-success/15 text-success hover:bg-success/25"
          : "bg-primary/15 text-primary hover:bg-primary/25",
      )}>
      {video.title}
    </Link>
  );
}
