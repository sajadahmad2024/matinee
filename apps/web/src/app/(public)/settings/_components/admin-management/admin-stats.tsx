"use client";

import { CheckCircle, MailPlus, Users } from "lucide-react";

import { StatsCard } from "../../../moderation/_components/stats-card";
import { type Admin } from "./types";

interface AdminStatsProps {
  admins: Admin[];
}

export function AdminStats({ admins }: AdminStatsProps) {
  const activeCount = admins.filter((a) => a.status === "active").length;
  const invitedCount = admins.filter((a) => a.status === "invited").length;

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
        label="Pending Invites"
        value={invitedCount}
        icon={MailPlus}
        iconContainerClassName="bg-warning/20"
        iconClassName="text-warning"
      />
    </div>
  );
}
