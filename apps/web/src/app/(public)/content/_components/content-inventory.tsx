"use client";

import { CalendarClock, CalendarX2, GitPullRequestArrow, Library } from "lucide-react";

import { SectionHeading } from "@/components/custom/section-heading";
import { StatTile } from "@/components/custom/stat-tile";

import { type ContentRegionKey, contentInventoryForRegion } from "../constants";

interface ContentInventoryProps {
  region: ContentRegionKey;
  /** Region display name, appended to the heading when scoped. */
  regionLabel?: string;
}

export function ContentInventory({ region, regionLabel }: ContentInventoryProps) {
  const INV = contentInventoryForRegion(region);
  // Net-shrinking library (more coming off than going up) is the danger signal.
  const netShrinking = INV.expiringThisMonth > INV.addedThisMonth;
  const pipelineTotal = INV.pipeline.draft + INV.pipeline.inReview + INV.pipeline.scheduled;

  return (
    <section className="space-y-3">
      <SectionHeading
        title={regionLabel ? `Content Inventory — ${regionLabel}` : "Content Inventory"}
        subtitle="The current state of your library"
        icon={Library}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Active Library"
          value={INV.activeLibrary.toLocaleString()}
          icon={Library}
          accent="primary"
          trend={{ direction: "up", label: `+${INV.addedThisMonth} this mo` }}
          subStats={[
            { label: "Total live videos", value: INV.activeLibrary.toLocaleString() },
            { label: "Uploaded < 30 days", value: `${INV.pctUnder30Days}%`, accent: "accent" },
          ]}
        />

        <StatTile
          label="Uploaded This Month"
          value={`${INV.addedThisMonth} / ${INV.uploadTarget}`}
          icon={CalendarClock}
          accent="success"
          progress={{
            value: INV.addedThisMonth,
            max: INV.uploadTarget,
            label: `${Math.round((INV.addedThisMonth / INV.uploadTarget) * 100)}% of monthly goal`,
          }}
          subStats={[{ label: "Days remaining", value: `${INV.daysRemainingInMonth}` }]}
        />

        <StatTile
          label="Expiring This Month"
          value={INV.expiringThisMonth}
          icon={CalendarX2}
          accent={netShrinking ? "danger" : "warning"}
          trend={{
            direction: netShrinking ? "down" : "up",
            label: netShrinking ? "Net shrinking" : "Covered by uploads",
            good: !netShrinking,
          }}
          subStats={[
            {
              label: "Next month",
              value: `${INV.expiringNextMonth}`,
              accent: "warning",
            },
            {
              label: `of ${INV.activeLibrary.toLocaleString()} live`,
              value: `${((INV.expiringThisMonth / INV.activeLibrary) * 100).toFixed(1)}%`,
            },
          ]}
        />

        <StatTile
          label="Pipeline"
          value={pipelineTotal}
          icon={GitPullRequestArrow}
          accent="warning"
          subStats={[
            { label: "Draft", value: `${INV.pipeline.draft}` },
            { label: "In review", value: `${INV.pipeline.inReview}`, accent: "warning" },
            { label: "Scheduled", value: `${INV.pipeline.scheduled}`, accent: "primary" },
            { label: "Avg time to publish", value: `${INV.avgTimeToPublishDays} days` },
          ]}
        />
      </div>
    </section>
  );
}
