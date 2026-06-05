"use client";

import { useMemo, useState } from "react";

import { Archive, BarChart3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { cn } from "@/app/_libs/utils/cn";

export type InstanceStatus = "draft" | "scheduled" | "active" | "ended" | "archived";

export interface GameInstance {
  id: string;
  name: string;
  status: InstanceStatus;
  /** e.g. "May 12 – May 19" or "Q3 2026" */
  schedule: string;
  participants: number;
  /** short reward summary, e.g. "100 pts · 50 XP" */
  reward: string;
  // ── result fields (populated once ended/archived) ──
  winner?: string;
  outcome?: string;
  completions?: number;
  totalEntries?: number;
  pointsDistributed?: number;
}

const STATUS_VARIANT: Record<InstanceStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  scheduled: "bg-amber-500/15 text-amber-500",
  active: "bg-emerald-500/15 text-emerald-500",
  ended: "bg-blue-500/15 text-blue-500",
  archived: "bg-muted/50 text-muted-foreground",
};

type FilterKey = "all" | "active" | "scheduled" | "archived";

const FILTERS: { key: FilterKey; label: string; match: (s: InstanceStatus) => boolean }[] = [
  { key: "all", label: "All", match: () => true },
  { key: "active", label: "Active", match: (s) => s === "active" },
  { key: "scheduled", label: "Scheduled", match: (s) => s === "scheduled" || s === "draft" },
  { key: "archived", label: "Archived", match: (s) => s === "ended" || s === "archived" },
];

interface InstancesListProps {
  instances: GameInstance[];
  onView?: (i: GameInstance) => void;
  onEdit?: (i: GameInstance) => void;
  onArchive?: (i: GameInstance) => void;
  onDelete?: (i: GameInstance) => void;
  emptyLabel?: string;
}

export function InstancesList({
  instances,
  onView,
  onEdit,
  onArchive,
  onDelete,
  emptyLabel = "Nothing scheduled yet.",
}: InstancesListProps) {
  const [filter, setFilter] = useState<FilterKey>("all");

  const counts = useMemo(
    () =>
      FILTERS.reduce(
        (acc, f) => ({ ...acc, [f.key]: instances.filter((i) => f.match(i.status)).length }),
        {} as Record<FilterKey, number>,
      ),
    [instances],
  );

  const visible = instances.filter((i) => FILTERS.find((f) => f.key === filter)!.match(i.status));

  return (
    <div className="space-y-3">
      {/* status filter */}
      <div className="bg-muted/30 inline-flex items-center gap-1 rounded-lg p-1">
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

      {visible.length === 0 ? (
        <p className="text-muted-foreground py-6 text-center text-sm">{emptyLabel}</p>
      ) : (
        <div className="divide-border/40 divide-y">
          {visible.map((i) => {
            const archived = i.status === "ended" || i.status === "archived";
            return (
              <div key={i.id} className="flex items-center gap-4 py-3">
                <button
                  type="button"
                  onClick={() => onView?.(i)}
                  className="min-w-0 flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-foreground truncate text-sm font-medium">{i.name}</span>
                    <Badge className={`${STATUS_VARIANT[i.status]} border-0 text-[10px] capitalize`}>
                      {i.status}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {i.schedule} · {i.participants.toLocaleString()} players · {i.reward}
                    {archived && i.winner ? ` · 🏆 ${i.winner}` : ""}
                  </p>
                </button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onView?.(i)}>
                      <BarChart3 className="mr-2 h-4 w-4" /> View results
                    </DropdownMenuItem>
                    {!archived && (
                      <DropdownMenuItem onClick={() => onEdit?.(i)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    )}
                    {i.status !== "archived" && (
                      <DropdownMenuItem onClick={() => onArchive?.(i)}>
                        <Archive className="mr-2 h-4 w-4" /> Archive
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete?.(i)}
                      className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
