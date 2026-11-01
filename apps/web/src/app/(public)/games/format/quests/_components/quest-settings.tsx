"use client";

import { Skeleton } from "@/components/ui/skeleton";

import { useGameRewardRule } from "@/app/_libs/hooks/api/use-admin-games";
import { CustomRetryState } from "@/components/custom/custom-retry-state";

import { GAME_FORMATS } from "../../../_libs/game-config";
import { toQuestSettingsValues } from "../_libs/quest-settings-mapper";
import { QuestListCard } from "./quest-list-card";
import { QuestPolicyCard } from "./quest-policy-cards";

const FORMAT = GAME_FORMATS.quests;

/**
 * Weekly Quests Settings tab — the Policy card (its own Edit / Cancel / Save; the page header has
 * no Save) and the quest list. No App widget card: each quest sets its banner in its create form.
 * Policy is `reward_rules['quest']` on the API (spec-12 §10.9).
 */
export function QuestSettings() {
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

  // Create Quest pre-fills from the saved defaults
  const defaults = toQuestSettingsValues(rule);

  return (
    <div className="space-y-6">
      <QuestPolicyCard rule={rule} />
      <QuestListCard
        defaults={{
          weeks: defaults.defaultWindowWeeks,
          rewardPoints: defaults.defaultRewardPoints,
        }}
        requireAll={defaults.requireAllDefault}
      />
    </div>
  );
}
