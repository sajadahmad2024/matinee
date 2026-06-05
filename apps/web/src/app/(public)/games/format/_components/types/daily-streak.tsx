"use client";

import { useState } from "react";

import { Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { GamificationExtras } from "../shared/gamification-extras";
import { type PointRule, PointRulesEditor, type RuleTrigger } from "../shared/point-rules-editor";

// The "5 starter options" — time-on-app + engagement triggers.
const TRIGGERS: RuleTrigger[] = [
  { value: "watch_minutes_today", label: "Watch time today", unit: "min" },
  { value: "sessions_today", label: "Sessions today" },
  { value: "app_open_streak", label: "Daily-open streak", unit: "days" },
  { value: "videos_completed_today", label: "Videos completed today" },
  { value: "engagement_actions_today", label: "Engagement actions today" },
];

const INITIAL_RULES: PointRule[] = [
  { id: "r1", trigger: "watch_minutes_today", operator: "gte", value: 5, points: 10 },
  { id: "r2", trigger: "app_open_streak", operator: "gte", value: 7, points: 50 },
  { id: "r3", trigger: "videos_completed_today", operator: "gte", value: 3, points: 15 },
];

export function DailyStreakSettings() {
  const [rules, setRules] = useState<PointRule[]>(INITIAL_RULES);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">Streak earning rules</CardTitle>
              <CardDescription>
                Daily Streak is autonomous — the system computes points from app events.
                Logic: <strong>time on app + engagement = points</strong>.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1 text-[10px]">
              <Sparkles className="h-3 w-3" /> Autonomous
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <PointRulesEditor rules={rules} triggers={TRIGGERS} onChange={setRules} />
          <p className="text-muted-foreground text-xs">
            Start with up to 5 behaviours; more can be added and automated across the system.
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
