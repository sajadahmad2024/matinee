"use client";

import { Fragment, useState } from "react";

import { ChevronRight, Globe } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/app/_libs/utils/cn";

export interface RegionMetricColumn {
  key: string;
  label: string;
  format?: (n: number) => string;
}

export interface RegionCountryRow {
  name: string;
  values: Record<string, number>;
}

export interface RegionRow {
  code: string;
  label: string;
  values: Record<string, number>;
  countries?: RegionCountryRow[];
}

interface RegionalBreakdownProps {
  columns: RegionMetricColumn[];
  rows: RegionRow[];
  /** metric key used for the share bar + sort (e.g. "users" or "mrr") */
  shareKey: string;
}

/** Region table: macro-regions with a share bar, expandable into country rows. */
export function RegionalBreakdown({ columns, rows, shareKey }: RegionalBreakdownProps) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const total = rows.reduce((sum, r) => sum + (r.values[shareKey] ?? 0), 0) || 1;
  const sorted = [...rows].sort((a, b) => (b.values[shareKey] ?? 0) - (a.values[shareKey] ?? 0));
  const fmt = (col: RegionMetricColumn, v: number | undefined) =>
    col.format ? col.format(v ?? 0) : (v ?? 0).toLocaleString();

  return (
    <div className="border-border/40 overflow-hidden rounded-lg border">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow>
            <TableHead className="min-w-[180px]">Region</TableHead>
            {columns.map((c) => (
              <TableHead key={c.key} className="text-right">
                {c.label}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((r) => {
            const share = Math.round(((r.values[shareKey] ?? 0) / total) * 100);
            const open = expanded[r.code];
            const hasCountries = !!r.countries?.length;
            return (
              <Fragment key={r.code}>
                <TableRow
                  className={cn(hasCountries && "cursor-pointer")}
                  onClick={() => hasCountries && setExpanded((e) => ({ ...e, [r.code]: !e[r.code] }))}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {hasCountries ? (
                        <ChevronRight
                          className={cn(
                            "text-muted-foreground h-4 w-4 transition-transform",
                            open && "rotate-90",
                          )}
                        />
                      ) : (
                        <Globe className="text-muted-foreground h-4 w-4" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="text-foreground text-sm font-medium">{r.label}</div>
                        <div className="bg-muted/40 mt-1 h-1.5 w-32 overflow-hidden rounded-full">
                          <div
                            className="from-primary to-accent h-full rounded-full bg-gradient-to-r"
                            style={{ width: `${share}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-muted-foreground text-xs tabular-nums">{share}%</span>
                    </div>
                  </TableCell>
                  {columns.map((c) => (
                    <TableCell key={c.key} className="text-right text-sm tabular-nums">
                      {fmt(c, r.values[c.key])}
                    </TableCell>
                  ))}
                </TableRow>

                {open &&
                  r.countries?.map((country) => (
                    <TableRow key={`${r.code}-${country.name}`} className="bg-muted/10">
                      <TableCell className="text-muted-foreground py-2 pl-12 text-sm">
                        {country.name}
                      </TableCell>
                      {columns.map((c) => (
                        <TableCell key={c.key} className="text-muted-foreground py-2 text-right text-xs tabular-nums">
                          {fmt(c, country.values[c.key])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
