"use client";

import { useState } from "react";

import { BarChart3, Eye, type LucideIcon, Pencil, Plus, Send, Square, Trash2 } from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  type QuestAction,
  useInfiniteQuests,
  useQuestAction,
} from "@/app/_libs/hooks/api/use-admin-games";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import type { CustomAction } from "@/components/custom/custom-actions-menu";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { GlassCard } from "@/components/custom/glass-card";
import { useDialogTarget } from "@/hooks/use-dialog-target";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { type GameQuest, QuestStatusEnum } from "../../../_libs/game-types";
import { InstanceList } from "../../../_shared/instances/instance-list";
import {
  QUEST_FILTERS,
  QUEST_STATUS_LABELS,
  type QuestRowAction,
  canQuest,
  questMeta,
  questStatus,
} from "../_libs/quest-config";
import type { QuestFormDefaults } from "../_libs/quest-form-mapper";
import { QuestDetailsModal } from "./quest-details-modal";
import { QuestFormModal } from "./quest-form-modal";
import { QuestResultModal } from "./quest-result-modal";

/** Quests per page as the list scrolls. */
const QUEST_PAGE_SIZE = 20;

/** Menu label, icon and success toast per action, in menu order. */
const ROW_ACTIONS: Record<QuestRowAction, { label: string; icon: LucideIcon; done?: string }> = {
  view: { label: "View details", icon: Eye },
  results: { label: "View results", icon: BarChart3 },
  edit: { label: "Edit", icon: Pencil },
  publish: { label: "Publish", icon: Send, done: "Published" },
  end: { label: "End now", icon: Square, done: "Ended" },
  delete: { label: "Delete", icon: Trash2, done: "Deleted" },
};

/** Actions that ask first, with their copy (from what `quest.service.ts` / the repository do). */
const CONFIRM = {
  end: {
    title: "End quest?",
    description: (name: string) =>
      `“${name}” closes now and moves to Ended. Players who completed it can still claim their reward within the claim window; everyone else's progress stops.`,
    confirmLabel: "End now",
  },
  delete: {
    title: "Delete quest?",
    description: (name: string) =>
      `“${name}” is permanently deleted with all its players' progress. Anyone who completed it but hasn't claimed yet won't be paid. This can't be undone.`,
    confirmLabel: "Delete",
  },
} as const;

type ConfirmAction = keyof typeof CONFIRM;

/** A menu action that calls the backend. */
type RunAction = Exclude<QuestRowAction, "view" | "results" | "edit">;

/**
 * The backend call behind a menu action: "Publish" is `publish` on a draft and `activate` (go
 * live now) on a scheduled quest.
 */
const toBackendAction = (quest: GameQuest, action: RunAction): QuestAction =>
  action === "publish" && questStatus(quest) !== QuestStatusEnum.Draft ? "activate" : action;

interface QuestListCardProps {
  defaults: QuestFormDefaults;
  requireAll: boolean;
}

