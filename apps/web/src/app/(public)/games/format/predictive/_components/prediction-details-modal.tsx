"use client";

import { CheckCircle2, Circle } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

import { usePrediction } from "@/app/_libs/hooks/api/use-admin-games";
import { formatDateTime24 } from "@/app/_libs/utils/format";
import { CustomModal } from "@/components/custom/custom-modal";
import { CustomRetryState } from "@/components/custom/custom-retry-state";
import { DetailRow } from "@/components/custom/detail-row";
import { StatusBadge } from "@/components/custom/status-badge";

import type { GamePrediction, GamePredictionDetail } from "../../../_libs/game-types";
import {
  PREDICTION_STATUS_LABELS,
  predictionStatus,
  predictionWindowLabel,
} from "../_libs/prediction-config";

interface PredictionDetailsModalProps {
  /** The last prediction opened; kept after closing so the modal can animate out. */
  prediction: GamePrediction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * A prediction's setup from `GET /admin/predictions/:id`: status, window, stakes, unlock and the
 * options (the correct one marked once resolved). Results are their own modal ("View results").
 */
export function PredictionDetailsModal({
  prediction,
  open,
  onOpenChange,
}: PredictionDetailsModalProps) {
  const { predictionQuery, prediction: detail } = usePrediction(open ? prediction?.id : undefined);
  if (!prediction) return null;

  const status = predictionStatus(prediction);

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title={
        <span className="flex items-center gap-2">
          {prediction.question}
          <StatusBadge
            status={status}
            label={PREDICTION_STATUS_LABELS[status] ?? prediction.status}
            className="text-xs"
          />
        </span>
      }
      size="lg"
      appearance="default">
      {predictionQuery.isError ? (
        <CustomRetryState
          title="Couldn't load the prediction"
          description={predictionQuery.error?.message}
          onRetry={() => void predictionQuery.refetch()}
          isRetrying={predictionQuery.isFetching}
        />
      ) : !detail ? (
        <Skeleton className="bg-muted/20 h-[360px] w-full rounded-lg" />
      ) : (
        // the list row carries the fields the detail DTO doesn't declare
        <PredictionDetailsBody prediction={{ ...prediction, ...detail }} />
      )}
    </CustomModal>
  );
}

function PredictionDetailsBody({ prediction }: { prediction: GamePredictionDetail }) {
  const unlock = prediction?.unlockThresholdPoints ?? 0;
  const hold = prediction?.resolveHoldMinutes ?? 0;

  return (
    <div className="space-y-6 py-2">
      {prediction?.description && (
        <p className="text-muted-foreground text-sm">{prediction.description}</p>
      )}

      <dl>
        <DetailRow label="Opens">{formatDateTime24(prediction?.startAt)}</DetailRow>
        <DetailRow label="Entries close">{formatDateTime24(prediction?.endAt)}</DetailRow>
        <DetailRow label="Cadence">{predictionWindowLabel(prediction)}</DetailRow>
        <DetailRow label="Entry cost">
          {(prediction?.entryCostPoints ?? 0).toLocaleString()} pts
        </DetailRow>
        <DetailRow label="Correct multiplier">×{prediction?.payoutMultiplier ?? 1}</DetailRow>
        <DetailRow label="Reward">{(prediction?.rewardPoints ?? 0).toLocaleString()} pts</DetailRow>
        <DetailRow label="Unlock requirement">
          {unlock ? `${unlock.toLocaleString()} pts earned` : "Open to everyone"}
        </DetailRow>
        {hold > 0 && (
          <DetailRow label="Resolve hold">{hold} min between preview and confirm</DetailRow>
        )}
      </dl>

      <section className="space-y-2">
        <h4 className="text-foreground text-sm font-semibold">Answer options</h4>
        <ul className="border-border/40 divide-border/40 divide-y rounded-lg border">
          {prediction?.options?.map((option) => {
            const correct = option?.isCorrect || option?.id === prediction?.correctOptionId;
            return (
              <li key={option?.id} className="flex items-center gap-3 p-2 text-sm">
                {correct ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                ) : (
                  <Circle className="text-muted-foreground h-4 w-4" />
                )}
                <span className="flex-1">{option?.label}</span>
                {correct && <span className="text-xs text-emerald-500">Correct</span>}
              </li>
            );
          })}
        </ul>
      </section>

      {/* TODO(spec-12 §10.10): players, winners, points paid and the entry table once the backend
          returns prediction stats and `GET /admin/predictions/:id/entries` */}
    </div>
  );
}
