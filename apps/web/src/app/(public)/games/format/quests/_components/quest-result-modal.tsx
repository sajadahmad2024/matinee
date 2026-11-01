"use client";

import { useState } from "react";

import { CheckCircle2 } from "lucide-react";

import type { QuestParticipantDto } from "@/app/_libs/api/generated";
import { useQuestParticipants } from "@/app/_libs/hooks/api/use-admin-games";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import type { GameQuest, InstanceParticipantRow } from "../../../_libs/game-types";
import {
  InstanceResultModal,
  type ResultFilter,
} from "../../../_shared/instances/instance-result-modal";
import { QUEST_STATUS_LABELS, questSchedule, questStatus } from "../_libs/quest-config";

/** The backend's participation statuses, as the results table filters them. */
type ParticipantStatus = "in_progress" | "completed" | "claimed";

const ALL = "all";

/**
 * Results filters, applied by `GET /admin/quests/:id/participants?status=`. Completed = finished
 * but the reward not claimed yet; Claimed = reward paid.
 */
const PARTICIPANT_FILTERS: readonly ResultFilter[] = [
  { value: ALL, label: "All" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "claimed", label: "Claimed" },
];

/** A participation → a results row: name, "2/3 videos", its status and the points paid. */
const toRow = (p: QuestParticipantDto): InstanceParticipantRow => ({
  userId: p?.userId,
  name: p?.username || [p?.firstName, p?.lastName].filter(Boolean).join(" ") || "Player",
  avatarUrl: p?.avatarUrl,
  detail: `${p?.actionsDone ?? 0}/${p?.actionsTotal ?? 0} videos`,
  result: (p?.status as ParticipantStatus) ?? "in_progress",
  points: p?.pointsPaid ?? 0,
  at: p?.claimedAt ?? p?.completedAt ?? p?.startedAt ?? null,
});

interface QuestResultModalProps {
  /** The last quest opened; kept after closing so the modal can animate out. */
  quest: GameQuest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A quest's results from `GET /admin/quests/:id/participants`: completions, participants and
 * points paid (the whole-quest `summary`), then the participant table, filtered by status and
 * paged as it scrolls.
 */
export function QuestResultModal({ quest, open, onOpenChange }: QuestResultModalProps) {
  const [filter, setFilter] = useState(ALL);
  const status = filter === ALL ? undefined : (filter as ParticipantStatus);
  const { participantsQuery, participants, summary } = useQuestParticipants(
    open ? quest?.id : undefined,
    status,
  );
  const loaderRef = useInfiniteScroll({
    hasNextPage: participantsQuery.hasNextPage,
    isFetchingNextPage: participantsQuery.isFetchingNextPage,
    fetchNextPage: () => void participantsQuery.fetchNextPage(),
  });
  if (!quest) return null;

  // totals: the endpoint's summary once loaded, the list row's counts meanwhile
  const participantCount = summary?.participantCount ?? quest?.participantCount ?? 0;
  const completedCount = summary?.completedCount ?? quest?.completedCount ?? 0;
  const pointsPaid = summary?.pointsPaid ?? quest?.pointsPaid ?? 0;
  const completionPct =
    participantCount > 0 ? Math.round((completedCount / participantCount) * 100) : 0;

  return (
    <InstanceResultModal
      key={quest.id}
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setFilter(ALL);
      }}
      title={quest.name}
      statusLabel={QUEST_STATUS_LABELS[questStatus(quest)] ?? quest.status}
      schedule={questSchedule(quest)}
      outcome={{
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-500" />,
        title: "Completions",
        value: `${completedCount.toLocaleString()} / ${participantCount.toLocaleString()}`,
        sub: `${completionPct}% completion`,
      }}
      participantCount={participantCount}
      pointsPaid={pointsPaid}
      participants={participants?.map(toRow) ?? []}
      isLoading={participantsQuery.isPending}
      detailHead="Progress"
      filters={PARTICIPANT_FILTERS}
      filter={filter}
      onFilterChange={setFilter}
      infiniteScrollRef={loaderRef}
      isFetchingNextPage={participantsQuery.isFetchingNextPage}
      emptyLabel={
        participantsQuery.isError
          ? `Couldn't load participants: ${participantsQuery.error?.message}`
          : filter === ALL
            ? "Nobody has started this quest yet."
            : "No participants with this status."
      }
    />
  );
}
