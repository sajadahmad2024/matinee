"use client";

import { Coins, Gamepad2, Target, Users } from "lucide-react";

import { StatTile } from "@/components/custom/stat-tile";

/**
 * Master analytics — the "3–4 boxes, master on all games" the client asked for.
 * ⚠️ Metric choice is a GeekyAnts proposal pending client sign-off (product-context §4.1).
 */
interface MasterAnalyticsProps {
  timeRange?: string;
}

export function MasterAnalytics({ timeRange = "7d" }: MasterAnalyticsProps) {
  // Mock — replace with API data scoped to timeRange later.
  void timeRange;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatTile
        label="Active Players (7d)"
        value="24.4K"
        icon={Users}
        accent="accent"
        trend={{ direction: "up", label: "+6.1%" }}
        sparkline={[18.2, 19.4, 20.1, 21.8, 22.6, 23.5, 24.4]}
      />
      <StatTile
        label="Participation by Format"
        value="68%"
        icon={Gamepad2}
        accent="primary"
        subStats={[
          { label: "Daily Streak", value: "12.8K" },
          { label: "Weekly Quests", value: "8.4K" },
          { label: "Shared Content", value: "5.2K" },
          { label: "Predictive", value: "6.1K" },
        ]}
      />
      <StatTile
        label="Points Economy"
        value="890K minted"
        icon={Coins}
        accent="warning"
        subStats={[
          { label: "Points spent", value: "512K", accent: "success" },
          { label: "Net outstanding", value: "+378K" },
        ]}
      />
      <StatTile
        label="Completion Rate"
        value="78%"
        icon={Target}
        accent="success"
        trend={{ direction: "up", label: "+2.3%" }}
      />
    </div>
  );
}
