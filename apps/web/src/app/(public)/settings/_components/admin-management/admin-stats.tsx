"use client";

import { CheckCircle, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { StatsCard } from "../../../moderation/_components/stats-card";
import { type Admin } from "./types";

interface AdminStatsProps {
  admins: Admin[];
}

export function AdminStats({ admins }: AdminStatsProps) {
  const activeCount = admins.filter((a) => a.status === "active").length;
  const has2FACount = admins.filter((a) => a.has2FA).length;

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatsCard
        label="Total Seats"
        value={admins.length}
        icon={Users}
        iconContainerClassName="bg-primary/20"
        iconClassName="text-primary"
      />
      <StatsCard
        label="Active"
        value={activeCount}
        icon={CheckCircle}
        iconContainerClassName="bg-success/20"
        iconClassName="text-success"
      />
      <StatsCard
        label="2FA Enabled"
        value={`${Math.round((has2FACount / admins.length) * 100)}%`}
        icon={CheckCircle}
        subtitle={
          <Badge
            variant="outline"
            className={
              has2FACount === admins.length
                ? "bg-success/20 border-success/30 text-success"
                : "bg-warning/20 border-warning/30 text-warning"
            }>
            Security Health
          </Badge>
        }
      />
    </div>
  );
}
