"use client";

import { Coins, Sparkles } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface RewardAmountsProps {
  points: number;
  xp: number;
  onPoints: (n: number) => void;
  onXp: (n: number) => void;
  pointsLabel?: string;
  xpLabel?: string;
}

/**
 * The uniform reward contract across every game type: a fixed POINTS amount (spendable
 * wallet currency) + a fixed XP amount (progression). Predictable — one action, fixed payout.
 */
export function RewardAmounts({
  points,
  xp,
  onPoints,
  onXp,
  pointsLabel = "Points",
  xpLabel = "XP",
}: RewardAmountsProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Coins className="text-warning h-3.5 w-3.5" /> {pointsLabel}
        </Label>
        <Input type="number" min={0} value={points} onChange={(e) => onPoints(Number(e.target.value))} />
      </div>
      <div className="space-y-2">
        <Label className="flex items-center gap-1.5">
          <Sparkles className="text-primary h-3.5 w-3.5" /> {xpLabel}
        </Label>
        <Input type="number" min={0} value={xp} onChange={(e) => onXp(Number(e.target.value))} />
      </div>
    </div>
  );
}
