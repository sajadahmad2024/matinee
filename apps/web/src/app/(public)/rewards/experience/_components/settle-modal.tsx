"use client";

import { Award, Gavel, Mail } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { ExperienceReward } from "../../constants";

interface SettleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experience: ExperienceReward;
  onConfirm: () => void;
}

// Adapted from games' InstanceResolveModal auction branch: winners = top bid(s),
// winner email fires (mock), status → ended.
export function SettleModal({ open, onOpenChange, experience: e, onConfirm }: SettleModalProps) {
  const winners = e.leaderboard.slice(0, e.winners);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gavel className="text-accent h-4 w-4" /> Settle &amp; award
          </DialogTitle>
          <DialogDescription>
            Confirms the top {e.winners === 1 ? "bid" : `${e.winners} bids`} as{" "}
            {e.winners === 1 ? "the winner" : "winners"}, charges the held points and sends the
            winner email.
          </DialogDescription>
        </DialogHeader>

        {winners.length === 0 ? (
          <p className="text-muted-foreground py-2 text-sm">
            No bids to settle — the experience will be marked ended without a winner.
          </p>
        ) : (
          <div className="space-y-2 py-1">
            {winners.map((w) => (
              <div
                key={w.user}
                className="border-border/50 bg-muted/10 flex items-center gap-3 rounded-lg border px-3 py-2">
                <Award className="text-warning h-4 w-4 shrink-0" />
                <span className="text-foreground min-w-0 flex-1 truncate text-sm font-medium">
                  {w.user}
                </span>
                <span className="text-foreground text-sm font-semibold tabular-nums">
                  {w.bid.toLocaleString()} pts
                </span>
              </div>
            ))}
            <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Mail className="h-3 w-3" /> “{e.notifications.winnerEmailSubject}” goes out
              automatically.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="gap-2">
            <Gavel className="h-4 w-4" /> Settle &amp; award
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
