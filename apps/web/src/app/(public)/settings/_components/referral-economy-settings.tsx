"use client";

import { useState } from "react";

import { Calendar, Coins, Gift, Users, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

export function ReferralEconomySettings() {
  const [referralEnabled, setReferralEnabled] = useState(true);
  const [dailyBonusEnabled, setDailyBonusEnabled] = useState(true);
  const [showDisableWarning, setShowDisableWarning] = useState(false);

  // Referral settings
  const [pointsPerInvite, setPointsPerInvite] = useState("500");
  const [maxInvites, setMaxInvites] = useState("10");

  // Daily bonus settings
  const [dailyRewardPoints, setDailyRewardPoints] = useState("10");
  const [dailyXP, setDailyXP] = useState("5");

  const handleReferralToggle = (checked: boolean) => {
    if (!checked) {
      setShowDisableWarning(true);
    } else {
      setReferralEnabled(true);
    }
  };

  const confirmDisable = () => {
    setReferralEnabled(false);
    setShowDisableWarning(false);
    toast.success("Referral program disabled");
  };

  const handleSave = () => {
    toast.success("Economy settings saved successfully");
  };

  return (
    <div className="space-y-6">
      {/* Referral Program */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Users className="text-primary h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Referral Program</CardTitle>
                <p className="text-muted-foreground text-sm">Reward users for inviting friends</p>
              </div>
            </div>
            <Switch checked={referralEnabled} onCheckedChange={handleReferralToggle} />
          </div>
        </CardHeader>
        {referralEnabled && (
          <CardContent className="border-border/30 space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Gift className="text-success h-4 w-4" />
                  Points per Invite
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={pointsPerInvite}
                    onChange={(e) => setPointsPerInvite(e.target.value)}
                    className="bg-background/50"
                  />
                  <span className="text-muted-foreground self-center text-sm">XP</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  XP awarded when an invited user signs up
                </p>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Users className="text-warning h-4 w-4" />
                  Max Invites per Month
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={maxInvites}
                    onChange={(e) => setMaxInvites(e.target.value)}
                    className="bg-background/50"
                  />
                  <span className="text-muted-foreground self-center text-sm">invites</span>
                </div>
                <p className="text-muted-foreground text-xs">
                  Prevents abuse by capping monthly invites
                </p>
              </div>
            </div>
            <div className="bg-accent/10 border-border/30 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Current config:</strong> Users earn{" "}
                <span className="text-success font-medium">{pointsPerInvite} XP</span> per
                successful invite, up to{" "}
                <span className="text-warning font-medium">{maxInvites} invites</span> per month.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Daily Login Bonus */}
      <Card className="border-border/50 bg-card/50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-success/20 flex h-10 w-10 items-center justify-center rounded-lg">
                <Calendar className="text-success h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">Daily Login Bonus</CardTitle>
                <p className="text-muted-foreground text-sm">
                  Reward users for opening the app daily
                </p>
              </div>
            </div>
            <Switch checked={dailyBonusEnabled} onCheckedChange={setDailyBonusEnabled} />
          </div>
        </CardHeader>
        {dailyBonusEnabled && (
          <CardContent className="border-border/30 space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Coins className="text-warning h-4 w-4" />
                  Reward Points
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={dailyRewardPoints}
                    onChange={(e) => setDailyRewardPoints(e.target.value)}
                    className="bg-background/50"
                  />
                  <span className="text-muted-foreground self-center text-sm">Pts</span>
                </div>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Zap className="text-primary h-4 w-4" />
                  Experience Points (XP)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={dailyXP}
                    onChange={(e) => setDailyXP(e.target.value)}
                    className="bg-background/50"
                  />
                  <span className="text-muted-foreground self-center text-sm">XP</span>
                </div>
              </div>
            </div>
            <div className="border-success/30 bg-success/10 rounded-lg border p-3">
              <p className="text-muted-foreground text-sm">
                <strong className="text-foreground">Daily reward:</strong> Users receive{" "}
                <span className="text-warning font-medium">{dailyRewardPoints} Pts</span> +{" "}
                <span className="text-primary font-medium">{dailyXP} XP</span> each day they log in.
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave}>Save Economy Settings</Button>
      </div>

      <ConfirmationDialog
        open={showDisableWarning}
        onOpenChange={setShowDisableWarning}
        title="Disable Referral Program?"
        description={
          <>
            <span className="text-warning font-medium">Warning:</span> Users will stop earning
            points for invites immediately. Pending referral rewards will not be granted.
          </>
        }
        onConfirm={confirmDisable}
        action="warn"
        confirmLabel="Disable Referrals"
      />
    </div>
  );
}
