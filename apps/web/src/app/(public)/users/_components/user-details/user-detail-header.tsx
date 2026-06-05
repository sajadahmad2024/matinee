"use client";

import { Ban, Clock, Coins, KeyRound, Mail, Trophy } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { User } from "../user-list-table";

interface UserDetailHeaderProps {
  user: User;
}

export function UserDetailHeader({ user }: UserDetailHeaderProps) {
  const xpProgress = 65; // Percentage to next level
  const currentLevel = 12;

  return (
    <div className="border-border/50 bg-muted/30 flex flex-col items-start gap-6 rounded-xl border p-4 sm:flex-row">
      <div className="relative">
        <Avatar className="border-border h-20 w-20 border-2">
          <AvatarImage src={user.avatar} />
          <AvatarFallback className="bg-accent/10 text-accent text-xl">
            {user.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div
          className={`border-card absolute right-1 bottom-1 h-4 w-4 rounded-full border-2 ${
            user.status === "active" ? "bg-success" : "bg-muted-foreground"
          }`}
        />
      </div>

      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-3">
          <h2 className="text-foreground text-xl font-bold">{user.name}</h2>
          <Badge
            variant="outline"
            className={
              user.status === "active"
                ? "bg-success/10 text-success border-success/30"
                : user.status === "suspended"
                  ? "bg-warning/10 text-warning border-warning/30"
                  : "bg-destructive/10 text-destructive border-destructive/30"
            }>
            {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
          </Badge>
        </div>
        <div className="text-muted-foreground flex items-center gap-4 text-sm">
          <span className="flex items-center gap-1">
            <Mail className="h-3 w-3" />
            {user.email}
          </span>
          <span className="font-mono">{user.id}</span>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-foreground text-sm">124h Total Play</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="text-accent h-4 w-4" />
            <span className="text-foreground text-sm">Level {currentLevel}</span>
            <div className="bg-muted h-2 w-20 overflow-hidden rounded-full">
              <div
                className="bg-accent h-full rounded-full"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <span className="text-muted-foreground text-xs">{xpProgress}%</span>
          </div>
          <div className="flex items-center gap-2">
            <Coins className="text-warning h-4 w-4" />
            <span className="text-foreground font-mono text-sm">
              {user.pointsBalance.toLocaleString()} pts
            </span>
          </div>
        </div>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Ban className="h-4 w-4" />
          Suspend User
        </Button>
        <Button variant="outline" size="sm" className="gap-2">
          <KeyRound className="h-4 w-4" />
          Reset Password
        </Button>
      </div>
    </div>
  );
}
