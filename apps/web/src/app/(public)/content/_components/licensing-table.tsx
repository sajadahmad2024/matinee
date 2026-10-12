"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ChevronRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { cn } from "@/app/_libs/utils/cn";
import { CustomSearch } from "@/components/custom/custom-search";
import { type Column, DataTable } from "@/components/custom/data-table";

import { LICENSE_ROWS, type LicenseRow, type RenewalStatus } from "../constants";
import { CONTENT_TABLE_CLASS_NAMES } from "./content-table-class-names";

const RENEWAL_LABEL: Record<RenewalStatus, string> = {
  renewing: "Renewing",
  in_negotiation: "In negotiation",
  expiring: "Expiring",
  lapsed: "Lapsed",
  auto_renew: "Auto-renew",
};

const RENEWAL_TONE: Record<RenewalStatus, string> = {
  renewing: "bg-success/15 text-success",
  in_negotiation: "bg-warning/15 text-warning",
  expiring: "bg-destructive/15 text-destructive",
  lapsed: "bg-muted text-muted-foreground",
  auto_renew: "bg-primary/15 text-primary",
};

function daysTone(days: number) {
  if (days < 30) return "text-destructive";
  if (days <= 90) return "text-warning";
  return "text-success";
}

function roiOf(row: LicenseRow) {
  return row.licenseCost > 0 ? row.revenueGenerated / row.licenseCost : 0;
}

const money = (n: number) => `$${n.toLocaleString()}`;

const COLUMNS: Column<LicenseRow>[] = [
  {
    header: "Content",
    className: "max-w-[220px] font-medium",
    cell: (r) => (
      <div className="flex items-center gap-1.5">
        <span className="truncate">{r.contentTitle}</span>
        <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    ),
  },
  { header: "Licensor", accessorKey: "licensor", className: "text-muted-foreground text-sm" },
  { header: "Expires", accessorKey: "expires", className: "text-sm" },
  {
    header: "Days Left",
    headerClassName: "text-right",
    cell: (r) => <span className={daysTone(r.daysLeft)}>{r.daysLeft}</span>,
    className: "text-right text-sm font-medium tabular-nums",
  },
  {
    header: "Renewal",
    cell: (r) => (
      <Badge className={cn("border-0 text-[10px]", RENEWAL_TONE[r.renewalStatus])}>
        {RENEWAL_LABEL[r.renewalStatus]}
      </Badge>
    ),
  },
  {
    header: "Revenue",
    headerClassName: "text-right",
    cell: (r) => money(r.revenueGenerated),
    className: "text-success text-right text-sm tabular-nums",
  },
  { header: "Source", accessorKey: "revenueSource", className: "text-muted-foreground text-xs" },
  {
    header: "License Cost",
    headerClassName: "text-right",
    cell: (r) => money(r.licenseCost),
    className: "text-right text-sm tabular-nums",
  },
  {
    header: "ROI",
    headerClassName: "text-right",
    cell: (r) => {
      const roi = roiOf(r);
      return (
        <span
          className={cn(
            roi >= 2 ? "text-success" : roi >= 1 ? "text-warning" : "text-destructive",
          )}>
          {roi.toFixed(1)}×
        </span>
      );
    },
    className: "text-right text-sm font-semibold tabular-nums",
  },
];

/**
 * Operational licensing agreements — rendered inline in the Licensing & Rights
 * section (client: the table is part of the section, not behind a button).
 */
export function LicensingTable() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();

  const openContent = (row: LicenseRow) =>
    router.push(`/content?q=${encodeURIComponent(row.contentTitle)}` as Route, { scroll: false });

  const rows = LICENSE_ROWS.filter(
    (r) => r.contentTitle.toLowerCase().includes(q) || r.licensor.toLowerCase().includes(q),
  );

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">
          {rows.length} agreement{rows.length === 1 ? "" : "s"} · click a row to open the content
        </p>
        <CustomSearch
          onSearch={setQuery}
          debounceMs={0}
          placeholder="Search content / licensor…"
          isClearable={false}
          containerClassName="w-64"
          inputClassName="text-base md:text-sm"
        />
      </div>

      <DataTable
        columns={COLUMNS}
        data={rows}
        rowIdKey="contentTitle"
        onRowClick={openContent}
        className="border-border/40 max-h-[520px] rounded-lg border bg-transparent"
        classNames={{ ...CONTENT_TABLE_CLASS_NAMES, row: "hover:bg-muted/30 group border-border" }}
        emptyState="No matching agreements."
      />
    </div>
  );
}
