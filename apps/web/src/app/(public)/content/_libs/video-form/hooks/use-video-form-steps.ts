"use client";

import { useState } from "react";

import type { FieldErrors, UseFormTrigger } from "react-hook-form";
import { toast } from "sonner";

import type { ContentCreateFormValues } from "@/app/_libs/schemas";

import { VIDEO_FORM_STEPS, VideoFormStep, firstStepWithError, stepIndex } from "../steps";

const LAST_INDEX = VIDEO_FORM_STEPS.length - 1;

interface UseVideoFormStepsOptions {
  trigger: UseFormTrigger<ContentCreateFormValues>;
  /** Open every step from the start — an existing video has nothing left to unlock. */
  allUnlocked?: boolean;
  /** Saves a step before moving forward from it; call `proceed` once it's saved. */
  saveStep?: (step: VideoFormStep, proceed: () => void) => void;
}

/**
 * Wizard navigation shared by add and edit: Next validates the current step's fields and
 * unlocks the following one; the stepper can go back freely, forward only to unlocked steps.
 */
export function useVideoFormSteps({
  trigger,
  allUnlocked = false,
  saveStep,
}: UseVideoFormStepsOptions) {
  const [step, setStep] = useState<VideoFormStep>(VideoFormStep.Details);
  const [unlockedIndex, setUnlockedIndex] = useState(allUnlocked ? LAST_INDEX : 0);
  // Steps whose fields passed when last left — the stepper shows them done. An existing video
  // starts with every step done.
  const [completedSteps, setCompletedSteps] = useState<ReadonlySet<VideoFormStep>>(
    () => new Set(allUnlocked ? VIDEO_FORM_STEPS.map((s) => s.key) : []),
  );

  const currentIndex = stepIndex(step);

  /** Checks the fields the current step owns; a step without fields always passes. */
  const validateStep = async () => {
    const { fields } = VIDEO_FORM_STEPS[currentIndex];
    if (!fields.length || (await trigger(fields, { shouldFocus: true }))) return true;
    toast.error("Complete this step before continuing");
    return false;
  };

  const markCompleted = (target: VideoFormStep, isCompleted: boolean) =>
    setCompletedSteps((previous) => {
      const next = new Set(previous);
      if (isCompleted) next.add(target);
      else next.delete(target);
      return next;
    });

  /** Moving forward: validate, save (if the page saves this step), then move. */
  const leaveForward = async (proceed: () => void) => {
    if (!(await validateStep())) return;
    const done = () => {
      markCompleted(step, true);
      proceed();
    };
    if (saveStep) saveStep(step, done);
    else done();
  };

  /**
   * Moving back is never blocked, but the step left behind is re-checked so its pill shows
   * whether it's complete — this is how the last step (no Next) turns done.
   */
  const leaveBackward = (target: VideoFormStep) => {
    const { key, fields } = VIDEO_FORM_STEPS[currentIndex];
    setStep(target);
    if (!fields.length) return markCompleted(key, true);
    void trigger(fields).then((isValid) => markCompleted(key, isValid));
  };

  const goNext = () =>
    leaveForward(() => {
      const nextIndex = currentIndex + 1;
      setUnlockedIndex((unlocked) => Math.max(unlocked, nextIndex));
      setStep(VIDEO_FORM_STEPS[nextIndex].key);
    });

  const goBack = () => leaveBackward(VIDEO_FORM_STEPS[Math.max(currentIndex - 1, 0)].key);

  /** Stepper jump: back is free; forward only to an unlocked step, saving the current one first. */
  const goToStep = (target: VideoFormStep) => {
    const targetIndex = stepIndex(target);
    if (targetIndex > unlockedIndex) return;
    if (targetIndex > currentIndex) return leaveForward(() => setStep(target));
    if (targetIndex < currentIndex) leaveBackward(target);
  };

  /** A full-form save failed — open the first step owning an invalid field. */
  const showFirstError = (errors: FieldErrors<ContentCreateFormValues>) => {
    setStep(firstStepWithError(Object.keys(errors)));
    toast.error("Fix the highlighted fields before saving");
  };

  return {
    step,
    unlockedIndex,
    completedSteps,
    /** On the last step, having passed every earlier one. */
    allStepsDone: currentIndex === LAST_INDEX && unlockedIndex === LAST_INDEX,
    goNext,
    goBack,
    goToStep,
    showFirstError,
  };
}

export type VideoFormSteps = ReturnType<typeof useVideoFormSteps>;
