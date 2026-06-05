"use client";

import { useState } from "react";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { GamificationExtras } from "../shared/gamification-extras";
import { type Milestone, MilestoneBonusEditor } from "../shared/milestone-bonus-editor";
import { RewardAmounts } from "../shared/reward-amounts";

export function DailyStreakSettings() {
  // Maps 1:1 to reward_rules['daily_streak'].config
  const [minWatchSeconds, setMinWatchSeconds] = useState(300);
  const [pointsPerDay, setPointsPerDay] = useState(10);
  const [xpPerDay, setXpPerDay] = useState(5);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: "m1", threshold: 7, bonus: 50 },
    { id: "m2", threshold: 30, bonus: 300 },
  ]);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Streak earning</CardTitle>
              <CardDescription>
                Autonomous &amp; predictable — qualify each day by watching the minimum and earn a
                fixed reward. Longer streaks pay milestone bonuses.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" /> Autonomous
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Minimum watch to qualify (seconds)</Label>
            <Input
              type="number"
              min={0}
              value={minWatchSeconds}
              onChange={(e) => setMinWatchSeconds(Number(e.target.value))}
            />
          </div>

          <RewardAmounts
            points={pointsPerDay}
            xp={xpPerDay}
            onPoints={setPointsPerDay}
            onXp={setXpPerDay}
            pointsLabel="Points per day"
            xpLabel="XP per day"
          />

          <div className="space-y-2">
            <Label>Streak milestone bonuses</Label>
            <MilestoneBonusEditor
              milestones={milestones}
              onChange={setMilestones}
              thresholdLabel="Day"
              thresholdSuffix="day streak"
            />
          </div>

          <p className="text-muted-foreground text-xs">
            Saved as <code>reward_rules['daily_streak']</code>: <code>min_watch_seconds</code>,{" "}
            <code>points_per_day</code>, <code>xp_per_day</code>, <code>bonus_thresholds</code>.
          </p>
        </CardContent>
      </GlassCard>

      <AppWidgetCard gameTypeName="Daily Streak" defaultCta="Keep your streak" />
    </div>
  );
}

export function DailyStreakGamification() {
  return (
    <GamificationExtras
      badges={[
        { name: "Streak Champion", requirement: "30-day watch streak" },
        { name: "Daily Devotee", requirement: "7-day streak" },
      ]}
      initialLocked={[{ id: "l1", name: "Bonus daily quest", threshold: 1000 }]}
    />
  );
}
