"use client";

import { CalendarClock, GitPullRequestArrow, Library, Sparkles } from "lucide-react";

import { CONTENT_INVENTORY as INV } from "../constants";
import { SectionHeading } from "./section-heading";
import { StatTile } from "./stat-tile";

export function ContentInventory() {
  const freshnessHealthy = INV.freshnessPct > INV.freshnessHealthyAbove;
  const pipelineTotal = INV.pipeline.draft + INV.pipeline.inReview + INV.pipeline.scheduled;

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Content Inventory"
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

        <StatTile
          label="Freshness"
          value={`${INV.freshnessPct}%`}
          icon={Sparkles}
          accent={freshnessHealthy ? "success" : "danger"}
          trend={{
            direction: freshnessHealthy ? "up" : "down",
            label: freshnessHealthy ? "Healthy" : "Low",
            good: freshnessHealthy,
          }}
          subStats={[
            { label: "Views on < 30-day content", value: `${INV.freshnessPct}%` },
            {
              label: `Healthy > ${INV.freshnessHealthyAbove}%`,
              value: freshnessHealthy ? "On track" : "Needs fresh content",
              accent: freshnessHealthy ? "success" : "danger",
            },
          ]}
        />
      </div>
    </section>
  );
}
