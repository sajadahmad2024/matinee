"use client";

import Image from "next/image";

import { Film } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { useContentByIds } from "@/app/_libs/hooks/api/use-admin-content";
import { useQuest } from "@/app/_libs/hooks/api/use-admin-games";
import { formatDateTime24, formatDuration } from "@/app/_libs/utils/format";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { DetailRow } from "@/components/custom/detail-row";
import { StatusBadge } from "@/components/custom/status-badge";

import type { GameQuest, GameQuestDetail } from "../../../_libs/game-types";
import { QUEST_STATUS_LABELS, questStatus } from "../_libs/quest-config";

interface QuestDetailsModalProps {
  /** The last quest opened; kept after closing so the modal can animate out. */
  quest: GameQuest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A quest's setup from `GET /admin/quests/:id`: status, window, reward, unlock and the videos to
 * watch. Results are their own modal (`QuestResultModal`, "View results").
 */
export function QuestDetailsModal({ quest, open, onOpenChange }: QuestDetailsModalProps) {
  const { questQuery, quest: detail } = useQuest(open ? quest?.id : undefined);
  if (!quest) return null;

  const status = questStatus(quest);

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          {quest.name}
          <StatusBadge
            status={status}
            label={QUEST_STATUS_LABELS[status] ?? quest.status}
            className="text-xs"
          />
        </span>
      }
      size="lg"
      appearance="default">
      {questQuery.isError ? (
        <CustomRetryState
          title="Couldn't load the quest"
          description={questQuery.error?.message}
          onRetry={() => void questQuery.refetch()}
          isRetrying={questQuery.isFetching}
        />
      ) : !detail ? (
        <Skeleton className="bg-muted/20 h-[360px] w-full rounded-lg" />
      ) : (
        <QuestDetailsBody quest={detail} />
      )}
    </CustomModal>
  );
}

function QuestDetailsBody({ quest }: { quest: GameQuestDetail }) {
  // the form saves one "watch" action; its target says whether every video is needed
  const watch = quest.actions?.[0];
  const videoIds = watch?.curatedContentIds ?? [];
  const { contents, isPending, failedCount } = useContentByIds(videoIds);
  const target = watch?.target ?? videoIds.length;
  const rule =
    videoIds.length <= 1 || target >= videoIds.length
      ? `Watch all ${videoIds.length}`
      : `Watch any ${target} of ${videoIds.length}`;

  return (
    <div className="space-y-6 py-2">
      {quest?.bannerUrl && (
        <div className="border-border/50 relative aspect-[16/7] overflow-hidden rounded-lg border">
          <Image
            src={quest.bannerUrl}
            alt={`${quest?.name} banner`}
            fill
            unoptimized
            sizes="640px"
            className="object-cover"
          />
        </div>
      )}
      {quest.description && <p className="text-muted-foreground text-sm">{quest.description}</p>}

      <dl>
        <DetailRow label="Starts">{formatDateTime24(quest.startAt)}</DetailRow>
        <DetailRow label="Ends">{formatDateTime24(quest.endAt)}</DetailRow>
        <DetailRow label="Reward">{quest.rewardPoints?.toLocaleString()} pts</DetailRow>
        <DetailRow label="Unlock requirement">
          {quest.unlockThresholdPoints
            ? `${quest.unlockThresholdPoints.toLocaleString()} pts earned`
            : "Open to everyone"}
        </DetailRow>
        <DetailRow label="Players">
          {(quest?.participantCount ?? 0).toLocaleString()} started ·{" "}
          {(quest?.completedCount ?? 0).toLocaleString()} completed
        </DetailRow>
        <DetailRow label="Points paid">{(quest?.pointsPaid ?? 0).toLocaleString()} pts</DetailRow>
        {quest.claimGraceDays != null && (
          <DetailRow label="Claim window">
            {quest.claimGraceDays} day{quest.claimGraceDays === 1 ? "" : "s"} after it ends
          </DetailRow>
        )}
      </dl>

      <section className="space-y-2">
        <h4 className="text-foreground text-sm font-semibold">
          Videos to watch <span className="text-muted-foreground font-normal">· {rule}</span>
        </h4>
        {isPending ? (
          <Skeleton className="bg-muted/20 h-24 w-full rounded-md" />
        ) : (
          <ul className="border-border/40 divide-border/40 divide-y rounded-lg border">
            {contents?.map((video) => (
              <li key={video?.id} className="flex items-center gap-3 p-2 text-sm">
                <Film className="text-muted-foreground h-4 w-4" />
                <span className="flex-1">{video?.title}</span>
                <span className="text-muted-foreground text-xs">
                  {formatDuration(video?.durationSeconds)}
                </span>
              </li>
            ))}
            {failedCount > 0 && (
              <li className="text-muted-foreground p-2 text-xs">
                {failedCount} video{failedCount === 1 ? "" : "s"} couldn&apos;t be loaded (removed
                from the library?)
              </li>
            )}
          </ul>
        )}
      </section>
    </div>
  );
}
