"use client";

import { useState } from "react";

import { Award, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import {
  useConfirmResolvePrediction,
  usePrediction,
  usePredictionEntries,
  usePreviewResolvePrediction,
} from "@/app/_libs/hooks/api/use-admin-games";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomModal } from "@/components/custom/custom-modal";

import type { GamePrediction, PredictionResolvePreviewResultDto } from "../../../_libs/game-types";

interface PredictionResolveModalProps {
  /** The last prediction opened; kept after closing so the modal can animate out. */
  prediction: GamePrediction | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * Resolves a locked prediction in the backend's two steps (R-PR3): pick the correct option and
 * preview the payout, then confirm to pay the winners. The backend refuses the confirm until the
 * prediction's hold has passed, after the preview expires, and — for payouts over the engine's
 * multiplier limit — from the admin who previewed it; the error shows as a toast.
 */
export function PredictionResolveModal({
  prediction,
  open,
  onOpenChange,
}: PredictionResolveModalProps) {
  // `limit: 1`: just the summary, for the participant count
  const { summary } = usePredictionEntries(open ? prediction?.id : undefined, undefined, 1);
  if (!prediction) return null;
  const participants = summary?.participantCount;
  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      size="md"
      appearance="default"
      className="border-border bg-card"
      titleClassName="flex items-center gap-2"
      title={
        <>
          <Award className="h-5 w-5 text-emerald-500" />
          Resolve prediction
        </>
      }
      description={
        participants === undefined
          ? prediction.question
          : `${prediction.question} · ${participants.toLocaleString()} participant${participants === 1 ? "" : "s"}`
      }>
      {/* keyed: a new prediction starts from an empty pick */}
      <ResolveSteps
        key={prediction.id}
        prediction={prediction}
        onDone={() => onOpenChange(false)}
      />
    </CustomModal>
  );
}

function ResolveSteps({ prediction, onDone }: { prediction: GamePrediction; onDone: () => void }) {
  const { prediction: detail } = usePrediction(prediction.id);
  // on the list row (undeclared on the DTO, see `PredictionRecordFields`)
  const holdMinutes = prediction?.resolveHoldMinutes ?? 0;
  const { previewResolveMutation } = usePreviewResolvePrediction();
  const { confirmResolveMutation } = useConfirmResolvePrediction();
  const [correctOptionId, setCorrectOptionId] = useState("");
  const [preview, setPreview] = useState<PredictionResolvePreviewResultDto | null>(null);

  const onError = (error: Error) => toast.error(error.message);

  const previewPayout = () =>
    previewResolveMutation.mutate(
      { id: prediction.id, correctOptionId },
      { onSuccess: (result) => setPreview(result ?? null), onError },
    );

  const confirm = () =>
    preview &&
    confirmResolveMutation.mutate(
      { id: prediction.id, previewToken: preview.previewToken },
      {
        onSuccess: (result) => {
          toast.success(
            `Resolved “${prediction.question}” — ${(result?.correctCount ?? 0).toLocaleString()} winners paid.`,
          );
          onDone();
        },
        onError,
      },
    );

  return (
    <>
      <div className="space-y-2">
        <p className="text-muted-foreground text-sm">
          Select the correct outcome — winners get the multiplier payout.
        </p>
        {!detail
          ? Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="bg-muted/20 h-11 w-full rounded-lg" />
            ))
          : detail?.options?.map((option) => {
              const selected = correctOptionId === option.id;
              return (
                <button
                  key={option?.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  disabled={!!preview}
                  onClick={() => setCorrectOptionId(option.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                    selected
                      ? "border-emerald-500 bg-emerald-500/10"
                      : "border-border hover:bg-muted/30",
                  )}>
                  <CheckCircle2
                    className={cn(
                      "h-4 w-4",
                      selected ? "text-emerald-500" : "text-muted-foreground",
                    )}
                  />
                  {option.label}
                </button>
              );
            })}
      </div>

      {preview && (
        <div className="border-border bg-muted/20 mt-4 space-y-1 rounded-lg border p-3 text-sm">
          <p className="text-foreground font-medium">Confirm the payout</p>
          <p className="text-muted-foreground">
            {(preview?.correctCount ?? 0).toLocaleString()} of{" "}
            {(preview?.entries ?? 0).toLocaleString()} entries are correct —{" "}
            {(preview?.totalPayout ?? 0).toLocaleString()} pts will be paid.
          </p>
          {holdMinutes > 0 && (
            <p className="text-muted-foreground text-xs">
              This prediction has a {holdMinutes}-minute hold: confirm opens {holdMinutes} min after
              the preview.
            </p>
          )}
        </div>
      )}

      <div className="mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <CustomButton
          variant="outline"
          onClick={preview ? () => setPreview(null) : onDone}
          disabled={confirmResolveMutation.isPending}>
          {preview ? "Back" : "Cancel"}
        </CustomButton>
        {preview ? (
          <CustomButton
            onClick={confirm}
            isLoading={confirmResolveMutation.isPending}
            loadingText="Paying...">
            Confirm &amp; pay winners
          </CustomButton>
        ) : (
          <CustomButton
            onClick={previewPayout}
            disabled={!correctOptionId}
            isLoading={previewResolveMutation.isPending}
            loadingText="Previewing...">
            Preview payout
          </CustomButton>
        )}
      </div>
    </>
  );
}
