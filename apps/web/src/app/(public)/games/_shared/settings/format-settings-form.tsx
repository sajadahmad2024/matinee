"use client";

import type { ReactNode } from "react";

import {
  type FieldValues,
  FormProvider,
  type SubmitHandler,
  type UseFormReturn,
} from "react-hook-form";
import { toast } from "sonner";

import { Skeleton } from "@/components/ui/skeleton";

import { CustomRetryState } from "@/components/custom/custom-retry-state";

import type { GameFormat } from "../../_libs/game-config";
import type {
  ProposedGameWidgetDto,
  RewardRuleDto,
  UpdateRewardRuleDto,
} from "../../_libs/game-types";
import {
  useGameWidget,
  useRewardRule,
  useUpdateGameWidget,
  useUpdateRewardRule,
} from "../../_libs/use-games";
import { FORMAT_SETTINGS_FORM_ID } from "./format-settings-id";

/** What every format's Settings tab edits: its reward rule and app widget. */
export interface FormatSettingsData {
  rule: RewardRuleDto;
  widget: ProposedGameWidgetDto;
}

/** Loads a format's settings; renders `children` once both are in. */
export function FormatSettingsLoader({
  format,
  children,
}: {
  format: GameFormat;
  children: (data: FormatSettingsData) => ReactNode;
}) {
  const { ruleQuery, rule } = useRewardRule(format.ruleKey);
  const { widgetQuery, widget } = useGameWidget(format.ruleKey);

  const failed = [ruleQuery, widgetQuery].find((q) => q.isError);
  if (failed) {
    return (
      <CustomRetryState
        title={`Couldn't load ${format.name} settings`}
        description={failed.error?.message}
        onRetry={() => {
          void ruleQuery.refetch();
          void widgetQuery.refetch();
        }}
      />
    );
  }
  if (!rule || !widget) {
    return <Skeleton className="bg-muted/20 h-[600px] w-full rounded-xl" />;
  }
  return children({ rule, widget });
}

/**
 * Loads only a format's reward rule — for tabs without an App widget card (Weekly Quests,
 * Predictions: each instance sets its banner in its own create form).
 */
export function FormatRuleLoader({
  format,
  children,
}: {
  format: GameFormat;
  children: (rule: RewardRuleDto) => ReactNode;
}) {
  const { ruleQuery, rule } = useRewardRule(format.ruleKey);
  if (ruleQuery.isError) {
    return (
      <CustomRetryState
        title={`Couldn't load ${format.name} settings`}
        description={ruleQuery.error?.message}
        onRetry={() => void ruleQuery.refetch()}
        isRetrying={ruleQuery.isFetching}
      />
    );
  }
  if (!rule) return <Skeleton className="bg-muted/20 h-[600px] w-full rounded-xl" />;
  return children(rule);
}

/** The widget fields as the form edits them. */
export const toWidgetValues = (widget: ProposedGameWidgetDto) => ({
  bannerUrl: widget.bannerUrl,
  ctaLabel: widget.ctaLabel,
  style: widget.style,
  accent: widget.accent,
  visible: widget.visible,
});

/** Saves a format's settings — its rule, and its widget when the tab has one — and confirms. */
export function useSaveFormatSettings(format: GameFormat) {
  const { updateRuleMutation } = useUpdateRewardRule();
  const { updateWidgetMutation } = useUpdateGameWidget();

  return async (changes: {
    rule: UpdateRewardRuleDto;
    /** Left out by tabs without an App widget card (Weekly Quests, Predictions). */
    widget?: Partial<Omit<ProposedGameWidgetDto, "gameKey">>;
  }) => {
    try {
      await Promise.all([
        updateRuleMutation.mutateAsync({ ruleKey: format.ruleKey, dto: changes.rule }),
        changes.widget &&
          updateWidgetMutation.mutateAsync({ gameKey: format.ruleKey, patch: changes.widget }),
      ]);
      toast.success(`${format.name} settings saved`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Couldn't save the settings");
      return false;
    }
  };
}

/**
 * Provides the form to the tab's sections and renders the (empty) `<form>` the header's Save
 * submits — the fields live outside it because the tab also holds lists and dialogs with forms of
 * their own. Saved values become the new baseline.
 */
export function FormatSettingsForm<T extends FieldValues>({
  form,
  onSave,
  children,
}: {
  form: UseFormReturn<T>;
  /** Resolves `true` when saved. */
  onSave: (values: T) => Promise<boolean>;
  children: ReactNode;
}) {
  const submit: SubmitHandler<T> = async (values) => {
    if (await onSave(values)) form.reset(values);
  };

  return (
    <FormProvider {...form}>
      <form
        id={FORMAT_SETTINGS_FORM_ID}
        onSubmit={form.handleSubmit(submit, () => toast.error("Fix the highlighted fields"))}
        noValidate
        hidden
      />
      <div className="space-y-6">{children}</div>
    </FormProvider>
  );
}
