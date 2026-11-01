import { Skeleton } from "@/components/ui/skeleton";

/** The four master tiles while the overview loads. */
export function MasterAnalyticsSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }, (_, i) => (
        <Skeleton key={i} className="bg-muted/30 h-[148px] rounded-xl" />
      ))}
    </div>
  );
}

/** The regional heat grid while it loads. */
export function RegionalActivitySkeleton() {
  return <Skeleton className="bg-muted/10 h-[130px] w-full rounded-lg" />;
}

/** Trends & Economy while it loads. */
export function GameTrendsSkeleton() {
  return <Skeleton className="bg-muted/20 h-[400px] w-full rounded-xl" />;
}
