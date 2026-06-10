"use client";

import { ArrowRight, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface Milestone {
  id: string;
  threshold: number; // e.g. streak day
  bonus: number; // fixed bonus points
}

interface MilestoneBonusEditorProps {
  milestones: Milestone[];
  onChange: (m: Milestone[]) => void;
  thresholdLabel?: string; // e.g. "Day"
  thresholdSuffix?: string; // e.g. "day streak"
}

/**
 * Predictable milestone bonuses: a plain "threshold → fixed bonus points" map
 * (e.g. day 7 → +50, day 30 → +300). No operators — reaching the threshold pays the bonus once.
 */
export function MilestoneBonusEditor({
  milestones,
  onChange,
  thresholdLabel = "At",
  thresholdSuffix,
}: MilestoneBonusEditorProps) {
  const update = (id: string, patch: Partial<Milestone>) =>
    onChange(milestones.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  const remove = (id: string) => onChange(milestones.filter((m) => m.id !== id));
  const add = () =>
    onChange([
      ...milestones,
      { id: `m_${Date.now()}`, threshold: 0, bonus: 0 },
    ]);

  return (
    <div className="space-y-2">
      {milestones.length === 0 && (
        <p className="text-muted-foreground text-sm">No milestone bonuses.</p>
      )}

      {milestones.map((m) => (
        <div
          key={m.id}
          className="border-border/40 bg-muted/20 flex items-center gap-2 rounded-lg border p-2">
          <span className="text-muted-foreground w-12 shrink-0 text-xs">{thresholdLabel}</span>
          <Input
            type="number"
            min={0}
            value={m.threshold}
            onChange={(e) => update(m.id, { threshold: Number(e.target.value) })}
            className="h-9 w-20"
          />
          {thresholdSuffix && (
            <span className="text-muted-foreground shrink-0 text-xs">{thresholdSuffix}</span>
          )}
          <ArrowRight className="text-muted-foreground h-4 w-4 shrink-0" />
          <Input
            type="number"
            min={0}
            value={m.bonus}
            onChange={(e) => update(m.id, { bonus: Number(e.target.value) })}
            className="h-9 w-24"
          />
          <span className="text-muted-foreground shrink-0 text-xs">bonus pts</span>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-destructive ml-auto h-9 w-9 shrink-0"
            onClick={() => remove(m.id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}

      <Button variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" /> Add milestone
      </Button>
    </div>
  );
}
