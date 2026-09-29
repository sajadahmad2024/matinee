import { Badge } from "@/components/ui/badge";

import { cn } from "@/app/_libs/utils/cn";

import { AD_STATUS_CONFIG, type AdStatus } from "../constants";

export function AdStatusBadge({ status, className }: { status: AdStatus; className?: string }) {
  const cfg = AD_STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn("text-[10px]", cfg.badge, className)}>
      {cfg.label}
    </Badge>
  );
}
