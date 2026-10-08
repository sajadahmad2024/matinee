"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { BarChart3, Eye, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { type AdItem, type AdStatus, fmtDateRange, fmtNum } from "../constants";
import { AdStatusBadge } from "./ad-status-badge";

type Tab = "all" | AdStatus;

const TABS: { value: Tab; label: string }[] = [
  { value: "all", label: "All" },
  { value: "live", label: "Live" },
  { value: "scheduled", label: "Scheduled" },
  { value: "paused", label: "Paused" },
  { value: "ended", label: "Ended" },
];

const inTab = (a: AdItem, tab: Tab) => tab === "all" || a.status === tab;

/** Ad list — tabs, search, and a row menu. Actions change local mock state only. */
export function AdList({ initialAds }: { initialAds: AdItem[] }) {
  const router = useRouter();
  const [ads, setAds] = useState(initialAds);
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [ending, setEnding] = useState<AdItem | null>(null);

  const needle = q.trim().toLowerCase();
  const visible = ads.filter(
    (a) =>
      inTab(a, tab) &&
      (!needle || a.name.toLowerCase().includes(needle) || a.advertiser.toLowerCase().includes(needle)),
  );

  const setStatus = (id: string, status: AdStatus) =>
    setAds((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ads or advertisers"
            className="pl-9"
          />
        </div>
        <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
          <TabsList>
            {TABS.map((t) => (
              <TabsTrigger key={t.value} value={t.value} className="cursor-pointer">
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ad</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Impressions</TableHead>
              <TableHead className="text-right">Completion</TableHead>
              <TableHead className="w-28" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground py-10 text-center">
                  No ads here.
                </TableCell>
              </TableRow>
            )}
            {visible.map((ad) => {
              const delivered = ad.stats.impressions > 0;
              return (
                <TableRow
                  key={ad.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/ads/${ad.id}` as Route)}>
                  <TableCell>
                    <Link
                      href={`/ads/${ad.id}` as Route}
                      className="text-foreground font-medium hover:underline"
                      onClick={(e) => e.stopPropagation()}>
                      {ad.name}
                    </Link>
                    <p className="text-muted-foreground text-xs">
                      {ad.advertiser}
                    </p>
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {fmtDateRange(ad.startsAt, ad.endsAt)}
                  </TableCell>
                  <TableCell>
                    <AdStatusBadge status={ad.status} />
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {delivered ? fmtNum(ad.stats.impressions) : "—"}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">
                    {delivered ? `${ad.stats.completionRate}%` : "—"}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View details">
                        <Link href={`/ads/${ad.id}` as Route} aria-label="View details">
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View analytics">
                        <Link href={`/ads/${ad.id}/analytics` as Route} aria-label="View analytics">
                          <BarChart3 className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Ad actions">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="border-border bg-card">
                          <DropdownMenuItem asChild>
                            <Link href={`/ads/${ad.id}/edit` as Route}>Edit</Link>
                          </DropdownMenuItem>
                          {(ad.status === "live" || ad.status === "scheduled") && (
                            <DropdownMenuItem
                              onClick={() => {
                                setStatus(ad.id, "paused");
                                toast.success(`“${ad.name}” paused`);
                              }}>
                              Pause
                            </DropdownMenuItem>
                          )}
                          {ad.status === "paused" && (
                            <DropdownMenuItem
                              onClick={() => {
                                setStatus(ad.id, "live");
                                toast.success(`“${ad.name}” resumed`);
                              }}>
                              Resume
                            </DropdownMenuItem>
                          )}
                          {ad.status !== "ended" && (
                            <DropdownMenuItem className="text-destructive" onClick={() => setEnding(ad)}>
                              End now
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <ConfirmationDialog
        open={!!ending}
        onOpenChange={(o) => !o && setEnding(null)}
        action="custom"
        title="End this ad now?"
        description={`“${ending?.name}” stops showing immediately. Its stats are kept.`}
        confirmLabel="End now"
        onConfirm={() => {
          if (ending) {
            setStatus(ending.id, "ended");
            toast.success(`“${ending.name}” ended`);
          }
          setEnding(null);
        }}
      />
    </div>
  );
}
