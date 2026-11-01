"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { useGameRewardRule } from "@/app/_libs/hooks/api/use-admin-games";
import { CustomRetryState } from "@/components/custom/custom-retry-state";

import { GAME_FORMATS } from "../../../_libs/game-config";
import { toPredictionSettingsValues } from "../_libs/prediction-settings-mapper";
import { PredictionListCard } from "./prediction-list-card";
import { PredictionPolicyCard } from "./prediction-policy-cards";

const FORMAT = GAME_FORMATS.predictive;

/**
 * Predictive Settings tab — the Policy card (its own Edit / Cancel / Save; the page header has no
 * Save) and the prediction list. Policy is `reward_rules['prediction']` on the API (spec-12 §10.10).
 */
export function PredictionSettings() {
  const { ruleQuery, rule } = useGameRewardRule(FORMAT.ruleKey);
  if (ruleQuery.isError) {
    return (
      <CustomRetryState
        title={`Couldn't load ${FORMAT.name} settings`}
        description={ruleQuery.error?.message}
        onRetry={() => void ruleQuery.refetch()}
        isRetrying={ruleQuery.isFetching}
      />
    );
  }
  if (!rule) return <Skeleton className="bg-muted/20 h-[600px] w-full rounded-xl" />;

  // Create Prediction pre-fills from the saved defaults
  const defaults = toPredictionSettingsValues(rule);

  return (
    <div className="space-y-6">
      <PredictionPolicyCard rule={rule} />
      <PredictionListCard
        defaults={{
          cadence: defaults.defaultCadence,
          entryCostPoints: defaults.defaultEntryCostPoints,
          payoutMultiplier: defaults.defaultPayoutMultiplier,
          rewardPoints: defaults.defaultRewardPoints,
        }}
      />
    </div>
  );
}
