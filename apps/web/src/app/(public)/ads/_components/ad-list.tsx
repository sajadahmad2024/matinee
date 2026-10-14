"use client";

import { useState } from "react";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { ArrowLeftRight, BarChart3, Eye, MoreHorizontal, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { ConfirmationDialog } from "@/components/custom/confirmation-dialog";

import { MACRO_REGIONS, type MacroRegion } from "@/app/_libs/regions";

import {
  type AdItem,
  type AdStatus,
  canSwap,
  fmtDateRange,
  fmtNum,
  swapBlocker,
  targetsRegion,
} from "../constants";
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

/** Europe (incl. the UK) is the default market. */
const DEFAULT_REGION: MacroRegion = "EU";

// ended ads have freed their rank, so they sink below the ranked ones
const rankIn = (a: AdItem, region: MacroRegion) =>
  a.status === "ended" ? undefined : a.ranks[region];

const byRank = (region: MacroRegion) => (a: AdItem, b: AdItem) =>
  (rankIn(a, region) ?? Infinity) - (rankIn(b, region) ?? Infinity) ||
  new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime();

/** Ad list — region (feed order), tabs, search, and a row menu. Actions change local mock state only. */
export function AdList({ initialAds }: { initialAds: AdItem[] }) {
  const router = useRouter();
  const [ads, setAds] = useState(initialAds);
  const [tab, setTab] = useState<Tab>("all");
  const [region, setRegion] = useState<MacroRegion>(DEFAULT_REGION);
  const [q, setQ] = useState("");
  const [ending, setEnding] = useState<AdItem | null>(null);
  // swap: pick two ranked ads in the current region, then confirm
  const [picked, setPicked] = useState<string[]>([]);
  const [swapping, setSwapping] = useState(false);

  const needle = q.trim().toLowerCase();
  const visible = ads
    .filter(
      (a) =>
        targetsRegion(a, region) &&
        inTab(a, tab) &&
        (!needle || a.name.toLowerCase().includes(needle) || a.advertiser.toLowerCase().includes(needle)),
    )
    .sort(byRank(region));

  const setStatus = (id: string, status: AdStatus) =>
    setAds((list) => list.map((a) => (a.id === id ? { ...a, status } : a)));

  const changeRegion = (r: MacroRegion) => {
    setRegion(r);
    setPicked([]);
  };

  // newest pick replaces the oldest once two are chosen
  const togglePick = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id].slice(-2)));

  const pair = picked.map((id) => ads.find((a) => a.id === id)).filter((a): a is AdItem => !!a);
  const [first, second] = pair;
  const blocker = first && second ? swapBlocker(ads, region, first, second) : null;
  const regionLabel = MACRO_REGIONS.find((r) => r.code === region)?.label ?? region;

  const swap = () => {
    if (!first || !second) return;
    const ra = first.ranks[region];
    const rb = second.ranks[region];
    setAds((list) =>
      list.map((a) =>
        a.id === first.id
          ? { ...a, ranks: { ...a.ranks, [region]: rb } }
          : a.id === second.id
            ? { ...a, ranks: { ...a.ranks, [region]: ra } }
            : a,
      ),
    );
    toast.success(`Swapped ranks in ${regionLabel}`);
    setPicked([]);
    setSwapping(false);
  };

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
        <Select value={region} onValueChange={(v) => changeRegion(v as MacroRegion)}>
          <SelectTrigger className="sm:w-52" aria-label="Region">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border-border bg-card z-50">
            {MACRO_REGIONS.map((r) => (
              <SelectItem key={r.code} value={r.code}>
                {r.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
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

      {pair.length > 0 && (
        <div className="border-border bg-muted/40 flex flex-col gap-2 rounded-lg border px-3 py-2 text-sm sm:flex-row sm:items-center">
          <p className="flex-1">
            {pair.length === 1 ? (
              <>Pick one more ad to swap ranks with “{first.name}” in {regionLabel}.</>
            ) : blocker ? (
              <span className="text-destructive">{blocker}</span>
            ) : (
              <>
                Swap “{first.name}” (#{first.ranks[region]}) and “{second.name}” (#{second.ranks[region]}) in{" "}
                {regionLabel}.
              </>
            )}
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={() => setPicked([])}>
              Clear
            </Button>
            <Button size="sm" disabled={pair.length < 2 || !!blocker} onClick={() => setSwapping(true)}>
              <ArrowLeftRight className="h-4 w-4" />
              Swap ranks
            </Button>
          </div>
        </div>
      )}

      <div className="border-border overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10" />
              <TableHead className="w-16">Rank</TableHead>
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
                <TableCell colSpan={8} className="text-muted-foreground py-10 text-center">
                  No ads here.
                </TableCell>
              </TableRow>
            )}
            {visible.map((ad) => {
              const delivered = ad.stats.impressions > 0;
              const rank = rankIn(ad, region);
              return (
                <TableRow
                  key={ad.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/ads/${ad.id}` as Route)}>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    {canSwap(ad, region) && (
                      <Checkbox
                        checked={picked.includes(ad.id)}
                        onCheckedChange={() => togglePick(ad.id)}
                        aria-label={`Select “${ad.name}” to swap rank`}
                        title="Select to swap rank"
                      />
                    )}
                  </TableCell>
                  <TableCell className="font-medium tabular-nums">
                    {rank ? `#${rank}` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
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
        open={swapping}
        onOpenChange={setSwapping}
        action="custom"
        title={`Swap ranks in ${regionLabel}?`}
        description={
          first && second ? (
            <span className="block space-y-1">
              <span className="block">
                “{first.name}”: #{first.ranks[region]} → #{second.ranks[region]}
              </span>
              <span className="block">
                “{second.name}”: #{second.ranks[region]} → #{first.ranks[region]}
              </span>
              <span className="text-muted-foreground block pt-1">
                Takes effect in the feed straight away. Other regions are unchanged.
              </span>
            </span>
          ) : null
        }
        confirmLabel="Swap ranks"
        destructive={false}
        onConfirm={swap}
      />

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
