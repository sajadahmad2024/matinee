"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

import { CustomButton } from "@/components/custom/custom-button";

import { VIDEO_FORM_STEPS, VideoFormStep, stepIndex } from "../../_libs/video-form/steps";

interface VideoFormFooterProps {
  step: VideoFormStep;
  onBack: () => void;
  /** Validates (and saves) the current step before moving on. */
  onNext: () => void;
  isNextLoading?: boolean;
  /** The page's own save actions (add and edit differ). */
  actions: React.ReactNode;
}

/** Sticky footer — step navigation plus the page's actions, reachable at any form length. */
export function VideoFormFooter({
  step,
  onBack,
  onNext,
  isNextLoading,
  actions,
}: VideoFormFooterProps) {
  const index = stepIndex(step);
  const isLastStep = index === VIDEO_FORM_STEPS.length - 1;

  return (
    <div className="bg-background/95 border-border/50 sticky bottom-0 z-20 -mx-6 flex flex-wrap items-center justify-between gap-3 border-t px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-2">
        <CustomButton
          variant="outline"
          size="sm"
          disabled={index === 0 || isNextLoading}
          onClick={onBack}
          leftIcon={<ArrowLeft className="h-4 w-4" />}>
          Back
        </CustomButton>
        {isLastStep ? (
          <span className="text-muted-foreground text-xs">Final step — ready to publish</span>
        ) : (
          <CustomButton
            size="sm"
            onClick={onNext}
            isLoading={isNextLoading}
            loadingText="Saving…"
            rightIcon={<ArrowRight className="h-4 w-4" />}>
            Next
          </CustomButton>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">{actions}</div>
    </div>
  );
}
