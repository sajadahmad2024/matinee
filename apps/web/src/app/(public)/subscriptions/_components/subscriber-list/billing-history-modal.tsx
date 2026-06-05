"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { billingHistory, Subscriber } from "./types";

interface BillingHistoryModalProps {
  subscriber: Subscriber | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BillingHistoryModal({
  subscriber,
  open,
  onOpenChange,
}: BillingHistoryModalProps) {
  if (!subscriber) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card max-w-md">
        <DialogHeader>
          <DialogTitle>Billing History</DialogTitle>
          <DialogDescription>Payment history for {subscriber.name}</DialogDescription>
        </DialogHeader>
        <div className="max-h-[300px] space-y-2 overflow-y-auto">
          {billingHistory.map((item, i) => (
            <div
              key={i}
              className="border-border/30 bg-accent/10 flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-foreground text-sm font-medium">{item.invoice}</p>
                <p className="text-muted-foreground text-xs">{item.date}</p>
              </div>
              <div className="text-right">
                <p className="text-foreground text-sm font-medium">${item.amount}</p>
                <Badge
                  variant="outline"
                  className="bg-success/20 border-success/30 text-success text-xs">
                  Paid
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
