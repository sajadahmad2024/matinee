"use client";

import { useState } from "react";

import { CalendarClock, Plus } from "lucide-react";
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

const MOCK_QUESTS: GameInstance[] = [
  { id: "q1", name: "Marvel Marathon Week", status: "active", schedule: "May 12 – May 19", participants: 8421, reward: "100 pts · 50 XP", completions: 5210, pointsDistributed: 521000 },
  { id: "q2", name: "K-Drama Binge", status: "scheduled", schedule: "May 19 – May 26", participants: 0, reward: "120 pts · 60 XP" },
  { id: "q3", name: "Hidden Gems", status: "draft", schedule: "Unscheduled", participants: 0, reward: "80 pts · 40 XP" },
  { id: "q4", name: "Oscar Week", status: "ended", schedule: "May 1 – May 8", participants: 15230, reward: "100 pts · 50 XP", completions: 9840, pointsDistributed: 984000 },
  { id: "q5", name: "Spring Premieres", status: "archived", schedule: "Apr 20 – Apr 27", participants: 11200, reward: "90 pts", completions: 7100, pointsDistributed: 639000 },
];

/**
 * Settings = global DEFAULTS & POLICY only. Each quest's actual rule (videos, schedule,
 * reward, unlock threshold) is set per-quest in the Create Quest form.
 */
export function QuestsSettings() {
  const [enabled, setEnabled] = useState(true);
  const [requireAll, setRequireAll] = useState(true);
  const [defaultWeeks, setDefaultWeeks] = useState("1");
  const [defaultPoints, setDefaultPoints] = useState(100);
  const [defaultXp, setDefaultXp] = useState(50);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Policy</CardTitle>
          <CardDescription>
            Defaults for new quests. The rule for each quest is set when you create it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ToggleRow
            label="Enabled"
            hint="Turn weekly quests on/off across the app."
            checked={enabled}
            onChange={setEnabled}
          />
          <ToggleRow
            label="Require all videos by default"
            hint="New quests complete only when every selected video is watched."
            checked={requireAll}
            onChange={setRequireAll}
          />
          <div className="space-y-2">
            <Label>Default window</Label>
            <Select value={defaultWeeks} onValueChange={setDefaultWeeks}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {["1", "2", "3", "4"].map((w) => (
                  <SelectItem key={w} value={w}>
                    {w} Week{w === "1" ? "" : "s"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="text-muted-foreground flex items-center gap-2 text-xs">
            <CalendarClock className="h-3.5 w-3.5" />
            Stage quests ahead (draft → scheduled); they go live on their start date.
          </div>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="text-base">Default rewards</CardTitle>
          <CardDescription>Pre-fills the Create Quest form (editable per quest).</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Reward points</Label>
            <Input type="number" value={defaultPoints} onChange={(e) => setDefaultPoints(Number(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label>Reward XP</Label>
            <Input type="number" value={defaultXp} onChange={(e) => setDefaultXp(Number(e.target.value))} />
          </div>
        </CardContent>
      </GlassCard>

      <div className="lg:col-span-2">
        <AppWidgetCard gameTypeName="Weekly Quests" defaultCta="Start a quest" />
      </div>
    </div>
  );
}

export function QuestsGamification() {
  const [createOpen, setCreateOpen] = useState(false);
  const [result, setResult] = useState<GameInstance | null>(null);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Quests</CardTitle>
              <CardDescription>
                Each quest defines its own rule — videos, schedule, reward and unlock threshold.
              </CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Quest
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InstancesList
            instances={MOCK_QUESTS}
            emptyLabel="No quests yet."
            onView={setResult}
            onArchive={(i) => toast.success(`Archived “${i.name}”`)}
            onDelete={(i) => toast.success(`Deleted “${i.name}”`)}
          />
        </CardContent>
      </GlassCard>

      <GamificationExtras
        badges={[{ name: "Quest Master", requirement: "Complete 10 quests" }]}
        initialLocked={[{ id: "l1", name: "Premium quest track", threshold: 2000 }]}
      />

      <CreateInstanceModal open={createOpen} onOpenChange={setCreateOpen} kind="quest" />
      <InstanceResultModal
        open={!!result}
        onOpenChange={(o) => !o && setResult(null)}
        instance={result}
        kind="quest"
      />
    </div>
  );
}

function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        <p className="text-muted-foreground text-xs">{hint}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
