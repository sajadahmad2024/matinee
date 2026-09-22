"use client";

import { AlertTriangle, Crown, Gamepad2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CardContent } from "@/components/ui/card";

import { AnalyticsHeader } from "../../games/_components/analytics-header";
import { GlassCard } from "../../games/_components/glass-card";

const whales = [
  { name: "JohnDoe_VIP", revenue: 2450, avatar: "" },
  { name: "PremiumUser99", revenue: 1890, avatar: "" },
  { name: "MovieLover2024", revenue: 1654, avatar: "" },
  { name: "SuperFan_X", revenue: 1420, avatar: "" },
  { name: "EliteWatcher", revenue: 1280, avatar: "" },
];

const powerGamers = [
  { name: "GameMaster_Pro", games: 342, winRate: 78 },
  { name: "QuizChampion", games: 298, winRate: 72 },
  { name: "StreakKing", games: 276, winRate: 85 },
];

const churnRisk = [
  { name: "HighValue_User1", ltv: 890, lastActive: "18 days ago" },
  { name: "Premium_Player", ltv: 654, lastActive: "15 days ago" },
  { name: "LoyalFan_2023", ltv: 542, lastActive: "21 days ago" },
];

/**
 * Who the individual users are — Top Spenders, Power Gamers, Churn Risk. Promoted to the
 * top of User Management: the named-user segments are what admins act on, the cohort
 * charts further down are what they study.
 */
export function UserSegments() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {/* Whales */}
      <GlassCard>
        <AnalyticsHeader
          title="Top Spenders"
          description="Highest revenue users"
          icon={Crown}
          iconColor="text-warning"
        />
        <CardContent className="pt-2">
          <div className="space-y-3">
            {whales.map((user, index) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-4 font-mono text-xs">#{index + 1}</span>
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-accent/10 text-accent text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground max-w-[100px] truncate text-sm">
                    {user.name}
                  </span>
                </div>
                <span className="text-success font-mono text-sm">${user.revenue}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Power Gamers */}
      <GlassCard>
        <AnalyticsHeader
          title="Power Gamers"
          description="Highest participation"
          icon={Gamepad2}
          iconColor="text-accent"
        />
        <CardContent className="pt-2">
          <div className="space-y-3">
            {powerGamers.map((user, index) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground w-4 font-mono text-xs">#{index + 1}</span>
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-accent/10 text-accent text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-foreground max-w-[100px] truncate text-sm">
                    {user.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-foreground font-mono text-sm">{user.games}</span>
                  <span className="text-muted-foreground ml-1 text-xs">games</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>

      {/* Churn Risk */}
      <GlassCard className="bg-destructive/5 border-destructive/20">
        <AnalyticsHeader
          title="Churn Risk"
          description="High-value users at risk"
          icon={AlertTriangle}
          iconColor="text-destructive"
        />
        <CardContent className="pt-2">
          <div className="space-y-3">
            {churnRisk.map((user) => (
              <div key={user.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="bg-destructive/10 text-destructive text-xs">
                      {user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <span className="text-foreground block max-w-[100px] truncate text-sm">
                      {user.name}
                    </span>
                    <span className="text-destructive text-xs">{user.lastActive}</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  ${user.ltv} LTV
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </GlassCard>
    </div>
  );
}
