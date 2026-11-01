"use client";

import { CheckCircle, UserX, Users } from "lucide-react";

import { StatsCard } from "../../../moderation/_components/stats-card";

interface AdminStatsProps {
  total: number | undefined;
  active: number | undefined;
  disabled: number | undefined;
}

export function AdminStats({ total, active, disabled }: AdminStatsProps) {
  const display = (value: number | undefined) => (value === undefined ? "—" : value);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <StatsCard
        label="Total Admins"
        value={display(total)}
        icon={Users}
        iconContainerClassName="bg-primary/20"
        iconClassName="text-primary"
      />
      <StatsCard
        label="Active"
        value={display(active)}
        icon={CheckCircle}
        iconContainerClassName="bg-success/20"
        iconClassName="text-success"
      />
      <StatsCard
        label="Access Revoked"
        value={display(disabled)}
        icon={UserX}
        iconContainerClassName="bg-muted"
        iconClassName="text-muted-foreground"
      />
    </div>
  );
}
