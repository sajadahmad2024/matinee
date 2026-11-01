"use client";

import { useState } from "react";

import {
  BarChart3,
  Eye,
  Gavel,
  type LucideIcon,
  Pencil,
  Plus,
  RotateCcw,
  Send,
  Trash2,
  Undo2,
} from "lucide-react";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import {
  type PredictionAction,
  useInfinitePredictions,
  usePredictionAction,
  useUpdatePrediction,
} from "@/app/_libs/hooks/api/use-admin-games";
import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";
import type { CustomAction } from "@/components/custom/custom-actions-menu";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { GlassCard } from "@/components/custom/glass-card";
import { useDialogTarget } from "@/hooks/use-dialog-target";
import { useInfiniteScroll } from "@/hooks/use-infinite-scroll";

import { type GamePrediction, PredictionStatusEnum } from "../../../_libs/game-types";
import { InstanceList } from "../../../_shared/instances/instance-list";
import {
  PREDICTION_FILTERS,
  PREDICTION_STATUS_LABELS,
  type PredictionRowAction,
  canPrediction,
  predictionSchedule,
  predictionStakes,
  predictionStatus,
} from "../_libs/prediction-config";
import { type PredictionFormDefaults, goLiveNowWindow } from "../_libs/prediction-form-mapper";
import { PredictionDetailsModal } from "./prediction-details-modal";
import { PredictionFormModal } from "./prediction-form-modal";
import { PredictionResolveModal } from "./prediction-resolve-modal";
import { PredictionResultModal } from "./prediction-result-modal";

/** Predictions per page as the list scrolls. */
const PREDICTION_PAGE_SIZE = 20;

/** Menu label, icon and success toast per action, in menu order. */
const ROW_ACTIONS: Record<PredictionRowAction, { label: string; icon: LucideIcon; done?: string }> =
  {
    view: { label: "View details", icon: Eye },
    results: { label: "View results", icon: BarChart3 },
    edit: { label: "Edit", icon: Pencil },
    publish: { label: "Publish", icon: Send, done: "Published" },
    resolve: { label: "Resolve / settle", icon: Gavel },
    void: { label: "Cancel & refund", icon: Undo2, done: "Cancelled" },
    reverse: { label: "Reverse resolution", icon: RotateCcw, done: "Reversed" },
    delete: { label: "Delete", icon: Trash2, done: "Deleted" },
  };

/** Actions that ask first, with their copy (from what `prediction.service.ts` does). */
const CONFIRM = {
  void: {
    title: "Cancel prediction?",
    description: (q: string) =>
      `“${q}” closes without an outcome and every player's entry cost is refunded. It moves to Cancelled. This can't be undone.`,
    confirmLabel: "Cancel & refund",
  },
  reverse: {
    title: "Reverse resolution?",
    description: (q: string) =>
      `The payout for “${q}” is clawed back from its winners and it returns to Awaiting result, ready to resolve again. It must be done by a different admin from the one who confirmed it.`,
    confirmLabel: "Reverse",
  },
  delete: {
    title: "Delete prediction?",
    description: (q: string) =>
      `“${q}” is permanently deleted before it opens. This can't be undone.`,
    confirmLabel: "Delete",
  },
} as const;

type ConfirmAction = keyof typeof CONFIRM;

/** A menu action that calls the backend straight from the row menu or its confirmation. */
type RunAction = Exclude<PredictionRowAction, "view" | "results" | "edit" | "resolve">;

const isConfirmAction = (action: RunAction): action is ConfirmAction => action in CONFIRM;

/**
 * The predictions, with the quest list's menu — View details, View results, Edit, Publish, Delete —
 * plus Resolve, Cancel & refund and Reverse where the backend allows them.
 */
