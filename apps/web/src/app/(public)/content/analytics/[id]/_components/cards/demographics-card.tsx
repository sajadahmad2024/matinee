import { Users } from "lucide-react";
import { FaAndroid, FaApple } from "react-icons/fa";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { ageRows, deviceShares } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";

/** Viewer age groups and the iOS / Android split. */
export function DemographicsCard({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const age = ageRows(analytics);
  const shares = deviceShares(analytics);
  const devices = [
    { name: "iOS", value: shares.ios, icon: FaApple },
    { name: "Android", value: shares.android, icon: FaAndroid },
  ];

  return (
    <AnalyticsCard
      title="Demographics"
      icon={Users}
      tone="text-primary"
      contentClassName="space-y-6">
      <div>
        <p className="text-foreground-secondary mb-2 text-xs font-medium">Age Range</p>
        <div className="space-y-2">
          {!age && analytics && (
            <p className="text-muted-foreground py-2 text-xs">
              No age data yet — viewers haven&apos;t shared a date of birth.
            </p>
          )}
          {age?.map((item) => (
            <div key={item.range} className="flex items-center gap-2">
              <span className="text-foreground-secondary w-12 text-xs">{item.range}</span>
              <div className="bg-background h-4 flex-1 overflow-hidden rounded-full">
                <div
                  className="from-primary to-accent h-full bg-gradient-to-r"
                  style={{ width: `${item.value}%` }}
                />
              </div>
              <span className="text-foreground w-8 text-right text-xs">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="text-foreground-secondary mb-2 text-xs font-medium">Device Type</p>
        <div className="flex gap-4">
          {devices?.map(({ name, value, icon: DeviceIcon }) => (
            <div key={name} className="bg-background-tertiary flex-1 rounded-lg p-3 text-center">
              <DeviceIcon className="text-primary mx-auto mb-1 h-5 w-5" />
              <p className="text-foreground text-lg font-bold">{value}%</p>
              <p className="text-foreground-secondary text-xs">{name}</p>
            </div>
          ))}
        </div>
      </div>
    </AnalyticsCard>
  );
}
