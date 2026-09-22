"use client";

import { differenceInCalendarDays } from "date-fns";
import { Gavel } from "lucide-react";

import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "@/app/(public)/games/_components/glass-card";

interface BiddingRulesCardProps {
  minBid: number;
  minIncrement: number;
  winners: number;
  bidOpenAt: string; // yyyy-MM-dd
  bidCloseAt: string; // yyyy-MM-dd
  onChange: (
    patch: Partial<{
      minBid: number;
      minIncrement: number;
      winners: number;
      bidOpenAt: string;
      bidCloseAt: string;
    }>,
  ) => void;
}

export function BiddingRulesCard({
  minBid,
  minIncrement,
  winners,
  bidOpenAt,
  bidCloseAt,
  onChange,
}: BiddingRulesCardProps) {
  const windowDays =
    bidOpenAt && bidCloseAt
      ? differenceInCalendarDays(new Date(bidCloseAt), new Date(bidOpenAt))
      : null;

  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gavel className="text-accent h-4 w-4" /> Bidding rules
        </CardTitle>
        <CardDescription>
          Players spend earned points to bid. Bids hold points (refunded if outbid); the
          winner&apos;s hold becomes the spend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="exp-min-bid">Min bid threshold (pts)</Label>
            <Input
              id="exp-min-bid"
              type="number"
              min={0}
              value={minBid}
              onChange={(e) => onChange({ minBid: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-min-increment">Min increment (pts)</Label>
            <Input
              id="exp-min-increment"
              type="number"
              min={1}
              value={minIncrement}
              onChange={(e) => onChange({ minIncrement: Number(e.target.value) })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-winners">Number of winners</Label>
            <Input
              id="exp-winners"
              type="number"
              min={1}
              value={winners}
              onChange={(e) => onChange({ winners: Number(e.target.value) })}
            />
            <p className="text-muted-foreground text-xs">
              Multi-winner rewards need a starting threshold.
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="exp-bid-open">Bidding opens</Label>
            <Input
              id="exp-bid-open"
              type="date"
              value={bidOpenAt}
              onChange={(e) => onChange({ bidOpenAt: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exp-bid-close">Bidding closes</Label>
            <Input
              id="exp-bid-close"
              type="date"
              value={bidCloseAt}
              onChange={(e) => onChange({ bidCloseAt: e.target.value })}
            />
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Window is adjustable per reward — could be a week, could be 30 days.
          {windowDays !== null && windowDays >= 0 && (
            <span className="text-foreground font-medium"> Currently: {windowDays} days.</span>
          )}
        </p>
      </CardContent>
    </GlassCard>
  );
}
