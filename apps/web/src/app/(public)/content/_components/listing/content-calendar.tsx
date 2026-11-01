"use client";

import { useMemo, useState } from "react";

import Link from "next/link";

import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { CalendarClock, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { AdminContentControllerListV1SortEnum as ContentSortEnum } from "@/app/_libs/api/generated";
import {
  type ContentResponseDto,
  useAdminContentList,
} from "@/app/_libs/hooks/api/use-admin-content";
import { ALL_REGIONS } from "@/app/_libs/regions";
import { cn } from "@/app/_libs/utils/cn";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { CustomSelect, type CustomSelectOption } from "@/components/custom/custom-select";
import { GlassCard } from "@/components/custom/glass-card";

import { CONTENT_ROUTES, ContentLifecycleStatus } from "../../_shared/content-config";
import { parseApiDate } from "../../_shared/content-format";
import { type ContentRegionKey } from "../../_shared/content-types";
import { ContentTab, TAB_STATUSES } from "./listing-config";

type EntryKind = "scheduled" | "expiring";
export type CalendarFilter = "all" | "scheduled" | "expiring";

interface DayEntry {
  video: ContentResponseDto;
  kind: EntryKind;
}

interface ContentCalendarProps {
  searchQuery: string;
  region: ContentRegionKey;
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MAX_VISIBLE = 3;
/** The list API's largest page — a month past this many entries shows a note. */
const CALENDAR_LIMIT = 100;

const FILTER_OPTIONS: CustomSelectOption<CalendarFilter>[] = [
  { value: "all", label: "Scheduled & expiring" },
  { value: "scheduled", label: "Scheduled only" },
  { value: "expiring", label: "Expiring only" },
];

const dayKey = (d: Date) => format(d, "yyyy-MM-dd");

const KIND_STYLE: Record<EntryKind, string> = {
  scheduled: "bg-primary/15 text-primary hover:bg-primary/25",
  expiring: "bg-warning/15 text-warning hover:bg-warning/25",
};

/**
 * Month calendar of the master list: the two dates an admin plans around — when a video goes live
 * (scheduled) and when its licence runs out (expiring). One list call per kind for the visible
 * month, with the page's search and region applied (sort and the upload-date range are hidden in
 * this view). Monitoring only; an entry
 * opens the video.
 */
export function ContentCalendar({ searchQuery, region }: ContentCalendarProps) {
  const today = new Date();
  const [cursor, setCursor] = useState(() => startOfMonth(today));
  const [filter, setFilter] = useState<CalendarFilter>("all");

  const shared = {
    q: searchQuery?.trim() || undefined,
    region: region === ALL_REGIONS ? undefined : region,
    page: 1,
    limit: CALENDAR_LIMIT,
  };
  const monthFrom = startOfMonth(cursor).toISOString();
  const monthTo = endOfMonth(cursor).toISOString();

  const showScheduled = filter !== "expiring";
  const showExpiring = filter !== "scheduled";
  const scheduled = useAdminContentList(
    {
      ...shared,
      status: [ContentLifecycleStatus.Scheduled],
      scheduledFrom: monthFrom,
      scheduledTo: monthTo,
      sort: ContentSortEnum.ScheduledAsc,
    },
    { enabled: showScheduled },
  );
  const expiring = useAdminContentList(
    {
      ...shared,
      status: TAB_STATUSES[ContentTab.Master],
      licenseExpiresFrom: monthFrom,
      licenseExpiresTo: monthTo,
      sort: ContentSortEnum.LicenseExpiryAsc,
    },
    { enabled: showExpiring },
  );

  const scheduledRows = showScheduled ? scheduled?.contents : undefined;
  const expiringRows = showExpiring ? expiring?.contents : undefined;

  const { cells, entriesByDay, counts } = useMemo(() => {
    const first = startOfMonth(cursor);
    const daysInMonth = endOfMonth(cursor).getDate();
    // Monday-first offset
    const leading = (first.getDay() + 6) % 7;
    const cells: (Date | null)[] = [
      ...Array.from({ length: leading }, () => null),
      ...Array.from(
        { length: daysInMonth },
        (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1),
      ),
    ];
    while (cells.length % 7 !== 0) cells.push(null);

    const entriesByDay = new Map<string, DayEntry[]>();
    const counts: Record<EntryKind, number> = { scheduled: 0, expiring: 0 };
    const push = (at: Date | undefined, entry: DayEntry) => {
      if (!at) return;
      const key = dayKey(at);
      entriesByDay.set(key, [...(entriesByDay.get(key) ?? []), entry]);
      counts[entry.kind] += 1;
    };

    // Scheduled first, so a day's go-lives lead its expiries — a go-live is actionable first.
    scheduledRows?.forEach((video) =>
      push(parseApiDate(video?.scheduledAt), { video, kind: "scheduled" }),
    );
    expiringRows?.forEach((video) =>
      push(parseApiDate(video?.licenseExpiresAt), { video, kind: "expiring" }),
    );

    return { cells, entriesByDay, counts };
  }, [cursor, scheduledRows, expiringRows]);

  const isError =
    (showScheduled && scheduled?.contentListQuery?.isError) ||
    (showExpiring && expiring?.contentListQuery?.isError);
  const isFetching =
    (showScheduled && scheduled?.contentListQuery?.isFetching) ||
    (showExpiring && expiring?.contentListQuery?.isFetching);
  const isTruncated =
    (showScheduled && (scheduled?.total ?? 0) > CALENDAR_LIMIT) ||
    (showExpiring && (expiring?.total ?? 0) > CALENDAR_LIMIT);

  const retry = () => {
    if (showScheduled) scheduled?.contentListQuery?.refetch();
    if (showExpiring) expiring?.contentListQuery?.refetch();
  };

  return (
    <GlassCard className="p-4">
      {/* Month navigation + what the grid is showing */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h3 className="text-foreground font-gaming text-lg font-semibold">
            {format(cursor, "MMMM yyyy")}
          </h3>
          <span className="text-muted-foreground text-xs tabular-nums">
            {counts.scheduled} scheduled · {counts.expiring} expiring
          </span>
          {isFetching && (
            <Loader2
              className="text-muted-foreground h-3.5 w-3.5 animate-spin"
              aria-label="Loading"
            />
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="bg-primary h-2 w-2 rounded-full" />
              <span className="text-muted-foreground">Scheduled</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="bg-warning h-2 w-2 rounded-full" />
              <span className="text-muted-foreground">Expiring</span>
            </span>
          </span>
          <CustomSelect
            options={FILTER_OPTIONS}
            value={filter}
            onValueChange={setFilter}
            leftIcon={<CalendarClock className="text-muted-foreground h-3.5 w-3.5" />}
            triggerClassName="h-8 w-fit gap-1.5"
            aria-label="Calendar filter"
          />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            aria-label="Previous month"
            onClick={() => setCursor((c) => addMonths(c, -1))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 cursor-pointer"
            onClick={() => setCursor(startOfMonth(new Date()))}>
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 cursor-pointer"
            aria-label="Next month"
            onClick={() => setCursor((c) => addMonths(c, 1))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isTruncated && (
        <p className="text-warning mb-3 text-xs">
          This month has more than {CALENDAR_LIMIT} entries of a kind — showing the first{" "}
          {CALENDAR_LIMIT}. Narrow it with search, region or the upload date.
        </p>
      )}

      {isError ? (
        <CustomRetryState
          title="Unable to load the calendar"
          description="Please try again."
          onRetry={retry}
          isRetrying={!!isFetching}
        />
      ) : (
        <>
          {/* Weekday header */}
          <div className="grid grid-cols-7 gap-px">
            {WEEKDAYS?.map((d) => (
              <div key={d} className="text-muted-foreground pb-2 text-center text-xs font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Day grid */}
          <div className="border-border/40 grid grid-cols-7 gap-px overflow-hidden rounded-lg border">
            {cells?.map((date, i) => {
              const entries = date ? (entriesByDay.get(dayKey(date)) ?? []) : [];
              const visible = entries?.slice(0, MAX_VISIBLE);
              const overflow = entries.length - visible.length;
              const isToday = date && dayKey(date) === dayKey(today);

              return (
                <div
                  key={i}
                  className={cn(
                    "bg-card/40 min-h-24 p-1.5",
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
                        {visible?.map((entry) => (
                          <EntryPill key={`${entry?.video?.id}-${entry?.kind}`} entry={entry} />
                        ))}
                        {overflow > 0 && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <button
                                type="button"
                                className="text-muted-foreground hover:text-foreground w-full cursor-pointer truncate rounded px-1 text-left text-[10px] font-medium">
                                +{overflow} more
                              </button>
                            </PopoverTrigger>
                            <PopoverContent className="border-border bg-card w-64 space-y-1 p-2">
                              <p className="text-muted-foreground px-1 text-xs font-medium">
                                {format(date, "EEE, MMM d")}
                              </p>
                              {entries?.map((entry) => (
                                <EntryPill
                                  key={`${entry?.video?.id}-${entry?.kind}-full`}
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
        </>
      )}
    </GlassCard>
  );
}

function EntryPill({ entry, full }: { entry: DayEntry; full?: boolean }) {
  const { video, kind } = entry;
  return (
    <Link
      href={CONTENT_ROUTES.details(video?.id)}
      title={`${video?.title} — ${kind === "scheduled" ? "goes live" : "licence expires"}`}
      className={cn(
        "block truncate rounded px-1 py-0.5 text-[10px] font-medium transition-colors",
        full && "px-2 py-1 text-xs",
        KIND_STYLE[kind],
      )}>
      {video?.title}
    </Link>
  );
}
