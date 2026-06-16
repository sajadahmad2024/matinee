"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import type { Subscriber } from "./types";

interface CancelSubscriptionModalProps {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (option: "immediate" | "period_end") => void;
}

export function CancelSubscriptionModal({
  subscriber,
  open,
  onOpenChange,
  onConfirm,
}: CancelSubscriptionModalProps) {
  const [cancelOption, setCancelOption] = useState<"immediate" | "period_end">("period_end");

  if (!subscriber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Cancel Subscription</DialogTitle>
          <DialogDescription>Cancel subscription for {subscriber.name}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <RadioGroup
            value={cancelOption}
            onValueChange={(v) => setCancelOption(v as typeof cancelOption)}>
            <div className="border-border/50 hover:bg-accent/10 flex items-start space-x-3 rounded-lg border p-3 transition-colors">
              <RadioGroupItem value="period_end" id="period_end" className="mt-0.5" />
              <div>
                <Label htmlFor="period_end" className="text-foreground cursor-pointer font-medium">
                  Cancel at Period End
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  User keeps access until {subscriber.nextBilling}
                </p>
              </div>
            </div>
            <div className="border-border/50 hover:bg-accent/10 flex items-start space-x-3 rounded-lg border p-3 transition-colors">
              <RadioGroupItem value="immediate" id="immediate" className="mt-0.5" />
              <div>
                <Label htmlFor="immediate" className="text-foreground cursor-pointer font-medium">
                  Cancel Immediately
                </Label>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  User loses access right away (may require refund)
                </p>
              </div>
            </div>
          </RadioGroup>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Keep Subscription
          </Button>
          <Button variant="destructive" onClick={() => onConfirm(cancelOption)}>
            Confirm Cancellation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
