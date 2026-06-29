"use client";

import { Activity, Gamepad2, UserCheck, UserPlus, Users, type LucideIcon } from "lucide-react";

interface RealTimePulseProps {
  totalUsers: number;
  signedUpUsers: number;
  subscribedUsers: number;
  liveUsers: number; // online now
  liveGameSessions: number; // users currently playing games
}

type Tint = "primary" | "warning" | "success" | "accent";

// Full static class strings (Tailwind can't see interpolated class names).
const TINTS: Record<Tint, { wrap: string; icon: string; dot: string }> = {
  primary: { wrap: "from-primary/10 to-primary/5 border-primary/20", icon: "text-primary", dot: "bg-primary" },
  warning: { wrap: "from-warning/10 to-warning/5 border-warning/20", icon: "text-warning", dot: "bg-warning" },
  success: { wrap: "from-success/10 to-success/5 border-success/20", icon: "text-success", dot: "bg-success" },
  accent: { wrap: "from-accent/10 to-accent/5 border-accent/20", icon: "text-accent", dot: "bg-accent" },
};

export function RealTimePulse({
  totalUsers,
  signedUpUsers,
  subscribedUsers,
  liveUsers,
  liveGameSessions,
}: RealTimePulseProps) {
  const stats: { label: string; value: number; icon: LucideIcon; tint: Tint; live?: boolean }[] = [
    { label: "Total Users", value: totalUsers, icon: Users, tint: "primary" },
    { label: "Signed Up", value: signedUpUsers, icon: UserPlus, tint: "warning" },
    { label: "Subscribed", value: subscribedUsers, icon: UserCheck, tint: "success" },
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
                <div className={`absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-50 ${t.dot}`} />
              </div>
            )}
            <div className="flex items-center gap-3">
              <Icon className={`h-5 w-5 ${t.icon}`} />
              <div>
                <p className="text-foreground-secondary text-xs tracking-wide uppercase">{s.label}</p>
                <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
                  {s.value.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
