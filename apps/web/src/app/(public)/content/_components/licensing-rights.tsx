"use client";

import { useState } from "react";

import { AlertTriangle, Coins, FileText, Scale, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";

import { LICENSING_SUMMARY as LIC } from "../constants";
import { LicensingTableModal } from "./licensing-table-modal";
import { SectionHeading } from "./section-heading";
import { StatTile } from "./stat-tile";

export function LicensingRights() {
  const [tableOpen, setTableOpen] = useState(false);
  const totalRights = LIC.licensed + LIC.original;
  const licensedPct = Math.round((LIC.licensed / totalRights) * 100);
  const expiringAlert = LIC.expiring30 > 5;

  return (
    <section className="space-y-3">
      <SectionHeading
        title="Licensing & Rights"
        subtitle="Cost, efficiency and expiry — click a tile for the full table"
        icon={Scale}
        action={
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setTableOpen(true)}>
            <Table2 className="h-4 w-4" /> Licensing table
          </Button>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatTile
          label="Licensed Content"
          value={LIC.licensed.toLocaleString()}
          icon={FileText}
          accent="primary"
          onClick={() => setTableOpen(true)}
          subStats={[
            { label: "Licensed", value: `${LIC.licensed.toLocaleString()} (${licensedPct}%)`, accent: "primary" },
            { label: "Original / owned", value: LIC.original.toLocaleString(), accent: "accent" },
          ]}
        />

        <StatTile
          label="Active Licensing Cost"
          value={`$${(LIC.monthlyCost / 1000).toFixed(1)}K`}
          icon={Coins}
          accent="warning"
          trend={{
            direction: LIC.monthlyCostTrendPct >= 0 ? "up" : "down",
            label: `${LIC.monthlyCostTrendPct >= 0 ? "+" : ""}${LIC.monthlyCostTrendPct}% vs last mo`,
            good: LIC.monthlyCostTrendPct < 0, // lower cost is good
          }}
          subStats={[{ label: "Spent this month", value: `$${LIC.monthlyCost.toLocaleString()}` }]}
        />

        <StatTile
          label="Cost Per Stream"
          value={`$${LIC.costPerStream.toFixed(4)}`}
          icon={Scale}
          accent="success"
          trend={{
            direction: LIC.costPerStreamTrendPct >= 0 ? "up" : "down",
            label: `${LIC.costPerStreamTrendPct >= 0 ? "+" : ""}${LIC.costPerStreamTrendPct}%`,
            good: LIC.costPerStreamTrendPct < 0,
          }}
          subStats={[{ label: "Licensing cost ÷ licensed views", value: "efficiency" }]}
        />

        <StatTile
          label="Expiring Licenses"
          value={LIC.expiring30}
          icon={AlertTriangle}
          accent={expiringAlert ? "danger" : "warning"}
          onClick={() => setTableOpen(true)}
          trend={
            expiringAlert ? { direction: "up", label: "Alert", good: false } : undefined
          }
          subStats={[
            { label: "In 30 days", value: `${LIC.expiring30}`, accent: expiringAlert ? "danger" : "warning" },
            { label: "In 60 days", value: `${LIC.expiring60}` },
            { label: "In 90 days", value: `${LIC.expiring90}` },
          ]}
        />
      </div>

      <LicensingTableModal open={tableOpen} onOpenChange={setTableOpen} />
    </section>
  );
}
