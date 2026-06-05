"use client";

import { Gamepad2, UserCheck, UserPlus, Users } from "lucide-react";

interface RealTimePulseProps {
  liveUsers: number;
  liveGameSessions: number;
  subscribedUsers: number;
  signedUpUsers: number;
}

export function RealTimePulse({
  liveUsers,
  liveGameSessions,
  subscribedUsers,
  signedUpUsers,
}: RealTimePulseProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Live Users */}
      <div className="from-success/10 to-success/5 border-success/20 flex items-center gap-4 rounded-xl border bg-linear-to-r px-5 py-3">
        <div className="relative">
          <div className="bg-success live-pulse h-3 w-3 rounded-full" />
          <div className="bg-success absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-50" />
        </div>
        <div className="flex items-center gap-3">
          <Users className="text-success h-5 w-5" />
          <div>
            <p className="text-foreground-secondary text-xs tracking-wide uppercase">Online Now</p>
            <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
              {liveUsers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Live Game Sessions */}
      <div className="from-accent/10 to-accent/5 border-accent/20 flex items-center gap-4 rounded-xl border bg-linear-to-r px-5 py-3">
        <div className="relative">
          <div className="bg-accent live-pulse h-3 w-3 rounded-full" />
          <div className="bg-accent absolute inset-0 h-3 w-3 animate-ping rounded-full opacity-50" />
        </div>
        <div className="flex items-center gap-3">
          <Gamepad2 className="text-accent h-5 w-5" />
          <div>
            <p className="text-foreground-secondary text-xs tracking-wide uppercase">Live Games</p>
            <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
              {liveGameSessions.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Subscribed Users */}
      <div className="from-primary/10 to-primary/5 border-primary/20 flex items-center gap-4 rounded-xl border bg-gradient-to-r px-5 py-3">
        <div className="flex items-center gap-3">
          <UserCheck className="text-primary h-5 w-5" />
          <div>
            <p className="text-foreground-secondary text-xs tracking-wide uppercase">Subscribed</p>
            <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
              {subscribedUsers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Signed Up Users */}
      <div className="from-warning/10 to-warning/5 border-warning/20 flex items-center gap-4 rounded-xl border bg-gradient-to-r px-5 py-3">
        <div className="flex items-center gap-3">
          <UserPlus className="text-warning h-5 w-5" />
          <div>
            <p className="text-foreground-secondary text-xs tracking-wide uppercase">Signed Up</p>
            <p className="font-gaming text-foreground text-2xl font-bold tabular-nums">
              {signedUpUsers.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
