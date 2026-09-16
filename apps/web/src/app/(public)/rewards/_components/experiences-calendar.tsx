"use client";

import { useMemo, useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { CalendarClock, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { cn } from "@/app/_libs/utils/cn";

import { GlassCard } from "../../games/_components/glass-card";
import type { ExperienceReward } from "../constants";

type EntryKind = "opens" | "closes" | "happens";
type CalendarFilter = "all" | EntryKind;

interface DayEntry {
  experience: ExperienceReward;
  kind: EntryKind;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;

const KIND_LABEL: Record<EntryKind, string> = {
  opens: "Bidding opens",
  closes: "Bidding closes",
  happens: "Experience day",
};

const KIND_STYLE: Record<EntryKind, string> = {
  opens: "bg-primary/15 text-primary hover:bg-primary/25",
  closes: "bg-warning/15 text-warning hover:bg-warning/25",
  happens: "bg-success/15 text-success hover:bg-success/25",
};

const KIND_DOT: Record<EntryKind, string> = {
  opens: "bg-primary",
  closes: "bg-warning",
  happens: "bg-success",
};

const FILTER_OPTIONS: { value: CalendarFilter; label: string }[] = [
  { value: "all", label: "All dates" },
  { value: "opens", label: "Bidding opens" },
  { value: "closes", label: "Bidding closes" },
  { value: "happens", label: "Experience day" },
];

const dayKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

/**
 * Month view of the auction pipeline: when bidding opens, when it closes, and when the
 * experience itself happens. Bidding windows are the thing admins plan around and a flat
 * list never showed two auctions closing on the same day.
 */
export function ExperiencesCalendar({ experiences }: { experiences: ExperienceReward[] }) {
  const today = new Date();
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [filter, setFilter] = useState<CalendarFilter>("all");

  const { cells, entriesByDay, counts } = useMemo(() => {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leading = (new Date(year, month, 1).getDay() + 6) % 7;

    const cells: (Date | null)[] = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const entriesByDay = new Map<string, DayEntry[]>();
    const counts: Record<EntryKind, number> = { opens: 0, closes: 0, happens: 0 };
    const inMonth = (d: Date) => d.getFullYear() === year && d.getMonth() === month;
    const push = (iso: string, experience: ExperienceReward, kind: EntryKind) => {
      if (filter !== "all" && filter !== kind) return;
      const d = new Date(iso);
      if (Number.isNaN(d.getTime()) || !inMonth(d)) return;
      const key = dayKey(d);
      entriesByDay.set(key, [...(entriesByDay.get(key) ?? []), { experience, kind }]);
      counts[kind] += 1;
    };

    for (const e of experiences) {
      push(e.bidOpenAt, e, "opens");
      push(e.bidCloseAt, e, "closes");
      push(e.experienceAt, e, "happens");
    }

    const order: EntryKind[] = ["closes", "opens", "happens"];
    for (const [key, entries] of entriesByDay) {
      entriesByDay.set(
        key,
        [...entries].sort((a, b) => order.indexOf(a.kind) - order.indexOf(b.kind)),
      );
    }

    return { cells, entriesByDay, counts };
  }, [cursor, experiences, filter]);

  const monthLabel = cursor.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <GlassCard className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-foreground font-gaming text-lg font-semibold">{monthLabel}</h3>
          <span className="text-muted-foreground text-xs tabular-nums">
            {counts.opens} opening · {counts.closes} closing · {counts.happens} running
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-3 text-xs">
            {(Object.keys(KIND_LABEL) as EntryKind[]).map((k) => (
              <span key={k} className="flex items-center gap-1.5">
                <span className={cn("h-2 w-2 rounded-full", KIND_DOT[k])} />
                <span className="text-muted-foreground">{KIND_LABEL[k]}</span>
              </span>
            ))}
          </span>
          <Select value={filter} onValueChange={(v) => setFilter(v as CalendarFilter)}>
            <SelectTrigger className="h-8 w-[170px] gap-1.5">
              <CalendarClock className="text-muted-foreground h-3.5 w-3.5" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="border-border bg-card z-50">
              {FILTER_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <div className="grid grid-cols-7 gap-px">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-muted-foreground pb-2 text-center text-xs font-medium">
            {d}
          </div>
        ))}
      </div>

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
                      <EntryPill key={`${entry.experience.id}-${entry.kind}`} entry={entry} />
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
                        <PopoverContent className="border-border bg-card w-72 space-y-1 p-2">
                          <p className="text-muted-foreground px-1 text-xs font-medium">
                            {date.toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          {entries.map((entry) => (
                            <EntryPill
                              key={`${entry.experience.id}-${entry.kind}-full`}
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
  const { experience, kind } = entry;
  return (
    <Link
      href={`/rewards/experience/${experience.id}` as Route}
      title={`${experience.title} — ${KIND_LABEL[kind].toLowerCase()}`}
      className={cn(
        "block truncate rounded px-1 py-0.5 text-[10px] font-medium transition-colors",
        full && "px-2 py-1 text-xs",
        KIND_STYLE[kind],
      )}>
      {experience.title}
    </Link>
  );
}
