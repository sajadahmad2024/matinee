"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import type { Subscriber } from "./types";

interface RefundPaymentModalProps {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export function RefundPaymentModal({
  subscriber,
  open,
  onOpenChange,
  onConfirm,
}: RefundPaymentModalProps) {
  if (!subscriber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Refund Latest Payment</DialogTitle>
          <DialogDescription>
            Issue a refund for {subscriber.name}&apos;s most recent payment
          </DialogDescription>
        </DialogHeader>
        <div className="border-warning/30 bg-warning/10 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-foreground text-sm font-medium">Last Payment</p>
              <p className="text-muted-foreground text-xs">INV-2025-0115 • Jan 15, 2025</p>
            </div>
            <p className="text-foreground text-lg font-bold">$24.99</p>
          </div>
        </div>
        <p className="text-muted-foreground text-sm">
          This will refund the full amount of the last invoice and may affect the user&apos;s
          subscription status.
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm}>
            Process Refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