export function PredictionListCard({ defaults }: { defaults: PredictionFormDefaults }) {
  // each tab loads its own statuses from the server, a page at a time as it scrolls
  const [tabKey, setTabKey] = useState(PREDICTION_FILTERS[0]?.key ?? "all");
  const tab = PREDICTION_FILTERS.find((f) => f.key === tabKey) ?? PREDICTION_FILTERS[0];
  const { predictionsQuery, predictions, total } = useInfinitePredictions(
    tab?.statuses ?? "all",
    PREDICTION_PAGE_SIZE,
  );
  const loaderRef = useInfiniteScroll({
    hasNextPage: predictionsQuery.hasNextPage,
    isFetchingNextPage: predictionsQuery.isFetchingNextPage,
    fetchNextPage: () => void predictionsQuery.fetchNextPage(),
  });

  const { predictionActionMutation } = usePredictionAction();
  const { updatePredictionMutation } = useUpdatePrediction();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<GamePrediction | null>(null);
  const details = useDialogTarget<GamePrediction>();
  const results = useDialogTarget<GamePrediction>();
  const resolve = useDialogTarget<GamePrediction>();
  const confirm = useDialogTarget<{ prediction: GamePrediction; action: ConfirmAction }>();

  const openForm = (prediction: GamePrediction | null) => {
    setEditing(prediction);
    setFormOpen(true);
  };

  // a confirm dialog stays open until the action succeeds; on error it stays open
  const run = (prediction: GamePrediction, action: RunAction) => {
    const onError = (error: Error) => toast.error(error.message);
    // "Publish" on a scheduled prediction moves its start to now (no activate endpoint); the
    // backend's scheduler opens it within a minute
    if (action === "publish" && predictionStatus(prediction) === PredictionStatusEnum.Scheduled) {
      updatePredictionMutation.mutate(
        { id: prediction.id, dto: goLiveNowWindow(prediction) },
        {
          onSuccess: () => toast.success(`“${prediction.question}” goes live within a minute`),
          onError,
        },
      );
      return;
    }
    predictionActionMutation.mutate(
      { id: prediction.id, action: action satisfies PredictionAction },
      {
        onSuccess: () => {
          toast.success(`${ROW_ACTIONS[action].done} “${prediction.question}”`);
          confirm.onOpenChange(false);
        },
        onError,
      },
    );
  };

  const actionsFor = (prediction: GamePrediction): CustomAction[] => {
    const status = predictionStatus(prediction);
    return (Object.keys(ROW_ACTIONS) as PredictionRowAction[])
      .filter((action) => canPrediction(status, action))
      .map((action) => ({
        label: ROW_ACTIONS[action].label,
        icon: ROW_ACTIONS[action].icon,
        tone:
          action === "delete" || action === "void"
            ? ("destructive" as const)
            : ("default" as const),
        separatorBefore: action === "delete",
        onClick: () => {
          if (action === "view") details.show(prediction);
          else if (action === "results") results.show(prediction);
          else if (action === "edit") openForm(prediction);
          else if (action === "resolve") resolve.show(prediction);
          else if (isConfirmAction(action)) confirm.show({ prediction, action });
          else run(prediction, action);
        },
      }));
  };

  const busyId = predictionActionMutation.isPending
    ? predictionActionMutation.variables?.id
    : updatePredictionMutation.isPending
      ? updatePredictionMutation.variables?.id
      : undefined;
  const pending = confirm.target ? CONFIRM[confirm.target.action] : null;

  return (
    <GlassCard>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">Predictions</CardTitle>
            <CardDescription>
              Each prediction defines its own rule — question, options, entry cost, multiplier,
              schedule and unlock threshold.
            </CardDescription>
          </div>
          <CustomButton onClick={() => openForm(null)} leftIcon={<Plus className="h-4 w-4" />}>
            Create Prediction
          </CustomButton>
        </div>
      </CardHeader>
      <CardContent>
        {predictionsQuery.isError ? (
          <CustomRetryState
            title="Couldn't load predictions"
            description={predictionsQuery.error?.message}
            onRetry={() => void predictionsQuery.refetch()}
            isRetrying={predictionsQuery.isFetching}
          />
        ) : (
          // TODO(spec-12 §10.10): players / winners in the row meta once `PredictionDto` carries
          // `participantCount` / `correctCount` (the results endpoint has them per prediction)
          <InstanceList
            items={predictions}
            getId={(p) => p.id}
            getTitle={(p) => p.question}
            getStatus={predictionStatus}
            statusLabels={PREDICTION_STATUS_LABELS}
            renderMeta={(p) => `${predictionSchedule(p)} · ${predictionStakes(p)}`}
            filters={PREDICTION_FILTERS}
            getActions={actionsFor}
            onView={details.show}
            isBusy={(p) => p.id === busyId}
            emptyLabel="No predictions yet."
            filterKey={tabKey}
            onFilterChange={setTabKey}
            // only the open tab shows a count: it comes free with its list (no count requests)
            counts={{ [tabKey]: total }}
            isLoading={predictionsQuery.isPending}
            footer={
              <div ref={loaderRef} className="flex justify-center py-2">
                {predictionsQuery.isFetchingNextPage && (
                  <AiOutlineLoading3Quarters
                    className="text-muted-foreground size-4 animate-spin"
                    aria-label="Loading more predictions"
                  />
                )}
              </div>
            }
          />
        )}
      </CardContent>

      <PredictionDetailsModal
        prediction={details.target}
        open={details.open}
        onOpenChange={details.onOpenChange}
      />
      <PredictionFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        prediction={editing}
        defaults={defaults}
      />
      <PredictionResultModal
        prediction={results.target}
        open={results.open}
        onOpenChange={results.onOpenChange}
      />
      <PredictionResolveModal
        prediction={resolve.target}
        open={resolve.open}
        onOpenChange={resolve.onOpenChange}
      />
      {confirm.target && pending && (
        <ConfirmationDialog
          open={confirm.open}
          onOpenChange={confirm.onOpenChange}
          title={pending.title}
          description={pending.description(confirm.target.prediction.question)}
          action={confirm.target.action === "delete" ? "delete" : "custom"}
          confirmLabel={pending.confirmLabel}
          destructive={confirm.target.action === "delete" || confirm.target.action === "void"}
          isLoading={predictionActionMutation.isPending}
          onConfirm={() => confirm.target && run(confirm.target.prediction, confirm.target.action)}
        />
      )}
    </GlassCard>
  );
}
