"use client";

import { useFormContext } from "react-hook-form";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import type { SharedContentSettingsValues } from "@/app/_libs/schemas/games";
import { CustomField } from "@/components/custom/custom-field";
import { GlassCard } from "@/components/custom/glass-card";

import { BehaviourRewardsField } from "../../../_shared/settings/behaviour-rewards-field";

/** Empty → `undefined`, so validation reports it instead of saving 0. */
const toNumber = (value: string) => (value === "" ? undefined : Number(value));

/** What each kind of share pays, and the daily cap. Fields of the Shared Content settings form. */
export function SharingRewardCard() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SharedContentSettingsValues>();

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-base">Sharing reward</CardTitle>
        <CardDescription>
          Autonomous &amp; predictable — a fixed reward per share, capped per day to prevent
          farming.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <CustomField label="Sharing behaviours">
          <BehaviourRewardsField addLabel="Add share behaviour" />
        </CustomField>

        <CustomField
          label="Daily share cap"
          htmlFor="share-daily-cap"
          error={errors?.dailyShareCap?.message}
          helperText="Max rewarded shares per user per day.">
          <Input
            id="share-daily-cap"
            type="number"
            min={0}
            {...register("dailyShareCap", { setValueAs: toNumber })}
          />
        </CustomField>

        <p className="text-muted-foreground text-xs">
          Saved as <code>reward_rules[&apos;shared_content&apos;]</code>: <code>behaviours[]</code>{" "}
          (each fixed points), <code>daily_share_cap</code>.
        </p>
      </CardContent>
    </GlassCard>
  );
}