/** The quests: create, view details, and Edit / Publish / End now / Delete where allowed. */
export function QuestListCard({ defaults, requireAll }: QuestListCardProps) {
  // each tab loads its own statuses from the server, a page at a time as it scrolls
  const [tabKey, setTabKey] = useState(QUEST_FILTERS[0]?.key ?? "all");
  const tab = QUEST_FILTERS.find((f) => f.key === tabKey) ?? QUEST_FILTERS[0];
  const { questsQuery, quests, total } = useInfiniteQuests(tab?.statuses ?? "all", QUEST_PAGE_SIZE);
  const loaderRef = useInfiniteScroll({
    hasNextPage: questsQuery.hasNextPage,
    isFetchingNextPage: questsQuery.isFetchingNextPage,
    fetchNextPage: () => void questsQuery.fetchNextPage(),
  });

  const { questActionMutation } = useQuestAction();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GameQuest | null>(null);
  const confirm = useDialogTarget<{ quest: GameQuest; action: ConfirmAction }>();
  const details = useDialogTarget<GameQuest>();
  const results = useDialogTarget<GameQuest>();

  const openForm = (quest: GameQuest | null) => {
    setEditing(quest);
    setFormOpen(true);
  };

  // a confirm dialog stays open until the action succeeds; on error it stays open
  const run = (quest: GameQuest, action: RunAction) =>
    questActionMutation.mutate(
      { id: quest.id, action: toBackendAction(quest, action) },
      {
        onSuccess: () => {
          toast.success(`${ROW_ACTIONS[action].done} “${quest.name}”`);
          confirm.onOpenChange(false);
        },
        onError: (error) => toast.error(error.message),
      },
    );

  const actionsFor = (quest: GameQuest): CustomAction[] => {
    const status = questStatus(quest);
    return (Object.keys(ROW_ACTIONS) as QuestRowAction[])
      .filter((action) => canQuest(status, action))
      .map((action) => ({
        label: ROW_ACTIONS[action].label,
        icon: ROW_ACTIONS[action].icon,
        tone: action === "delete" ? ("destructive" as const) : ("default" as const),
        separatorBefore: action === "delete",
        onClick: () => {
          if (action === "view") details.show(quest);
          else if (action === "results") results.show(quest);
          else if (action === "edit") openForm(quest);
          else if (action === "end" || action === "delete") confirm.show({ quest, action });
          else run(quest, action);
        },
      }));
  };

  const busyId = questActionMutation.isPending ? questActionMutation.variables?.id : undefined;

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Quests</CardTitle>
            <CardDescription>
              Each quest defines its own rule — videos, schedule, reward and unlock threshold.
            </CardDescription>
          </div>
          <CustomButton onClick={() => openForm(null)} leftIcon={<Plus className="h-4 w-4" />}>
            Create Quest
          </CustomButton>
        </div>
      </CardHeader>
      <CardContent>
        {questsQuery.isError ? (
          <CustomRetryState
            title="Couldn't load quests"
            description={questsQuery.error?.message}
            onRetry={() => void questsQuery.refetch()}
            isRetrying={questsQuery.isFetching}
          />
        ) : (
          <InstanceList
            items={quests}
            getId={(q) => q.id}
            getTitle={(q) => q.name}
            getStatus={questStatus}
            statusLabels={QUEST_STATUS_LABELS}
            renderMeta={questMeta}
            filters={QUEST_FILTERS}
            getActions={actionsFor}
            isBusy={(q) => q.id === busyId}
            emptyLabel="No quests yet."
            filterKey={tabKey}
            onFilterChange={setTabKey}
            // only the open tab shows a count: it comes free with its list (no count requests)
            counts={{ [tabKey]: total }}
            isLoading={questsQuery.isPending}
            footer={
              <div ref={loaderRef} className="flex justify-center py-2">
                {questsQuery.isFetchingNextPage && (
                  <AiOutlineLoading3Quarters
                    className="text-muted-foreground size-4 animate-spin"
                    aria-label="Loading more quests"
                  />
                )}
              </div>
            }
          />
        )}
      </CardContent>

      <QuestDetailsModal
        quest={details.target}
        open={details.open}
        onOpenChange={details.onOpenChange}
      />
      <QuestResultModal
        quest={results.target}
        open={results.open}
        onOpenChange={results.onOpenChange}
      />
      <QuestFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        quest={editing}
        defaults={defaults}
        requireAll={requireAll}
      />
      {confirm.target && (
        <ConfirmationDialog
          open={confirm.open}
          onOpenChange={confirm.onOpenChange}
          title={CONFIRM[confirm.target.action].title}
          description={CONFIRM[confirm.target.action].description(confirm.target.quest.name)}
          action={confirm.target.action === "delete" ? "delete" : "custom"}
          confirmLabel={CONFIRM[confirm.target.action].confirmLabel}
          destructive={confirm.target.action === "delete"}
          isLoading={questActionMutation.isPending}
          onConfirm={() => confirm.target && run(confirm.target.quest, confirm.target.action)}
        />
      )}
    </GlassCard>
  );
}
