"use client";

import type { ComponentType } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ArrowLeft } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";

import { Form } from "@/components/ui/form";

import type { ContentCreateFormValues } from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";

import { VideoFormContext } from "../../_libs/video-form/context";
import type { VideoFormSteps } from "../../_libs/video-form/hooks/use-video-form-steps";
import type { VideoMediaUploads } from "../../_libs/video-form/hooks/use-video-media-uploads";
import { VideoFormStep } from "../../_libs/video-form/steps";
import { CONTENT_ROUTES } from "../content-config";
import { SponsorshipCard } from "./ad-sales/sponsorship-card";
import { DetailsSuggestionsCard } from "./details/details-suggestions-card";
import { VideoDetailsCard } from "./details/video-details-card";
import { ContentClassificationCard } from "./distribution/content-classification-card";
import { MediaUploadCard } from "./media/media-upload-card";
import { LicensingCard } from "./rights/licensing-card";
import { VideoFormFooter } from "./video-form-footer";
import { VideoFormStepper } from "./video-form-stepper";

function DetailsStep() {
  return (
    <>
      <VideoDetailsCard />
      <DetailsSuggestionsCard />
    </>
  );
}

/** One focused step at a time. Games are configured in Game Management — not here. */
const STEP_PANELS: Record<VideoFormStep, ComponentType> = {
  [VideoFormStep.Details]: DetailsStep,
  [VideoFormStep.Rights]: LicensingCard,
  [VideoFormStep.Media]: MediaUploadCard,
  [VideoFormStep.Distribution]: ContentClassificationCard,
  [VideoFormStep.AdSales]: SponsorshipCard,
};

interface VideoFormShellProps {
  form: UseFormReturn<ContentCreateFormValues>;
  steps: VideoFormSteps;
  /** The saved video's id (`null` until the add flow's first save). */
  contentId: string | null;
  /** The page's Media step uploads (`useVideoMediaUploads`). */
  media: VideoMediaUploads;
  title: React.ReactNode;
  subtitle?: string;
  /** Footer buttons — each page owns what they do. */
  actions: React.ReactNode;
  /** The current step is saving on Next. */
  isNextLoading?: boolean;
  /** Page-owned extras rendered inside the form (e.g. modals). */
  children?: React.ReactNode;
}

/**
 * Wizard UI shared by add and edit: header, stepper, the current step's cards and the sticky
 * footer. It holds no save logic — the page passes its form, step state and actions.
 */
export function VideoFormShell({
  form,
  steps,
  contentId,
  media,
  title,
  subtitle,
  actions,
  isNextLoading,
  children,
}: VideoFormShellProps) {
  const router = useRouter();
  const StepPanel = STEP_PANELS[steps.step];

  return (
    <Form {...form}>
      <VideoFormContext value={{ contentId, media }}>
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <CustomButton
              variant="ghost"
              size="icon"
              aria-label="Back to content"
              onClick={() => router.push(CONTENT_ROUTES.LIST as Route)}>
              <ArrowLeft className="h-5 w-5" />
            </CustomButton>
            <div>
              <h1 className="font-gaming text-foreground text-2xl font-bold">{title}</h1>
              {subtitle && <p className="text-foreground-secondary text-sm">{subtitle}</p>}
            </div>
          </div>

          <VideoFormStepper
            step={steps.step}
            unlockedIndex={steps.unlockedIndex}
            completedSteps={steps.completedSteps}
            onStepChange={steps.goToStep}
          />

          <div className="space-y-6">
            <StepPanel />
          </div>

          <VideoFormFooter
            step={steps.step}
            onBack={steps.goBack}
            onNext={steps.goNext}
            isNextLoading={isNextLoading}
            actions={actions}
          />

          {children}
        </div>
      </VideoFormContext>
    </Form>
  );
}
