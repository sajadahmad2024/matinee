"use client";

import { Activity, Download, Gamepad2, type LucideIcon, UserCheck, Users } from "lucide-react";

interface RealTimePulseProps {
  totalDownloads: number; // installs, incl. users who never signed up
  totalUsers: number; // signed-up accounts
  subscribedUsers: number;
  /** Lifetime revenue these subscribers have generated — shown alongside the count. */
  lifetimeRevenue: number;
  /** Average lifetime value per subscriber (matches Subscriptions → Avg LTV). */
  avgLifetimeValue: number;
  liveUsers: number; // online now
  liveGameSessions: number; // users currently playing games
}

type Tint = "primary" | "warning" | "success" | "accent";

// Full static class strings (Tailwind can't see interpolated class names).
const TINTS: Record<Tint, { wrap: string; icon: string; dot: string }> = {
  primary: {
    wrap: "from-primary/10 to-primary/5 border-primary/20",
    icon: "text-primary",
    dot: "bg-primary",
  },
  warning: {
    wrap: "from-warning/10 to-warning/5 border-warning/20",
    icon: "text-warning",
    dot: "bg-warning",
  },
  success: {
    wrap: "from-success/10 to-success/5 border-success/20",
    icon: "text-success",
    dot: "bg-success",
  },
  accent: {
    wrap: "from-accent/10 to-accent/5 border-accent/20",
    icon: "text-accent",
    dot: "bg-accent",
  },
};

const money = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` : `$${(n / 1000).toFixed(1)}K`;

export function RealTimePulse({
  totalDownloads,
  totalUsers,
  subscribedUsers,
  lifetimeRevenue,
  avgLifetimeValue,
  liveUsers,
  liveGameSessions,
}: RealTimePulseProps) {
  // MasterBoard order, client-specified: Total Downloads → Total Users → Total Subscribers,
  // then the two live counters.
  const stats: {
    label: string;
    value: number;
    icon: LucideIcon;
    tint: Tint;
    live?: boolean;
    sub?: string;
  }[] = [
    { label: "Total Downloads", value: totalDownloads, icon: Download, tint: "primary" },
    { label: "Total Users", value: totalUsers, icon: Users, tint: "warning" },
    {
      label: "Total Subscribers",
      value: subscribedUsers,
      icon: UserCheck,
      tint: "success",
      // The $ these subscribers are actually worth — the count alone never answered that.
      sub: `${money(lifetimeRevenue)} lifetime · $${avgLifetimeValue} avg LTV`,
    },
    { label: "Online Now", value: liveUsers, icon: Activity, tint: "accent", live: true },
    { label: "Playing Games", value: liveGameSessions, icon: Gamepad2, tint: "accent", live: true },
  ];

  return (
    <div className="flex flex-wrap gap-4">
      {stats.map((s) => {
        const Icon = s.icon;
        const t = TINTS[s.tint];
        return (
          <div
            key={s.label}
            className={`flex items-center gap-4 rounded-xl border bg-linear-to-r px-5 py-3 ${t.wrap}`}>
            {s.live && (
              <div className="relative">
                <div className={`live-pulse h-3 w-3 rounded-full ${t.dot}`} />
                <div
                  className={`absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-50 ${t.dot}`}
                />
              </div>
            )}
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${t.icon}`} />
              <div>
                <p className="text-foreground-secondary text-xs tracking-wide uppercase">
                  {s.label}
                </p>
                <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
                  {s.value.toLocaleString()}
                </p>
                {s.sub && <p className="text-success mt-0.5 text-xs font-medium">{s.sub}</p>}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
