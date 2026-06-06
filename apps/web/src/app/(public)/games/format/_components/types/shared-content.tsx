"use client";

import { useState } from "react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { type BehaviorReward, BehaviorRewardsEditor } from "../shared/behavior-rewards-editor";
import { GamificationExtras } from "../shared/gamification-extras";

// Share behaviours pay differently (internal vs external vs referral).
const INITIAL_BEHAVIORS: BehaviorReward[] = [
  { id: "b1", label: "Internal share (to another user)", points: 3, xp: 1 },
  { id: "b2", label: "External share (off-app)", points: 15, xp: 5 },
  { id: "b3", label: "Referral completed first game", points: 100, xp: 25 },
];

export function SharedContentSettings() {
  // Maps 1:1 to reward_rules['shared_content'].config
  const [behaviors, setBehaviors] = useState<BehaviorReward[]>(INITIAL_BEHAVIORS);
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
          <div className="space-y-2">
            <Label>Sharing behaviours</Label>
            <BehaviorRewardsEditor
              behaviors={behaviors}
              onChange={setBehaviors}
              addLabel="Add share behaviour"
            />
          </div>

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
            Saved as <code>reward_rules['shared_content']</code>: <code>behaviors[]</code> (each
            fixed points + xp), <code>daily_share_cap</code>.
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
