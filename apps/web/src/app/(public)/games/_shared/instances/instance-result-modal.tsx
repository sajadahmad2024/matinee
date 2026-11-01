"use client";

import type { ReactNode, RefObject } from "react";

import { formatDistanceToNowStrict } from "date-fns";
import { Coins, Users } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

import { EMPTY, parseApiDate } from "@/app/_libs/utils/format";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomTabs } from "@/components/custom/custom-tabs";
import { type Column, DataTable } from "@/components/custom/data-table";

import type { InstanceParticipantRow } from "../../_libs/game-types";

const RESULT_BADGE: Record<InstanceParticipantRow["result"], string> = {
  correct: "bg-emerald-500/15 text-emerald-500",
  completed: "bg-emerald-500/15 text-emerald-500",
  claimed: "bg-sky-500/15 text-sky-500",
  incorrect: "bg-destructive/15 text-destructive",
  pending: "bg-amber-500/15 text-amber-500",
  in_progress: "bg-amber-500/15 text-amber-500",
};

/** "3 hours ago" from an ISO time; "—" without one. */
function ago(iso: string | null) {
  const date = parseApiDate(iso);
  return date ? formatDistanceToNowStrict(date, { addSuffix: true }) : EMPTY;
}

const points = (n: number) =>
  n > 0 ? `+${n.toLocaleString()}` : n < 0 ? n.toLocaleString() : EMPTY;

/** "Riya Shah" → "RS"; "@cinephile_88" → "CI". */
const initials = (name: string) => {
  const words = name.replace("@", "").trim().split(/\s+/);
  return (
    words.length > 1 ? `${words[0]?.[0]}${words[1]?.[0]}` : (words[0] ?? "").slice(0, 2)
  ).toUpperCase();
};

/** An outcome block: icon, caption, headline value and an optional sub-line. */
interface InstanceOutcome {
  icon: ReactNode;
  title: string;
  value: string;
  sub?: string;
}

/** A results filter tab, applied by the server (`status` / `result` on the results endpoint). */
export interface ResultFilter {
  value: string;
  label: string;
}

interface InstanceResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  statusLabel: string;
  /** e.g. "May 12 – May 19" or "Q3 2026". */
  schedule: string;
  outcome: InstanceOutcome;
  /** Whole-instance totals (the endpoint's `summary`), not the loaded rows. */
  participantCount: number;
  pointsPaid: number;
  participants: InstanceParticipantRow[];
  /** The first page is loading. */
  isLoading?: boolean;
  /** Header for the participant's action column ("Pick", "Progress"). */
  detailHead: string;
  /** Server-side result filter tabs; the table shows the active one's rows. */
  filters?: readonly ResultFilter[];
  filter?: string;
  onFilterChange?: (value: string) => void;
  /** Infinite scroll: the table's end sentinel and the next page's spinner. */
  infiniteScrollRef?: RefObject<HTMLDivElement | null>;
  isFetchingNextPage?: boolean;
  emptyLabel?: string;
  /** Extra section between the totals and the table (e.g. a prediction's pick breakdown). */
  insights?: ReactNode;
}

/** An instance's results: outcome, participants and points paid, then the participant table. */
export function InstanceResultModal({
  open,
  onOpenChange,
  title,
  statusLabel,
  schedule,
  outcome,
  participantCount,
  pointsPaid,
  participants,
  isLoading,
  detailHead,
  filters,
  filter,
  onFilterChange,
  infiniteScrollRef,
  isFetchingNextPage,
  emptyLabel = "No participants yet.",
  insights,
}: InstanceResultModalProps) {
  const columns: Column<InstanceParticipantRow>[] = [
    {
      header: "Player",
      cell: (p) => (
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            {p?.avatarUrl && <AvatarImage src={p.avatarUrl} alt="" className="object-cover" />}
            <AvatarFallback className="text-[10px]">{initials(p?.name ?? "")}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{p?.name}</span>
        </div>
      ),
    },
    {
      header: detailHead,
      cell: (p) => <span className="text-muted-foreground text-sm">{p?.detail}</span>,
    },
    {
      header: "Result",
      cell: (p) => (
        <Badge
          className={`${RESULT_BADGE[p?.result] ?? "bg-muted"} border-0 text-[10px] capitalize`}>
          {p?.result?.replace("_", " ")}
        </Badge>
      ),
    },
    {
      header: "Points",
      headerClassName: "text-right",
      className: "text-right text-sm tabular-nums",
      cell: (p) => points(p?.points ?? 0),
    },
    {
      header: "When",
      headerClassName: "text-right",
      className: "text-muted-foreground text-right text-xs",
      cell: (p) => ago(p?.at),
    },
  ];

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      appearance="default"
      className="max-h-[88vh] overflow-hidden sm:max-w-3xl"
      title={
        <span className="flex items-center gap-2">
          {title}
          <Badge variant="secondary" className="capitalize">
            {statusLabel}
          </Badge>
        </span>
      }>
      <div className="space-y-5 overflow-y-auto pr-1">
        <p className="text-muted-foreground text-sm">{schedule}</p>

        <div className="grid gap-3 sm:grid-cols-4">
          <div className="border-border/50 bg-muted/20 rounded-lg border p-4 sm:col-span-2">
            <div className="flex items-center gap-3">
              {outcome.icon}
              <div>
                <p className="text-muted-foreground text-xs">{outcome.title}</p>
                <p className="text-foreground text-lg font-semibold">{outcome.value}</p>
                {outcome.sub && <p className="text-muted-foreground text-xs">{outcome.sub}</p>}
              </div>
            </div>
          </div>
          <Stat
            icon={<Users className="h-4 w-4" />}
            label="Participants"
            value={(participantCount ?? 0).toLocaleString()}
          />
          <Stat
            icon={<Coins className="h-4 w-4" />}
            label="Points distributed"
            value={(pointsPaid ?? 0).toLocaleString()}
          />
        </div>

        {insights}

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="text-foreground text-sm font-semibold">
              Participants{" "}
              <span className="text-muted-foreground font-normal">
                ({(participantCount ?? 0).toLocaleString()})
              </span>
            </h4>
            {filters && filters.length > 0 && filter !== undefined && onFilterChange && (
              <CustomTabs
                variant="pill"
                items={filters?.map((f) => ({ value: f.value, label: f.label }))}
                value={filter}
                onValueChange={onFilterChange}
                aria-label="Filter participants"
              />
            )}
          </div>

          <DataTable
            columns={columns}
            data={participants ?? []}
            rowIdKey="userId"
            isLoading={isLoading}
            infiniteScrollRef={infiniteScrollRef}
            isFetchingNextPage={isFetchingNextPage}
            className="border-border/40 max-h-[42vh] rounded-lg border"
            classNames={{
              container: "bg-transparent",
              header: "bg-muted/30",
              head: "text-foreground bg-transparent",
              // the compact rows the results table has always had
              cell: "p-2",
            }}
            emptyState={<span className="text-muted-foreground">{emptyLabel}</span>}
          />
        </div>
      </div>
    </CustomModal>
  );
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="border-border/40 rounded-lg border p-3">
      <div className="text-muted-foreground flex items-center gap-1 text-xs">
        {icon}
        {label}
      </div>
      <p className="text-foreground mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
