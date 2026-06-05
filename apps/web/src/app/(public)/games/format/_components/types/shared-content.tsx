"use client";

import { useState } from "react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { GamificationExtras } from "../shared/gamification-extras";
import { RewardAmounts } from "../shared/reward-amounts";

export function SharedContentSettings() {
  // Maps 1:1 to reward_rules['shared_content'].config
  const [pointsPerShare, setPointsPerShare] = useState(15);
  const [xpPerShare, setXpPerShare] = useState(5);
  const [dailyCap, setDailyCap] = useState(3);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Sharing reward</CardTitle>
          <CardDescription>
            Autonomous &amp; predictable — a fixed reward per share, capped per day to prevent
            farming.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <RewardAmounts
            points={pointsPerShare}
            xp={xpPerShare}
            onPoints={setPointsPerShare}
            onXp={setXpPerShare}
            pointsLabel="Points per share"
            xpLabel="XP per share"
          />

          <div className="space-y-2">
            <Label>Daily share cap</Label>
            <Input
              type="number"
              min={0}
              value={dailyCap}
              onChange={(e) => setDailyCap(Number(e.target.value))}
            />
            <p className="text-muted-foreground text-xs">
              Max rewarded shares per user per day.
            </p>
          </div>

          <p className="text-muted-foreground text-xs">
            Saved as <code>reward_rules['shared_content']</code>: <code>points_per_share</code>,{" "}
            <code>xp_per_share</code>, <code>daily_share_cap</code>.
          </p>
        </CardContent>
      </GlassCard>

      <AppWidgetCard gameTypeName="Shared Content" defaultCta="Share &amp; earn" />
    </div>
  );
}

export function SharedContentGamification() {
  return (
    <GamificationExtras
      badges={[{ name: "Social Butterfly", requirement: "Refer 5 friends who finish a game" }]}
      initialLocked={[{ id: "l1", name: "Referral leaderboard perks", threshold: 1500 }]}
    />
  );
}
