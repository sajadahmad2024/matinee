"use client";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Clock,
  DollarSign,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  UserMinus,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

interface KPICardProps {
  title: string;
  icon: React.ElementType;
  iconColor: string;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

function KPICard({ title, icon: Icon, iconColor, children, onClick, className }: KPICardProps) {
  return (
    <Card
      className={cn(
        "bg-card border-border group cursor-pointer transition-all duration-200",
        "hover:border-primary/30 hover:shadow-glow-sm p-0",
        className,
      )}
      onClick={onClick}>
      <CardContent className="p-5">
        <div className="mb-4 flex items-start justify-between">
          <div className={cn("rounded-lg p-2.5", iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
          {onClick && (
            <ArrowRight className="text-muted-foreground h-4 w-4 opacity-0 transition-all group-hover:translate-x-1 group-hover:opacity-100" />
          )}
        </div>
        <p className="text-foreground-secondary mb-2 text-sm font-medium">{title}</p>
        {children}
      </CardContent>
    </Card>
  );
}

type HealthStatus = "green" | "yellow" | "red";

function getHealthStatus(count: number): HealthStatus {
  if (count < 50) return "green";
  if (count < 200) return "yellow";
  return "red";
}

const healthColors: Record<HealthStatus, string> = {
  green: "bg-success/20 text-success",
  yellow: "bg-warning/20 text-warning",
  red: "bg-destructive/20 text-destructive",
};

interface CriticalKPIsProps {
  pendingReports: number;
  churnRate: number;
  churnChange: number;
  totalUsers: number;
  activeUsers: number;
  dormantUsers: number;
  monthlyRevenue: number;
  mrr: number;
  revenueGrowth: number;
  avgSessionDuration: string;
  avgDailySessions: number;
}

export function CriticalKPIs({
  pendingReports,
  churnRate,
  churnChange,
  totalUsers,
  activeUsers,
  dormantUsers,
  monthlyRevenue,
  mrr,
  revenueGrowth,
  avgSessionDuration,
  avgDailySessions,
}: CriticalKPIsProps) {
  const router = useRouter();
  const healthStatus = getHealthStatus(pendingReports);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Community Health (Moderation) */}
      <KPICard
        title="Community Health"
        icon={ShieldAlert}
        iconColor="bg-destructive/20 text-destructive"
        onClick={() => router.push("/moderation?sort=oldest" as Route)}>
        <div className="flex items-baseline gap-2">
          <span className="font-gaming text-foreground text-3xl font-bold">{pendingReports}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              healthColors[healthStatus],
            )}>
            {healthStatus === "green"
              ? "Healthy"
              : healthStatus === "yellow"
                ? "Moderate"
                : "Critical"}
          </span>
        </div>
        <p className="text-foreground-secondary mt-1 text-sm">Pending Reports</p>
      </KPICard>

      {/* Churn Rate */}
      <KPICard title="Churn Rate" icon={UserMinus} iconColor="bg-warning/20 text-warning">
        <div className="flex items-baseline gap-2">
          <span className="font-gaming text-foreground text-3xl font-bold">{churnRate}%</span>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              churnChange < 0 ? "text-success" : "text-destructive",
            )}>
            {churnChange < 0 ? (
              <TrendingDown className="h-3 w-3" />
            ) : (
              <TrendingUp className="h-3 w-3" />
            )}
            {Math.abs(churnChange)}%
          </span>
        </div>
        <div className="text-foreground-secondary mt-2 flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {totalUsers.toLocaleString()} Total
          </span>
          <span className="text-success">{activeUsers.toLocaleString()} Active</span>
          <span className="text-muted-foreground">{dormantUsers.toLocaleString()} Dormant</span>
        </div>
      </KPICard>

      {/* Revenue Pulse */}
      <KPICard title="Revenue Pulse" icon={DollarSign} iconColor="bg-success/20 text-success">
        <div className="flex items-baseline gap-2">
          <span className="font-gaming text-foreground text-3xl font-bold">
            ${(monthlyRevenue / 1000).toFixed(1)}K
          </span>
          <span
            className={cn(
              "flex items-center gap-0.5 text-xs font-medium",
              revenueGrowth > 0 ? "text-success" : "text-destructive",
            )}>
            {revenueGrowth > 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {Math.abs(revenueGrowth)}%
          </span>
        </div>
        <p className="text-foreground-secondary mt-1 text-sm">MRR: ${(mrr / 1000).toFixed(1)}K</p>
      </KPICard>

      {/* Average User Session Time */}
      <KPICard title="Avg. User Session Time" icon={Clock} iconColor="bg-primary/20 text-primary">
        <div className="space-y-2">
          <div>
            <span className="font-gaming text-foreground text-2xl font-bold">
              {avgSessionDuration}
            </span>
            <span className="text-foreground-secondary ml-2 text-sm">avg session</span>
          </div>
          <div className="text-foreground-secondary text-sm">
            <span className="text-primary font-medium">{avgDailySessions}</span> sessions/user/day
          </div>
        </div>
      </KPICard>
    </div>
  );
}
