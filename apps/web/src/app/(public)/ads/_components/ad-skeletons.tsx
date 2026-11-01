import type { ReactNode } from "react";

import { CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/app/_libs/utils/cn";
import { GlassCard } from "@/components/custom/glass-card";

/** Suspense fallback for the ad list: toolbar, then table rows at the table's min height. */
export function AdListSkeleton() {
  return (
    <div className="space-y-3" aria-busy="true">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Skeleton className="bg-muted h-9 sm:w-72" />
        <Skeleton className="bg-muted h-9 sm:w-52" />
        <Skeleton className="bg-muted h-9 sm:w-96" />
      </div>
      <div className="border-border/40 min-h-100 space-y-3 rounded-lg border p-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="bg-muted h-8 w-full" />
        ))}
      </div>
    </div>
  );
}

/** Suspense fallback for platform stats: filter row, KPI tiles and the chart. */
export function PlatformStatsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="flex justify-end gap-2">
        <Skeleton className="bg-muted h-9 w-40" />
        <Skeleton className="bg-muted h-9 w-24" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="bg-muted h-24 rounded-xl" />
        ))}
      </div>
      <Skeleton className="bg-muted h-80 w-full rounded-xl" />
    </div>
  );
}

const bar = (className: string) => <Skeleton className={cn("bg-muted", className)} />;

/** `PageHeader` with a back link: arrow, title + subtitle, optional action buttons. */
function HeaderSkeleton({ actions = 0 }: { actions?: number }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-start gap-3">
        {bar("h-9 w-9 shrink-0")}
        <div className="space-y-2">
          {bar("h-8 w-64")}
          {bar("h-4 w-40")}
        </div>
      </div>
      {actions > 0 && (
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: actions }, (_, i) => (
            <Skeleton key={i} className="bg-muted h-8 w-24" />
          ))}
        </div>
      )}
    </div>
  );
}

/** A `GlassCard` with a title bar, wrapping the given body. */
function CardSkeleton({
  children,
  titleWidth = "w-24",
}: {
  children: ReactNode;
  titleWidth?: string;
}) {
  return (
    <GlassCard>
      <CardHeader>{bar(`h-5 ${titleWidth}`)}</CardHeader>
      <CardContent>{children}</CardContent>
    </GlassCard>
  );
}

/** Rows like `DetailRow`: label column + value. */
function DetailRowsSkeleton({ rows }: { rows: number }) {
  return (
    <div className="space-y-1">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="grid grid-cols-[10rem_1fr] gap-3 py-2">
          {bar("h-4 w-20")}
          {bar("h-4 w-2/3")}
        </div>
      ))}
    </div>
  );
}

/** Labelled inputs like `CustomInput`. */
function FieldsSkeleton({ fields, columns = 1 }: { fields: number; columns?: 1 | 2 }) {
  return (
    <div className={cn("grid gap-4", columns === 2 && "sm:grid-cols-2")}>
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          {bar("h-4 w-20")}
          {bar("h-11 w-full rounded-lg")}
        </div>
      ))}
    </div>
  );
}

/** `/ads/[id]`: header + actions, then the Video and Details cards in the centred column. */
export function AdDetailsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <HeaderSkeleton actions={4} />
      <div className="mx-auto max-w-4xl space-y-6">
        <CardSkeleton titleWidth="w-16">
          {bar("aspect-video h-auto w-full rounded-lg")}
        </CardSkeleton>
        <CardSkeleton titleWidth="w-20">
          <DetailRowsSkeleton rows={8} />
        </CardSkeleton>
      </div>
    </div>
  );
}

/** `/ads/[id]/edit`: header, Video beside Ad, then Delivery beside Schedule. */
export function AdFormSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6" aria-busy="true">
      <HeaderSkeleton />
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton titleWidth="w-16">
          {bar("aspect-video h-auto w-full rounded-lg")}
        </CardSkeleton>
        <CardSkeleton titleWidth="w-10">
          <div className="space-y-4">
            <FieldsSkeleton fields={2} columns={2} />
            <FieldsSkeleton fields={1} />
            <FieldsSkeleton fields={2} columns={2} />
          </div>
        </CardSkeleton>
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-2">
        <CardSkeleton titleWidth="w-20">
          <div className="space-y-3">
            {bar("h-4 w-full")}
            <DetailRowsSkeleton rows={3} />
          </div>
        </CardSkeleton>
        <CardSkeleton titleWidth="w-20">
          <FieldsSkeleton fields={2} columns={2} />
        </CardSkeleton>
      </div>
    </div>
  );
}

/** `/ads/[id]/analytics`: header, then the stats. */
export function AdAnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <HeaderSkeleton />
      <AdAnalyticsStatsSkeleton />
    </div>
  );
}

/**
 * The analytics stats while `GET /performance` loads: filter row, five KPI tiles, the daily
 * chart and the two audience cards.
 */
export function AdAnalyticsStatsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true">
      <div className="flex justify-end gap-2">
        {bar("h-9 w-40")}
        {bar("h-9 w-24")}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="bg-muted h-24 rounded-xl" />
        ))}
      </div>
      <CardSkeleton titleWidth="w-40">{bar("h-60 w-full")}</CardSkeleton>
      <div className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton titleWidth="w-44">{bar("h-32 w-full")}</CardSkeleton>
        <CardSkeleton titleWidth="w-28">{bar("h-32 w-full")}</CardSkeleton>
      </div>
    </div>
  );
}
