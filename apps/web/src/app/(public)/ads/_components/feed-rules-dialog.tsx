"use client";

import { useState } from "react";

import { SlidersHorizontal } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DEFAULT_FEED_RULES, type FeedRules } from "../constants";

/** The two global limits that keep ads from flooding the feed. */
export function FeedRulesDialog() {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState<FeedRules>(DEFAULT_FEED_RULES);
  const [minGap, setMinGap] = useState(String(saved.minGap));
  const [maxPerDay, setMaxPerDay] = useState(String(saved.maxPerUserDay));

  const gap = Number(minGap);
  const perDay = Number(maxPerDay);
  const valid = Number.isInteger(gap) && gap >= 1 && Number.isInteger(perDay) && perDay >= 1;

  const onOpenChange = (o: boolean) => {
    if (o) {
      setMinGap(String(saved.minGap));
      setMaxPerDay(String(saved.maxPerUserDay));
    }
    setOpen(o);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <SlidersHorizontal className="h-4 w-4" /> Feed rules
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-card sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Feed rules</DialogTitle>
          <DialogDescription>Apply to every ad.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="min-gap">Minimum reels between ads</Label>
            <Input id="min-gap" type="number" min={1} value={minGap} onChange={(e) => setMinGap(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max-per-day">Max ads per user per day</Label>
            <Input id="max-per-day" type="number" min={1} value={maxPerDay} onChange={(e) => setMaxPerDay(e.target.value)} />
          </div>
          {!valid && <p className="text-destructive text-xs">Both values must be whole numbers of 1 or more.</p>}
        </div>
        <DialogFooter>
          <Button
            disabled={!valid}
            onClick={() => {
              setSaved({ minGap: gap, maxPerUserDay: perDay });
              setOpen(false);
              toast.success("Feed rules saved");
            }}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
