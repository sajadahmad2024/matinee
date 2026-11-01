"use client";

import { type ReactNode, useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";

import { type CustomAction, CustomActionsMenu } from "@/components/custom/custom-actions-menu";
import { CustomTabs } from "@/components/custom/custom-tabs";
import { StatusBadge } from "@/components/custom/status-badge";

/** A status filter tab: which statuses it shows. */
export interface InstanceFilter<S extends string> {
  key: string;
  label: string;
  statuses: readonly S[] | "all";
}

interface InstanceListProps<T, S extends string> {
  items: T[];
  getId: (item: T) => string;
  getTitle: (item: T) => string;
  getStatus: (item: T) => S;
  statusLabels: Record<S, string>;
  /** The muted line under the title (schedule, players, reward…). */
  renderMeta: (item: T) => ReactNode;
  filters: readonly InstanceFilter<S>[];
  /** The row's "⋯" menu. */
  getActions: (item: T) => CustomAction[];
  /** Opens the row (e.g. its results); the row isn't clickable without it. */
  onView?: (item: T) => void;
  /** An action on this row is running: spinner on its menu trigger. */
  isBusy?: (item: T) => boolean;
  emptyLabel: string;
  /**
   * Server-filtered mode (all optional): the parent owns the tab, loads only its rows and passes
   * the real per-tab totals. Without these, tabs filter `items` and count them in the browser.
   */
  filterKey?: string;
  onFilterChange?: (key: string) => void;
  counts?: Partial<Record<string, number>>;
  /** The active tab's first page is loading. */
  isLoading?: boolean;
  /** Under the rows — e.g. an infinite-scroll sentinel and its spinner. */
  footer?: ReactNode;
}

/** Admin-created game instances (quests, predictions) with status filter tabs and row menus. */
export function InstanceList<T, S extends string>({
  items,
  getId,
  getTitle,
  getStatus,
  statusLabels,
  renderMeta,
  filters,
  getActions,
  onView,
  isBusy,
  emptyLabel,
  filterKey: controlledKey,
  onFilterChange,
  counts,
  isLoading,
  footer,
}: InstanceListProps<T, S>) {
  const [ownKey, setOwnKey] = useState(filters[0]?.key ?? "");
  const filterKey = controlledKey ?? ownKey;
  const setFilterKey = onFilterChange ?? setOwnKey;

  const summary = (item: T, status: S) => (
    <>
      <div className="flex items-center gap-2">
        <span className="text-foreground truncate text-sm font-medium">{getTitle(item)}</span>
        <StatusBadge
          status={status}
          label={statusLabels[status] ?? status}
          className="border-0 text-[10px]"
        />
      </div>
      <p className="text-muted-foreground text-xs">{renderMeta(item)}</p>
    </>
  );

  const matches = (filter: InstanceFilter<S> | undefined, item: T) =>
    !filter || filter.statuses === "all" || filter.statuses.includes(getStatus(item));

  const active = filters?.find((f) => f.key === filterKey);
  const visible = items?.filter((item) => matches(active, item));

  return (
    <div className="space-y-3">
      <CustomTabs
        variant="pill"
        items={filters?.map((f) => ({
          value: f.key,
          label: f.label,
          count: counts ? counts[f.key] : items?.filter((item) => matches(f, item)).length,
        }))}
        value={filterKey}
        onValueChange={setFilterKey}
        aria-label="Filter by status"
      />

      {isLoading ? (
        <Skeleton className="bg-muted/20 h-[240px] w-full rounded-lg" />
      ) : visible.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">{emptyLabel}</p>
      ) : (
        <div className="divide-border/40 divide-y">
          {visible?.map((item) => {
            const status = getStatus(item);
            return (
              <div key={getId(item)} className="flex items-center gap-4 py-3">
                {onView ? (
                  <button
                    type="button"
                    onClick={() => onView(item)}
                    className="min-w-0 flex-1 cursor-pointer text-left">
                    {summary(item, status)}
                  </button>
                ) : (
                  <div className="min-w-0 flex-1">{summary(item, status)}</div>
                )}
                <CustomActionsMenu
                  label={`Actions for ${getTitle(item)}`}
                  actions={getActions(item)}
                  isLoading={isBusy?.(item)}
                />
              </div>
            );
          })}
        </div>
      )}
      {/* outside the rows: a tab whose first status is empty still has to load the next one */}
      {!isLoading && footer}
    </div>
  );
}
