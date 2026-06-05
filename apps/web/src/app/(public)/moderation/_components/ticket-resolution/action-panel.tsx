"use client";

import { useState } from "react";

import { Ban, Bell, ChevronRight, EyeOff, MinusCircle, Trash2, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

import {
  type ConfirmationAction,
  ConfirmationDialog,
} from "@/components/custom/confirmation-dialog";

interface ActionPanelProps {
  onAction: (action: string) => void;
  onClose: () => void;
  onNext: () => void;
}

export function ActionPanel({ onAction, onClose, onNext }: ActionPanelProps) {
  const [banDuration, setBanDuration] = useState<string>("24h");
  const [xpFine, setXpFine] = useState<string>("500");
  const [internalNote, setInternalNote] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    action: ConfirmationAction;
    title: string;
    description: string;
    onConfirm: () => void;
  } | null>(null);

  const handleConfirmAction = (
    action: ConfirmationAction,
    title: string,
    description: string,
    onConfirm: () => void,
  ) => {
    setConfirmDialog({ open: true, action, title, description, onConfirm });
  };

  return (
    <div className="bg-muted/5 space-y-6 p-6">
      {/* Content Actions */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">
          Content Actions
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            className="justify-start gap-2"
            onClick={() => onAction("hide")}>
            <EyeOff className="h-4 w-4" />
            Hide Content
          </Button>
          <Button
            variant="outline"
            className="text-destructive hover:text-destructive justify-start gap-2"
            onClick={() =>
              handleConfirmAction(
                "delete",
                "Delete Content",
                "Are you sure you want to delete this content? This action cannot be undone.",
                () => onAction("delete"),
              )
            }>
            <Trash2 className="h-4 w-4" />
            Delete Content
          </Button>
        </div>
      </div>

      <Separator />

      {/* User Actions */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">User Actions</h3>
        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            onClick={() => onAction("dismiss")}>
            <X className="h-4 w-4" />
            Dismiss (False Alarm)
          </Button>
          <Button
            variant="outline"
            className="text-warning hover:text-warning w-full justify-start gap-2"
            onClick={() => onAction("warn")}>
            <Bell className="h-4 w-4" />
            Send Warning
          </Button>

          <div className="border-border/50 space-y-3 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Block/Ban User</Label>
            </div>
            <RadioGroup value={banDuration} onValueChange={setBanDuration} className="flex gap-2">
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="24h" id="24h" />
                <Label htmlFor="24h" className="cursor-pointer text-xs">
                  24h
                </Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="7d" id="7d" />
                <Label htmlFor="7d" className="cursor-pointer text-xs">
                  7 days
                </Label>
              </div>
              <div className="flex items-center space-x-1.5">
                <RadioGroupItem value="perm" id="perm" />
                <Label htmlFor="perm" className="cursor-pointer text-xs">
                  Permanent
                </Label>
              </div>
            </RadioGroup>
            <Button
              variant="destructive"
              size="sm"
              className="w-full gap-2"
              onClick={() =>
                handleConfirmAction(
                  "ban",
                  "Ban User",
                  `Are you sure you want to ban this user for ${banDuration}?`,
                  () => onAction(`ban_${banDuration}`),
                )
              }>
              <Ban className="h-4 w-4" />
              Apply Ban ({banDuration})
            </Button>
          </div>
        </div>
      </div>

      <Separator />

      {/* XP Penalty */}
      <div>
        <h3 className="text-muted-foreground mb-3 text-sm font-medium uppercase">
          Gamified Penalty
        </h3>
        <div className="border-warning/30 bg-warning/5 space-y-3 rounded-lg border p-3">
          <div className="flex items-center gap-2">
            <MinusCircle className="text-warning h-4 w-4" />
            <Label className="text-sm font-medium">Deduct XP / Level Down</Label>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={xpFine}
              onChange={(e) => setXpFine(e.target.value)}
              className="w-24"
              placeholder="500"
            />
            <span className="text-muted-foreground self-center text-sm">XP</span>
          </div>
          <p className="text-muted-foreground text-xs">
            If deduction drops user below level threshold, they will be auto-downgraded.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="text-warning hover:text-warning border-warning/30 hover:bg-warning/10 w-full gap-2"
            onClick={() =>
              handleConfirmAction(
                "warn",
                "Apply XP Fine",
                `Are you sure you want to deduct ${xpFine} XP from this user?`,
                () => onAction(`xp_fine_${xpFine}`),
              )
            }>
            <MinusCircle className="h-4 w-4" />
            Apply -{xpFine} XP Fine
          </Button>
        </div>
      </div>

      <Separator />

      {/* Internal Note */}
      <div>
        <Label className="text-muted-foreground text-sm font-medium">Internal Note</Label>
        <Textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Add notes for other moderators..."
          className="mt-2"
          rows={2}
        />
      </div>

      {/* Footer */}
      <div className="flex gap-2 pt-2">
        <Button variant="outline" className="flex-1" onClick={onClose}>
          Close
        </Button>
        <Button className="flex-1 gap-2" onClick={onNext}>
          Confirm & Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {confirmDialog && (
        <ConfirmationDialog
          open={confirmDialog.open}
          onOpenChange={(open) => setConfirmDialog(open ? confirmDialog : null)}
          title={confirmDialog.title}
          description={confirmDialog.description}
          action={confirmDialog.action}
          onConfirm={() => {
            confirmDialog.onConfirm();
            setConfirmDialog(null);
          }}
        />
      )}
    </div>
  );
}
