"use client";

import Link from "next/link";

import {
  Activity,
  AlertTriangle,
  Crown,
  ExternalLink,
  Gamepad2,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import { type Column, DataTable } from "@/components/custom/data-table";
import { GlassCard } from "@/components/custom/glass-card";

import { GAME_ROUTES } from "../../_libs/game-config";
import type { ProposedLeaderboardInstanceDto } from "../../_libs/game-types";
import { useLeaderboardInstances } from "../../_libs/use-games";
import {
  CONCENTRATION_LIMIT,
  GAME_FORMAT_FILTERS,
  HEALTH_META,
  instanceFormatFor,
} from "../_libs/leaderboard-config";
import { FormatFilter } from "./format-filter";

type Instance = ProposedLeaderboardInstanceDto;

const COLUMNS: Column<Instance>[] = [
  {
    header: "Game Name",
    cell: (i) => (
      <div className="flex items-center gap-3">
        <div className="bg-accent/10 rounded-lg p-2">
          <Gamepad2 className="text-accent h-4 w-4" />
        </div>
        <span className="text-foreground font-medium">{i.gameName}</span>
      </div>
    ),
  },
  {
    header: "Health",
    cell: (i) => (
      <span className={`rounded px-2 py-0.5 text-xs font-medium ${HEALTH_META[i.health].cls}`}>
        {HEALTH_META[i.health].label}
      </span>
    ),
  },
  {
    header: "Participation",
    cell: (i) => (
      <div
        className={`flex items-center gap-1 text-sm ${i.trend >= 0 ? "text-success" : "text-destructive"}`}>
        {i.trend >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        {i.trend >= 0 ? "+" : ""}
        {i.trend}%
      </div>
    ),
  },
  {
    header: "Top-3 Share",
    cell: (i) => (
      <span
        className={`font-mono text-sm ${i.topConcentration >= CONCENTRATION_LIMIT ? "text-destructive" : "text-muted-foreground"}`}>
        {i.topConcentration}%
      </span>
    ),
  },
  {
    header: "Format",
    cell: (i) => (
      <Badge variant="outline" className="text-xs">
        {i.format}
      </Badge>
    ),
  },
  {
    header: "Players",
    headerClassName: "text-right",
    className: "text-right",
    cell: (i) => (
      <div className="flex items-center justify-end gap-2">
        <Users className="text-muted-foreground h-4 w-4" />
        <span className="text-foreground font-mono">{i.totalPlayers.toLocaleString()}</span>
      </div>
    ),
  },
  {
    header: "",
    headerClassName: "w-[120px]",
    cell: (i) =>
      i.health !== "healthy" ? (
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href={GAME_ROUTES.LIST}>
            <AlertTriangle className="text-warning h-4 w-4" />
            Intervene
          </Link>
        </Button>
      ) : (
        <Button asChild variant="ghost" size="sm" className="gap-2">
          <Link href={GAME_ROUTES.leaderboards("hall-of-fame")}>
            <ExternalLink className="h-4 w-4" />
            View
          </Link>
        </Button>
      ),
  },
];

/** Competition health across boards — the ones that need intervention first. */
export function TopGamesTab({ format }: { format: string }) {
  const { instancesQuery, instances } = useLeaderboardInstances({
    format: instanceFormatFor(format),
  });

  const summary = [
    { label: "Active boards", value: instances.length, cls: "text-accent", icon: Activity },
    {
      label: "Need intervention",
      value: instances?.filter((i) => i.health !== "healthy").length,
      cls: "text-warning",
      icon: AlertTriangle,
    },
    {
      label: "Over-concentrated",
      value: instances?.filter((i) => i.topConcentration >= CONCENTRATION_LIMIT).length,
      cls: "text-destructive",
      icon: Crown,
    },
    {
      label: "Declining participation",
      value: instances?.filter((i) => i.trend < 0).length,
      cls: "text-warning",
      icon: TrendingDown,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {summary?.map(({ label, value, cls, icon: Icon }) => (
          <Card key={label}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-xs">{label}</span>
                <Icon className={`h-4 w-4 ${cls}`} />
              </div>
              <p className="text-foreground mt-2 text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-foreground text-lg font-semibold">Leaderboard Health</h3>
          <p className="text-muted-foreground text-sm">
            Per-board competition health — concentration & participation trend
          </p>
        </div>
        <FormatFilter options={GAME_FORMAT_FILTERS} />
      </div>

      <GlassCard>
        <CardContent className="p-0">
          <DataTable
            columns={COLUMNS}
            data={instances}
            rowIdKey="id"
            isLoading={instancesQuery.isPending}
            isError={instancesQuery.isError}
            onRetry={() => void instancesQuery.refetch()}
            isRetrying={instancesQuery.isFetching}
            classNames={{
              container: "bg-transparent",
              header: "bg-transparent",
              head: "bg-transparent",
              cell: "p-2",
            }}
            emptyState={<span className="text-muted-foreground">No boards for this format.</span>}
          />
        </CardContent>
      </GlassCard>
    </div>
  );
}
