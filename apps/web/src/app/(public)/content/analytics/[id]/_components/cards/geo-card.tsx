import { Globe } from "lucide-react";

import type { ContentAnalyticsDto } from "@/app/_libs/hooks/api/use-admin-analytics";

import { formatCount } from "../../../../_components/listing/listing-config";
import { formatCompactCents, geoRows } from "../video-analytics-config";
import { AnalyticsCard } from "./analytics-card";
import { CardEmptyState } from "./card-empty-state";

/** Top 5 countries by views, with each one's revenue. */
export function GeoCard({ analytics }: { analytics?: ContentAnalyticsDto }) {
  const countries = geoRows(analytics);

  return (
    <AnalyticsCard title="Geographic Distribution" icon={Globe} tone="text-info">
      <div className="space-y-3">
        {!countries?.length && analytics && (
          <CardEmptyState
            icon={Globe}
            title="No views by country yet"
            description="Top countries appear here once viewers watch this video in the selected period."
          />
        )}
        {countries?.map((country, index) => (
          <div key={country.country} className="flex items-center gap-3">
            <span className="text-foreground-secondary w-6 font-medium">#{index + 1}</span>
            <span className="text-foreground flex-1 font-medium">{country.country}</span>
            <span className="text-foreground-secondary text-sm">
              {formatCount(country.views)} views
            </span>
            <span className="text-success text-sm">{formatCompactCents(country.revenueCents)}</span>
          </div>
        ))}
      </div>
    </AnalyticsCard>
  );
}
