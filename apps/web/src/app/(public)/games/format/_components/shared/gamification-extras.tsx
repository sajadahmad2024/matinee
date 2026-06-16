"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";

import { Award, Lock, Plus, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { GlassCard } from "../../../_components/glass-card";

interface MilestoneBadge {
  name: string;
  requirement: string;
}

interface LockedItem {
  id: string;
  name: string;
  threshold: number;
}

interface GamificationExtrasProps {
  /** Milestone badges this game type can unlock (mock; managed in the Badges tab). */
  badges: MilestoneBadge[];
  /** Initial locked-progression items. */
  initialLocked?: LockedItem[];
}

/**
 * Shared Gamification-tab cards: milestone badges + "locked until X points" progression.
 * (Client note: "show other quests locked unless user reaches X points".)
 */
export function GamificationExtras({ badges, initialLocked = [] }: GamificationExtrasProps) {
  const [locked, setLocked] = useState<LockedItem[]>(initialLocked);

  const addLocked = () =>
    setLocked((l) => [...l, { id: `lock_${Date.now()}`, name: "New locked item", threshold: 500 }]);
  const updateLocked = (id: string, patch: Partial<LockedItem>) =>
    setLocked((l) => l.map((it) => (it.id === id ? { ...it, ...patch } : it)));
  const removeLocked = (id: string) => setLocked((l) => l.filter((it) => it.id !== id));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Award className="text-accent h-4 w-4" /> Milestone Badges
          </CardTitle>
          <CardDescription>Badges users unlock by playing this game type.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {badges.map((b) => (
            <div
              key={b.name}
              className="border-border/40 bg-muted/20 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-foreground text-sm font-medium">{b.name}</p>
                <p className="text-muted-foreground text-xs">{b.requirement}</p>
              </div>
              <Badge variant="secondary" className="text-[10px]">
                Badge
              </Badge>
            </div>
          ))}
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={"/games?tab=badges" as Route}>Manage in Badges</Link>
          </Button>
        </CardContent>
      </GlassCard>

      <GlassCard>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Lock className="text-accent h-4 w-4" /> Locked Progression
          </CardTitle>
          <CardDescription>Items that stay locked until the user reaches X points.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {locked.length === 0 && (
            <p className="text-muted-foreground text-sm">No locked items.</p>
          )}
          {locked.map((it) => (
            <div
              key={it.id}
              className="border-border/40 bg-muted/20 flex items-center gap-2 rounded-lg border p-2">
              <Input
                value={it.name}
                onChange={(e) => updateLocked(it.id, { name: e.target.value })}
                className="h-9 flex-1"
              />
              <div className="flex items-center gap-1">
                <Lock className="text-muted-foreground h-3.5 w-3.5" />
                <Input
                  type="number"
                  value={it.threshold}
                  onChange={(e) => updateLocked(it.id, { threshold: Number(e.target.value) })}
                  className="h-9 w-24"
                />
                <span className="text-muted-foreground text-xs">pts</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-destructive h-9 w-9"
                onClick={() => removeLocked(it.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button variant="outline" size="sm" onClick={addLocked} className="gap-2">
            <Plus className="h-4 w-4" /> Add locked item
          </Button>
        </CardContent>
      </GlassCard>
    </div>
  );
}
