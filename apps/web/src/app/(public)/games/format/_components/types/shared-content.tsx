"use client";

import { useState } from "react";

import { Database } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { GamificationExtras } from "../shared/gamification-extras";
import { type PointRule, PointRulesEditor, type RuleTrigger } from "../shared/point-rules-editor";

const TRIGGERS: RuleTrigger[] = [
  { value: "share_internal", label: "Share to another user (internal)" },
  { value: "share_external", label: "Share externally" },
  { value: "referral_completed", label: "Referral completed first game" },
  { value: "referrals_total", label: "Total referrals" },
];

const INITIAL_RULES: PointRule[] = [
  { id: "r1", trigger: "share_external", operator: "gte", value: 1, points: 5 },
  { id: "r2", trigger: "share_internal", operator: "gte", value: 1, points: 3 },
  { id: "r3", trigger: "referral_completed", operator: "gte", value: 1, points: 100 },
];

export function SharedContentSettings() {
  const [rules, setRules] = useState<PointRule[]>(INITIAL_RULES);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Sharing &amp; referral rules</CardTitle>
          <CardDescription>
            Reward the behaviour of sharing content (internally or externally) and referrals.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PointRulesEditor rules={rules} triggers={TRIGGERS} onChange={setRules} />
          <div className="border-border/30 flex items-center gap-2 border-t pt-3">
            <Badge variant="outline" className="gap-1 text-[10px]">
              <Database className="h-3 w-3" /> DB gap
            </Badge>
            <span className="text-muted-foreground text-xs">
              Needs a <code>reward_rules['shared_content']</code> entry — to add when we return to DB.
            </span>
          </div>
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
