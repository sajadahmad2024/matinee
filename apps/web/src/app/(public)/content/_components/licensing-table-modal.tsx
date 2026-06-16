"use client";

import { useState } from "react";

import type { Route } from "next";
import { useRouter } from "next/navigation";

import { ChevronRight, Search } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { cn } from "@/app/_libs/utils/cn";

import { LICENSE_ROWS, type RenewalStatus } from "../constants";

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

const money = (n: number) => `$${n.toLocaleString()}`;

interface LicensingTableModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LicensingTableModal({ open, onOpenChange }: LicensingTableModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const q = query.toLowerCase();

  const openContent = (title: string) => {
    onOpenChange(false);
    router.push(`/content?q=${encodeURIComponent(title)}` as Route, { scroll: false });
  };
  const rows = LICENSE_ROWS.filter(
    (r) => r.contentTitle.toLowerCase().includes(q) || r.licensor.toLowerCase().includes(q),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-hidden sm:max-w-5xl">
        <DialogHeader>
          <DialogTitle>Licensing &amp; Rights — Operational</DialogTitle>
        </DialogHeader>

        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-sm">
            {rows.length} agreement{rows.length === 1 ? "" : "s"} · click a row to open the content
          </p>
          <div className="relative w-64">
            <Search className="text-muted-foreground absolute top-2.5 left-3 h-4 w-4" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search content / licensor…"
              className="h-9 pl-9"
            />
          </div>
        </div>

        <div className="border-border/40 max-h-[64vh] overflow-auto rounded-lg border">
          <Table>
            <TableHeader className="bg-muted/30 sticky top-0 z-10">
              <TableRow>
                <TableHead>Content</TableHead>
                <TableHead>Licensor</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead className="text-right">Days Left</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">License Cost</TableHead>
                <TableHead className="text-right">ROI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-muted-foreground py-8 text-center">
                    No matching agreements.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((r) => {
                  const roi = r.licenseCost > 0 ? r.revenueGenerated / r.licenseCost : 0;
                  return (
                    <TableRow
                      key={r.contentTitle}
                      onClick={() => openContent(r.contentTitle)}
                      className="hover:bg-muted/30 group cursor-pointer">
                      <TableCell className="max-w-[220px] font-medium">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate">{r.contentTitle}</span>
                          <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100" />
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{r.licensor}</TableCell>
                      <TableCell className="text-sm">{r.expires}</TableCell>
                      <TableCell className={cn("text-right text-sm font-medium tabular-nums", daysTone(r.daysLeft))}>
                        {r.daysLeft < 0 ? `${r.daysLeft}` : r.daysLeft}
                      </TableCell>
                      <TableCell>
                        <Badge className={cn("border-0 text-[10px]", RENEWAL_TONE[r.renewalStatus])}>
                          {RENEWAL_LABEL[r.renewalStatus]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-success text-right text-sm tabular-nums">
                        {money(r.revenueGenerated)}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">{r.revenueSource}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{money(r.licenseCost)}</TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-sm font-semibold tabular-nums",
                          roi >= 2 ? "text-success" : roi >= 1 ? "text-warning" : "text-destructive",
                        )}>
                        {roi.toFixed(1)}×
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}
