"use client";

import { useState } from "react";

import { Ban, CheckCircle2, XCircle } from "lucide-react";

import type { PredictionEntryDto, PredictionEntryStatsDto } from "@/app/_libs/api/generated";
import { usePredictionEntries } from "@/app/_libs/hooks/api/use-admin-games";
import { cn } from "@/app/_libs/utils/cn";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import {
  type GamePrediction,
  type InstanceParticipantRow,
  type PredictionStatus,
  PredictionStatusEnum,
} from "../../../_libs/game-types";
import {
  InstanceResultModal,
  type ResultFilter,
} from "../../../_shared/instances/instance-result-modal";
import {
  PREDICTION_STATUS_LABELS,
  isPredictionLive,
  predictionSchedule,
  predictionStatus,
} from "../_libs/prediction-config";

type EntryResult = "correct" | "incorrect" | "pending";

const ALL = "all";

/**
 * Results filters once the prediction is resolved, applied by
 * `GET /admin/predictions/:id/entries?result=`. Before that every entry is pending, so no filter.
 */
const RESOLVED_FILTERS: readonly ResultFilter[] = [
  { value: ALL, label: "All" },
  { value: "correct", label: "Correct" },
  { value: "incorrect", label: "Incorrect" },
];

/**
 * An entry → a results row: the pick, its result and the points — paid to a winner, the entry
 * cost lost by a wrong pick, nothing while pending.
 */
const toRow = (e: PredictionEntryDto): InstanceParticipantRow => {
  const result: EntryResult =
    e?.isCorrect === true ? "correct" : e?.isCorrect === false ? "incorrect" : "pending";
  return {
    userId: e?.userId,
    name: e?.username || [e?.firstName, e?.lastName].filter(Boolean).join(" ") || "Player",
    avatarUrl: e?.avatarUrl,
    detail: e?.optionLabel ?? "—",
    result,
    points:
      result === "correct"
        ? (e?.pointsPaid ?? 0)
        : result === "incorrect"
          ? -(e?.pointsStaked ?? 0)
          : 0,
    at: e?.paidAt ?? e?.enteredAt ?? null,
  };
};

interface PredictionResultModalProps {
  /** The last prediction opened; kept after closing so the modal can animate out. */
  prediction: GamePrediction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A prediction's results from `GET /admin/predictions/:id/entries`: the outcome, participants and
 * points paid, the pick breakdown (the whole-prediction `summary`), then the entry table — filtered
 * by result once resolved, paged as it scrolls.
 */
export function PredictionResultModal({
  prediction,
  open,
  onOpenChange,
}: PredictionResultModalProps) {
  const [filter, setFilter] = useState(ALL);
  const result = filter === ALL ? undefined : (filter as EntryResult);
  const { entriesQuery, entries, summary } = usePredictionEntries(
    open ? prediction?.id : undefined,
    result,
  );
  const loaderRef = useInfiniteScroll({
    hasNextPage: entriesQuery.hasNextPage,
    isFetchingNextPage: entriesQuery.isFetchingNextPage,
    fetchNextPage: () => void entriesQuery.fetchNextPage(),
  });
  if (!prediction) return null;

  const status = predictionStatus(prediction);
  const isResolved = status === PredictionStatusEnum.Resolved;
  const participantCount = summary?.participantCount ?? 0;
  const correctCount = summary?.correctCount ?? 0;
  const correctLabel = summary?.options?.find(
    (o) => o?.optionId === prediction?.correctOptionId,
  )?.label;

  return (
    <InstanceResultModal
      key={prediction.id}
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setFilter(ALL);
      }}
      title={prediction.question}
      statusLabel={PREDICTION_STATUS_LABELS[status] ?? prediction.status}
      schedule={predictionSchedule(prediction)}
      outcome={outcomeFor(status, correctLabel, correctCount, participantCount)}
      participantCount={participantCount}
      pointsPaid={summary?.pointsPaid ?? 0}
      participants={entries?.map(toRow) ?? []}
      isLoading={entriesQuery.isPending}
      detailHead="Pick"
      filters={isResolved ? RESOLVED_FILTERS : undefined}
      filter={filter}
      onFilterChange={setFilter}
      infiniteScrollRef={loaderRef}
      isFetchingNextPage={entriesQuery.isFetchingNextPage}
      insights={
        summary && participantCount > 0 ? (
          <PickBreakdown
            summary={summary}
            // a resolve preview stashes its pick here too, before anything is confirmed
            correctOptionId={isResolved ? prediction?.correctOptionId : null}
          />
        ) : null
      }
      emptyLabel={
        entriesQuery.isError
          ? `Couldn't load entries: ${entriesQuery.error?.message}`
          : filter === ALL
            ? "Nobody has entered this prediction yet."
            : "No entries with this result."
      }
    />
  );
}

/** The outcome block: the correct answer once resolved, otherwise where the prediction stands. */
function outcomeFor(
  status: PredictionStatus,
  correctLabel: string | null | undefined,
  correctCount: number,
  participantCount: number,
) {
  if (status === PredictionStatusEnum.Resolved) {
    return {
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
      title: "Correct answer",
      value: correctLabel ?? "—",
      sub: `${correctCount.toLocaleString()} of ${participantCount.toLocaleString()} got it right`,
    };
  }
  if (status === PredictionStatusEnum.Cancelled) {
    return {
      icon: <Ban className="text-muted-foreground h-5 w-5" />,
      title: "Cancelled",
      value: "No outcome",
      sub: "Every entry cost was refunded",
    };
  }
  return {
    icon: <XCircle className="h-5 w-5 text-amber-500" />,
    title: isPredictionLive(status) ? "Awaiting outcome" : "Outcome",
    value: isPredictionLive(status) ? "In progress" : (PREDICTION_STATUS_LABELS[status] ?? status),
  };
}

/** How the entries split across the options (every option, even unpicked), the winner marked. */
function PickBreakdown({
  summary,
  correctOptionId,
}: {
  summary: PredictionEntryStatsDto;
  correctOptionId?: string | null;
}) {
  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-foreground text-sm font-semibold">Picks</h4>
        {(summary?.pointsStaked ?? 0) > 0 && (
          <span className="text-muted-foreground text-xs">
            Entry pool {(summary?.pointsStaked ?? 0).toLocaleString()} pts
          </span>
        )}
      </div>
      <ul className="space-y-2">
        {summary?.options?.map((option) => {
          const isCorrect = !!correctOptionId && option?.optionId === correctOptionId;
          return (
            <li key={option?.optionId} className="space-y-1">
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className="flex items-center gap-1.5">
                  {isCorrect && <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />}
                  {option?.label ?? "—"}
                </span>
                <span className="text-muted-foreground text-xs tabular-nums">
                  {(option?.entries ?? 0).toLocaleString()} · {option?.percent ?? 0}%
                </span>
              </div>
              <div className="bg-muted/40 h-1.5 overflow-hidden rounded-full">
                <div
                  className={cn("h-full rounded-full", isCorrect ? "bg-emerald-500" : "bg-accent")}
                  style={{ width: `${Math.min(100, Math.max(0, option?.percent ?? 0))}%` }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
