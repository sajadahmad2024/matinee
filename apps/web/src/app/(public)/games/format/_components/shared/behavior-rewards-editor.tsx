"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface BehaviorReward {
  id: string;
  label: string; // behaviour name (editable — admins can add/automate more)
  points: number; // fixed points payout
  xp: number; // fixed xp payout
}

interface BehaviorRewardsEditorProps {
  behaviors: BehaviorReward[];
  onChange: (b: BehaviorReward[]) => void;
  addLabel?: string;
}

/**
 * Predictable multi-behaviour rewards: a fixed list where each behaviour pays a fixed
 * points + xp. NO operators/conditions — every occurrence pays the listed amount.
 * (Daily Streak: time-on-app + engagement behaviours; Shared Content: internal/external/referral.)
 */
export function BehaviorRewardsEditor({
  behaviors,
  onChange,
  addLabel = "Add behaviour",
}: BehaviorRewardsEditorProps) {
  const update = (id: string, patch: Partial<BehaviorReward>) =>
    onChange(behaviors.map((b) => (b.id === id ? { ...b, ...patch } : b)));
  const remove = (id: string) => onChange(behaviors.filter((b) => b.id !== id));
  const add = () =>
    onChange([...behaviors, { id: `b_${Date.now()}`, label: "New behaviour", points: 10, xp: 5 }]);

  return (
    <div className="space-y-2">
      <div className="text-muted-foreground grid grid-cols-12 gap-2 px-1 text-[11px]">
        <span className="col-span-7">Behaviour → fixed reward</span>
        <span className="col-span-2 text-center">Points</span>
        <span className="col-span-2 text-center">XP</span>
        <span className="col-span-1" />
      </div>

      {behaviors.map((b) => (
        <div
          key={b.id}
          className="border-border/40 bg-muted/20 grid grid-cols-12 items-center gap-2 rounded-lg border p-2">
          <Input
            value={b.label}
            onChange={(e) => update(b.id, { label: e.target.value })}
            className="col-span-7 h-9"
          />
          <Input
            type="number"
            min={0}
            value={b.points}
            onChange={(e) => update(b.id, { points: Number(e.target.value) })}
            className="col-span-2 h-9 text-center"
          />
          <Input
            type="number"
            min={0}
            value={b.xp}
            onChange={(e) => update(b.id, { xp: Number(e.target.value) })}
            className="col-span-2 h-9 text-center"
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive col-span-1 h-9 w-9"
            onClick={() => remove(b.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}
