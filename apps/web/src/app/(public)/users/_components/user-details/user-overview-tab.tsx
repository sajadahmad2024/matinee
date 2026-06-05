"use client";

import { CreditCard, Trophy } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import type { User } from "../user-list-table";
import { DetailItem } from "./detail-item";

interface UserOverviewTabProps {
  user: User;
}

const badges = [
  { name: "Contest Champion", icon: "🏆", earned: true },
  { name: "Streak Champion", icon: "🔥", earned: true },
  { name: "Binge Watcher", icon: "⭐", earned: true },
  { name: "Speed Demon", icon: "⚡", earned: false },
  { name: "First Place", icon: "👑", earned: false },
];

export function UserOverviewTab({ user }: UserOverviewTabProps) {
  return (
    <div className="mt-4 space-y-4">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Subscription Card */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <CreditCard className="text-accent h-4 w-4" />
              Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailItem
              label="Plan"
              value={
                <Badge className="bg-accent/10 text-accent">{user.subscriptionTier || "Free"}</Badge>
              }
            />
            <DetailItem label="Next Billing" value="Feb 1, 2024" />
            <DetailItem
              label="LTV"
              value="$289.50"
              valueClassName="text-success font-mono font-medium"
            />
          </CardContent>
        </Card>

        {/* Personal Info */}
        <Card className="border-border/50 bg-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Personal Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <DetailItem label="Country" value={user.country} />
            <DetailItem label="Device" value="iOS" />
            <DetailItem label="Registered" value="Oct 15, 2023" />
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="border-border/50 bg-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Trophy className="text-warning h-4 w-4" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {badges.map((badge) => (
              <div
                key={badge.name}
                className={`flex items-center gap-2 rounded-lg border p-2 ${
                  badge.earned
                    ? "bg-accent/10 border-accent/30"
                    : "bg-muted/30 border-border/50 opacity-50"
                }`}>
                <span className="text-xl">{badge.icon}</span>
                <span className="text-foreground text-xs">{badge.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
