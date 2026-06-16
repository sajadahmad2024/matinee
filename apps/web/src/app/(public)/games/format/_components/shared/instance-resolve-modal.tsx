"use client";

import { useState } from "react";

import { Award, CheckCircle2, Gavel } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/app/_libs/utils/cn";

import type { GameInstance } from "./instances-list";

type ResolveKind = "quest" | "prediction" | "auction";

// Mock options for prediction resolution (replace with prediction_options from API).
const PREDICTION_OPTIONS = ["Character A", "Character B", "Character C"];

interface InstanceResolveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  instance: GameInstance | null;
  kind: ResolveKind;
}

export function InstanceResolveModal({ open, onOpenChange, instance, kind }: InstanceResolveModalProps) {
  const [correct, setCorrect] = useState<string>("");

  if (!instance) return null;

  const resolve = () => {
    if (kind === "prediction") {
      toast.success(`Resolved "${instance.name}" — "${correct}" correct; winners paid.`);
    } else if (kind === "auction") {
      toast.success(`Settled "${instance.name}" — awarded to ${instance.winner ?? "top bidder"}; bid charged.`);
    } else {
      toast.success(`Ended "${instance.name}" early; rewards distributed.`);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {kind === "auction" ? <Gavel className="text-amber-500 h-5 w-5" /> : <Award className="text-emerald-500 h-5 w-5" />}
            {kind === "prediction" ? "Resolve prediction" : kind === "auction" ? "Settle auction" : "End quest"}
          </DialogTitle>
          <DialogDescription>
            {instance.name} · {instance.participants.toLocaleString()} participants
          </DialogDescription>
        </DialogHeader>

        {kind === "prediction" && (
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">Select the correct outcome — winners get the multiplier payout.</p>
            {PREDICTION_OPTIONS.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => setCorrect(o)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                  correct === o ? "border-emerald-500 bg-emerald-500/10" : "border-border hover:bg-muted/30",
                )}>
                <CheckCircle2 className={cn("h-4 w-4", correct === o ? "text-emerald-500" : "text-muted-foreground")} />
                {o}
              </button>
            ))}
          </div>
        )}

        {kind === "auction" && (
          <div className="border-border bg-muted/20 rounded-lg border p-4">
            <p className="text-muted-foreground text-xs">Winning bid</p>
            <p className="text-foreground text-lg font-semibold">{instance.winner ?? "Top bidder"}</p>
            <p className="text-muted-foreground text-sm">{instance.outcome ?? "Highest active bid"}</p>
            <p className="text-muted-foreground mt-2 text-xs">Settling charges the winner's held bid and refunds the rest.</p>
          </div>
        )}

        {kind === "quest" && (
          <p className="text-muted-foreground text-sm">
            End "{instance.name}" now? Participants who met the requirement are rewarded; the rest are closed out.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={resolve} disabled={kind === "prediction" && !correct}>
            {kind === "prediction" ? "Resolve & pay winners" : kind === "auction" ? "Settle & award" : "End quest"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
