"use client";

import { useState } from "react";

import { Gavel, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { GlassCard } from "../../../_components/glass-card";
import { AppWidgetCard } from "../shared/app-widget-card";
import { CreateInstanceModal } from "../instances/create-instance-modal";
import { GamificationExtras } from "../shared/gamification-extras";
import { InstanceResultModal } from "../shared/instance-result-modal";
import { type GameInstance, InstancesList } from "../shared/instances-list";

const MOCK_AUCTIONS: GameInstance[] = [
  { id: "a1", name: "VIP Premiere — Meet the Cast", status: "active", schedule: "Ends Jun 5", participants: 1320, reward: "Min bid 500", winner: "@filmfan_22", outcome: "12,400 pts (top bid)" },
  { id: "a2", name: "Signed Poster Drop", status: "scheduled", schedule: "Jun 10 – Jun 12", participants: 0, reward: "Min bid 500" },
  { id: "a3", name: "Backstage Pass — Awards Night", status: "ended", schedule: "May 20", participants: 2140, reward: "Min bid 1,000", winner: "@cinephile_88", outcome: "18,200 pts", pointsDistributed: 18200 },
];

export function BiddingSettings() {
  const [minIncrement, setMinIncrement] = useState(10);

  return (
    <div className="space-y-6">
      <GlassCard>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Gavel className="text-accent h-4 w-4" /> Bidding rules
        </CardTitle>
        <CardDescription>
          Players spend earned points to bid. Bids hold points (refunded if outbid); the winner’s
          hold becomes the spend.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum bid increment (pts)</Label>
            <Input
              type="number"
              value={minIncrement}
              onChange={(e) => setMinIncrement(Number(e.target.value))}
            />
          </div>
        </div>
        <p className="text-muted-foreground text-xs">
          Hold-on-bid + refund-losers is enforced by the ledger.
        </p>
      </CardContent>
      </GlassCard>

      <AppWidgetCard gameTypeName="Bidding" defaultCta="Place a bid" />
    </div>
  );
}

export function BiddingGamification() {
  const [createOpen, setCreateOpen] = useState(false);
  const [result, setResult] = useState<GameInstance | null>(null);

  return (
    <div className="space-y-6">
      <GlassCard>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Auctions</CardTitle>
              <CardDescription>Create auctions for premieres, meet-and-greets, drops.</CardDescription>
            </div>
            <Button onClick={() => setCreateOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Create Auction
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <InstancesList
            instances={MOCK_AUCTIONS}
            emptyLabel="No auctions yet."
            onView={setResult}
            onArchive={(i) => toast.success(`Archived “${i.name}”`)}
            onDelete={(i) => toast.success(`Deleted “${i.name}”`)}
          />
        </CardContent>
      </GlassCard>

      <GamificationExtras badges={[{ name: "High Roller", requirement: "Win 3 auctions" }]} />

      <CreateInstanceModal open={createOpen} onOpenChange={setCreateOpen} kind="auction" />
      <InstanceResultModal
        open={!!result}
        onOpenChange={(o) => !o && setResult(null)}
        instance={result}
        kind="auction"
      />
    </div>
  );
}
