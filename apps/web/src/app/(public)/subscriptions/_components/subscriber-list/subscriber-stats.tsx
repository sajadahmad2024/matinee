"use client";

import { CheckCircle, Clock, Users, AlertCircle } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { Subscriber } from "./types";

interface SubscriberStatsProps {
  subscribers: Subscriber[];
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export function SubscriberStats({
  subscribers,
  statusFilter,
  onStatusFilterChange,
}: SubscriberStatsProps) {
  const stats = {
    total: subscribers.length,
    active: subscribers.filter((s) => s.planStatus === "active").length,
    pastDue: subscribers.filter((s) => s.planStatus === "past_due").length,
    canceled: subscribers.filter((s) => s.planStatus === "canceled").length,
  };

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <Card
        className={`cursor-pointer border-border/50 bg-card/50 transition-all ${
          statusFilter === "all" ? "ring-primary ring-2" : "hover:bg-accent/10"
        }`}
        onClick={() => onStatusFilterChange("all")}>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="bg-primary/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <Users className="text-primary h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">{stats.total}</p>
            <p className="text-muted-foreground text-xs">Total Subscribers</p>
          </div>
        </CardContent>
      </Card>
      <Card
        className={`cursor-pointer border-border/50 bg-card/50 transition-all ${
          statusFilter === "active" ? "ring-success ring-2" : "hover:bg-accent/10"
        }`}
        onClick={() => onStatusFilterChange("active")}>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="bg-success/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <CheckCircle className="text-success h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">{stats.active}</p>
            <p className="text-muted-foreground text-xs">Active</p>
          </div>
        </CardContent>
      </Card>
      <Card
        className={`cursor-pointer border-border/50 bg-card/50 transition-all ${
          statusFilter === "past_due" ? "ring-warning ring-2" : "hover:bg-accent/10"
        }`}
        onClick={() => onStatusFilterChange("past_due")}>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="bg-warning/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <Clock className="text-warning h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">{stats.pastDue}</p>
            <p className="text-muted-foreground text-xs">Past Due</p>
          </div>
        </CardContent>
      </Card>
      <Card
        className={`cursor-pointer border-border/50 bg-card/50 transition-all ${
          statusFilter === "canceled" ? "ring-muted ring-2" : "hover:bg-accent/10"
        }`}
        onClick={() => onStatusFilterChange("canceled")}>
        <CardContent className="flex items-center gap-3 p-3">
          <div className="bg-muted/20 flex h-8 w-8 items-center justify-center rounded-lg">
            <AlertCircle className="text-muted-foreground h-4 w-4" />
          </div>
          <div>
            <p className="text-foreground text-lg font-bold">{stats.canceled}</p>
            <p className="text-muted-foreground text-xs">Canceled</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
