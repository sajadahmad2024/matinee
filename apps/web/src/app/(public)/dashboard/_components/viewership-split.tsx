"use client";

import { Eye } from "lucide-react";

import { MACRO_REGIONS } from "@/app/_libs/regions";
import { SectionHeading } from "@/components/custom/section-heading";

import { REGION_ANALYTICS } from "../constants";

/**
 * Slide-6 bottom table: how much of the user base watches, and how much of it plays.
 * Both percentages are measured against the SAME denominator — total users — and are
 * independent of each other, so they do not sum to 100%: a gamified user is also a
 * viewer. Shown as tinted percentage chips rather than a split bar, which could only
 * ever depict one ratio and implied the two were two halves of one whole.
 */
export function ViewershipSplit() {
  // The per-region mock user counts are generated with jitter and overshoot the platform
  // total, which would print a different "Total Users" here than the MasterBoard tile
  // right above. Normalise each region to its share of the signed-up base so the two
  // always agree and the column still sums to the headline.
  const raw = MACRO_REGIONS.map((r) => {
    const a = REGION_ANALYTICS[r.code]!;
    return {
      code: r.code,
      label: r.label,
      users: a.strip.users,
      viewers: a.screenTime.viewers,
      gamified: a.screenTime.gamified,
    };
  });
  const rawUsers = raw.reduce((s, r) => s + r.users, 0) || 1;
  const baseUsers = REGION_ANALYTICS["global"]!.strip.users;
  const rows = raw.map((r) => ({
    ...r,
    users: Math.round((r.users / rawUsers) * baseUsers),
  }));

  const totalUsers = rows.reduce((s, r) => s + r.users, 0);
  const totalViewers = rows.reduce((s, r) => s + r.viewers, 0);
  const totalGamified = rows.reduce((s, r) => s + r.gamified, 0);
  const pct = (part: number, whole: number) => Math.round((part / whole) * 100);

  const headline = [
    {
      label: "Total Users",
      value: totalUsers.toLocaleString(),
      sub: "the base both percentages are measured against",
      tone: "text-foreground",
    },
    {
      label: "Viewer %",
      value: `${pct(totalViewers, totalUsers)}%`,
      sub: `${totalViewers.toLocaleString()} of ${totalUsers.toLocaleString()} users watch`,
      tone: "text-accent",
    },
    {
      label: "Gamified %",
      value: `${pct(totalGamified, totalUsers)}%`,
      sub: `${totalGamified.toLocaleString()} of ${totalUsers.toLocaleString()} users play`,
      tone: "text-primary",
    },
  ];

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Viewership vs Active Gamification"
        subtitle="What share of all users watches, and what share plays — two independent shares of the same base, so they do not add up to 100%"
        icon={Eye}
      />

      {/* The headline numbers — this is the whole point of the section */}
      <div className="grid gap-3 sm:grid-cols-3">
        {headline.map((h) => (
          <div key={h.label} className="border-border bg-card/50 rounded-lg border px-4 py-3">
            <p className="text-foreground-secondary text-xs tracking-wide uppercase">{h.label}</p>
            <p className={`font-gaming mt-1 text-2xl font-bold tabular-nums ${h.tone}`}>
              {h.value}
            </p>
            <p className="text-muted-foreground mt-0.5 text-xs">{h.sub}</p>
          </div>
        ))}
      </div>

      {/* Same two percentages, per region */}
      <div className="border-border bg-card/50 overflow-hidden rounded-lg border">
        <div className="text-muted-foreground border-border/50 grid grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr_0.8fr] items-center gap-2 border-b px-4 py-2 text-[11px] font-medium uppercase">
          <span>Region</span>
          <span className="text-right">Total users</span>
          <span className="text-right">Viewers</span>
          <span className="text-right">Viewer %</span>
          <span className="text-right">Gamified</span>
          <span className="text-right">Gamified %</span>
        </div>
        {rows.map((r) => (
          <div
            key={r.code}
            className="border-border/30 grid grid-cols-[1.6fr_1fr_1fr_0.8fr_1fr_0.8fr] items-center gap-2 border-b px-4 py-2.5 text-sm last:border-b-0">
            <span className="text-foreground font-medium">
              {r.label} <span className="text-muted-foreground text-xs">({r.code})</span>
            </span>
            <span className="text-foreground text-right tabular-nums">
              {r.users.toLocaleString()}
            </span>
            <span className="text-muted-foreground text-right tabular-nums">
              {r.viewers.toLocaleString()}
            </span>
            <span className="text-right">
              <span className="bg-accent/15 text-accent inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums">
                {pct(r.viewers, r.users)}%
              </span>
            </span>
            <span className="text-muted-foreground text-right tabular-nums">
              {r.gamified.toLocaleString()}
            </span>
            <span className="text-right">
              <span className="bg-primary/15 text-primary inline-block rounded px-2 py-0.5 text-xs font-semibold tabular-nums">
                {pct(r.gamified, r.users)}%
              </span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
