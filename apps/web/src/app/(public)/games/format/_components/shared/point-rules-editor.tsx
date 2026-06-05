"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PointRule {
  id: string;
  trigger: string;
  operator: "gte" | "gt" | "eq";
  value: number;
  points: number;
}

export interface RuleTrigger {
  value: string;
  label: string;
  unit?: string;
}

const OPERATORS: { value: PointRule["operator"]; label: string }[] = [
  { value: "gte", label: "≥" },
  { value: "gt", label: ">" },
  { value: "eq", label: "=" },
];

interface PointRulesEditorProps {
  rules: PointRule[];
  triggers: RuleTrigger[];
  onChange: (rules: PointRule[]) => void;
}

/**
 * Dynamic rule builder — "when <trigger> <op> <value> → award <points>".
 * Game types are fixed; their earning rules are configured here (admin-editable).
 */
export function PointRulesEditor({ rules, triggers, onChange }: PointRulesEditorProps) {
  const update = (id: string, patch: Partial<PointRule>) =>
    onChange(rules.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const remove = (id: string) => onChange(rules.filter((r) => r.id !== id));
  const add = () =>
    onChange([
      ...rules,
      {
        id: `rule_${Date.now()}`,
        trigger: triggers[0]?.value ?? "",
        operator: "gte",
        value: 1,
        points: 10,
      },
    ]);

  return (
    <div className="space-y-3">
      {rules.length === 0 && (
        <p className="text-muted-foreground text-sm">No rules yet — add one to start earning.</p>
      )}

      {rules.map((rule) => {
        const unit = triggers.find((t) => t.value === rule.trigger)?.unit;
        return (
          <div
            key={rule.id}
            className="border-border/40 bg-muted/20 grid grid-cols-12 items-center gap-2 rounded-lg border p-2">
            <Select value={rule.trigger} onValueChange={(v) => update(rule.id, { trigger: v })}>
              <SelectTrigger className="col-span-5 h-9">
                <SelectValue placeholder="Trigger" />
              </SelectTrigger>
              <SelectContent>
                {triggers.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={rule.operator}
              onValueChange={(v) => update(rule.id, { operator: v as PointRule["operator"] })}>
              <SelectTrigger className="col-span-2 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OPERATORS.map((o) => (
                  <SelectItem key={o.value} value={o.value}>
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                value={rule.value}
                onChange={(e) => update(rule.id, { value: Number(e.target.value) })}
                className="h-9"
              />
              {unit && <span className="text-muted-foreground text-xs">{unit}</span>}
            </div>

            <div className="col-span-2 flex items-center gap-1">
              <Input
                type="number"
                value={rule.points}
                onChange={(e) => update(rule.id, { points: Number(e.target.value) })}
                className="h-9"
              />
              <span className="text-muted-foreground text-xs">pts</span>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive col-span-1 h-9 w-9"
              onClick={() => remove(rule.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      })}

      <Button variant="outline" size="sm" onClick={add} className="gap-2">
        <Plus className="h-4 w-4" /> Add rule
      </Button>
    </div>
  );
}
