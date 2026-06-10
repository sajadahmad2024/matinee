"use client";

import { useState } from "react";

import { Coins, Plus, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { CreateInstanceModal } from "../instances/create-instance-modal";
import { GamificationExtras } from "../shared/gamification-extras";
import { InstanceResultModal } from "../shared/instance-result-modal";
import { type GameInstance, InstancesList } from "../shared/instances-list";

const MOCK_PREDICTIONS: GameInstance[] = [
  { id: "p1", name: "Who wins Best Picture at IIFA?", status: "active", schedule: "Q3 2026", participants: 12840, totalEntries: 12840, reward: "Entry 50 · ×10" },
  { id: "p2", name: "How does the new Marvel arc end?", status: "scheduled", schedule: "Opens Jun 1", participants: 0, reward: "Entry 100 · ×5" },
  { id: "p3", name: "Who wins the season finale showdown?", status: "ended", schedule: "Q2 2026", participants: 18400, totalEntries: 18400, reward: "Entry 50 · ×10", outcome: "Character B", winner: "4,120 players", pointsDistributed: 2060000 },
];

/**
 * Settings = global DEFAULTS & POLICY only. Each prediction's rule (question, options,
 * entry cost, multiplier, schedule, unlock threshold) is set in the Create Prediction form.
 */
export function PredictiveSettings() {
  const [enabled, setEnabled] = useState(true);
  const [defaultEntryCost, setDefaultEntryCost] = useState(50);
  const [defaultMultiplier, setDefaultMultiplier] = useState("5");
  const [defaultCadence, setDefaultCadence] = useState("monthly");

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Policy</CardTitle>
          <CardDescription>
            Predictions cost points to enter; correct ones pay a multiplier. The rule for each
            prediction is set when you create it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enabled</Label>
              <p className="text-muted-foreground text-xs">Turn predictions on/off across the app.</p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>
          <div className="space-y-2">
            <Label>Default cadence</Label>
            <Select value={defaultCadence} onValueChange={setDefaultCadence}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Default stakes</CardTitle>
          <CardDescription>Pre-fills the Create Prediction form (editable per prediction).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Coins className="h-3.5 w-3.5" /> Entry cost (pts)
            </Label>
            <Input
              type="number"
              value={defaultEntryCost}
              onChange={(e) => setDefaultEntryCost(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-1">
              <Zap className="h-3.5 w-3.5" /> Correct multiplier
            </Label>
            <Select value={defaultMultiplier} onValueChange={setDefaultMultiplier}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">×5</SelectItem>
                <SelectItem value="10">×10</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </GlassCard>

      <div className="lg:col-span-2">
        <AppWidgetCard gameTypeName="Predictive" defaultCta="Predict &amp; win" />
      </div>
    </div>
  );
}

export function PredictiveGamification() {
  const [createOpen, setCreateOpen] = useState(false);
  const [result, setResult] = useState<GameInstance | null>(null);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Predictions</CardTitle>
              <CardDescription>
                Each prediction defines its own rule — question, options, entry cost, multiplier,
                schedule and unlock threshold.
              </CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Prediction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InstancesList
            instances={MOCK_PREDICTIONS}
            emptyLabel="No predictions yet."
            onView={setResult}
            onArchive={(i) => toast.success(`Archived “${i.name}”`)}
            onDelete={(i) => toast.success(`Deleted “${i.name}”`)}
          />
        </CardContent>
      </GlassCard>

      <GamificationExtras
        badges={[{ name: "Oracle", requirement: "10 correct predictions" }]}
        initialLocked={[{ id: "l1", name: "High-stakes prediction", threshold: 5000 }]}
      />

      <CreateInstanceModal open={createOpen} onOpenChange={setCreateOpen} kind="prediction" />
      <InstanceResultModal
        open={!!result}
        onOpenChange={(o) => !o && setResult(null)}
        instance={result}
        kind="prediction"
      />
    </div>
  );
}
