import { Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { GlassCard } from "../../../_components/glass-card";

interface LeaderboardRewardsCardProps {
  enableDefaultRewards: boolean;
  setEnableDefaultRewards: (val: boolean) => void;
  topPlayersToReward: number;
  setTopPlayersToReward: (val: number) => void;
  bonusPoints: number;
  setBonusPoints: (val: number) => void;
}

export function LeaderboardRewardsCard({
  enableDefaultRewards,
  setEnableDefaultRewards,
  topPlayersToReward,
  setTopPlayersToReward,
  bonusPoints,
  setBonusPoints,
}: LeaderboardRewardsCardProps) {
  return (
    <GlassCard>
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <Trophy className="text-warning h-5 w-5" />
          Leaderboard & Rewards
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <Label>Enable Default Leaderboard Rewards</Label>
            <p className="text-muted-foreground text-xs">
              Pre-fills reward settings when adding to videos
            </p>
          </div>
          <Switch checked={enableDefaultRewards} onCheckedChange={setEnableDefaultRewards} />
        </div>

        {enableDefaultRewards && (
          <div className="bg-muted/30 space-y-4 rounded-lg p-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Top Players to Reward</Label>
                <Input
                  type="number"
                  value={topPlayersToReward}
                  onChange={(e) => setTopPlayersToReward(parseInt(e.target.value) || 3)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Bonus Points</Label>
                <Input
                  type="number"
                  value={bonusPoints}
                  onChange={(e) => setBonusPoints(parseInt(e.target.value) || 100)}
                />
              </div>
            </div>

            {/* Tier Configuration */}
            <div className="space-y-3">
              <Label className="text-xs">Reward Tiers</Label>
              {[1, 2, 3].map((tier) => (
                <div key={tier} className="flex items-center gap-3">
                  <Badge variant="outline" className="w-16 justify-center">
                    {tier === 1 ? "🥇 1st" : tier === 2 ? "🥈 2nd" : "🥉 3rd"}
                  </Badge>
                  <Input
                    type="number"
                    defaultValue={tier === 1 ? 500 : tier === 2 ? 300 : 150}
                    className="flex-1"
                    placeholder="Points"
                  />
                  <span className="text-muted-foreground text-xs">pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </GlassCard>
  );
}
