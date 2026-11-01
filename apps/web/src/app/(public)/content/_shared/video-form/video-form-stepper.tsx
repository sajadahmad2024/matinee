"use client";

import { Check, Lock } from "lucide-react";

import { cn } from "@/app/_libs/utils/cn";

import { VIDEO_FORM_STEPS, VideoFormStep, stepIndex } from "../../_libs/video-form/steps";

const STATE_CLASS = {
  active: "border-primary bg-primary/15 text-primary",
  done: "border-success/40 text-success cursor-pointer",
  open: "border-border/50 text-muted-foreground hover:text-foreground cursor-pointer",
  locked: "border-border/30 text-muted-foreground/50 cursor-not-allowed",
} as const;

type StepState = keyof typeof STATE_CLASS;

const stepState = (
  index: number,
  current: number,
  unlockedIndex: number,
  isCompleted: boolean,
): StepState => {
  if (index === current) return "active";
  if (index > unlockedIndex) return "locked";
  return isCompleted ? "done" : "open";
};

interface VideoFormStepperProps {
  step: VideoFormStep;
  /** Index of the furthest step unlocked so far; later steps can't be opened. */
  unlockedIndex: number;
  /** Steps whose fields passed when last left. */
  completedSteps: ReadonlySet<VideoFormStep>;
  onStepChange: (step: VideoFormStep) => void;
}

/** Step pills — completed and unlocked steps can be reopened; later ones stay locked. */
export function VideoFormStepper({
  step,
  unlockedIndex,
  completedSteps,
  onStepChange,
}: VideoFormStepperProps) {
  const current = stepIndex(step);

  return (
    <nav aria-label="Wizard steps" className="flex flex-wrap items-center gap-2">
      {VIDEO_FORM_STEPS.map(({ key, label, icon: Icon }, i) => {
        const state = stepState(i, current, unlockedIndex, completedSteps.has(key));
        const StateIcon = state === "done" ? Check : state === "locked" ? Lock : Icon;
        return (
          <button
            key={key}
            type="button"
            disabled={state === "locked"}
            aria-current={state === "active" ? "step" : undefined}
            onClick={() => onStepChange(key)}
            className={cn(
              "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors",
              STATE_CLASS[state],
            )}>
            <StateIcon className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {i + 1}. {label}
            </span>
            <span className="sm:hidden">{i + 1}</span>
          </button>
        );
      })}
    </nav>
  );
}
