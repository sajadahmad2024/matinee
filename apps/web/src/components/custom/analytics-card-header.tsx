import { CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/app/_libs/utils/cn";

interface AnalyticsCardHeaderProps {
  title: string;
  description?: string;
  icon: React.ElementType;
  iconColor?: string;
}

/** Title row (icon + title + optional description) for the analytics cards. */
export function AnalyticsCardHeader({
  title,
  description,
  icon: Icon,
  iconColor = "text-accent",
}: AnalyticsCardHeaderProps) {
  return (
    <CardHeader className="pb-2">
      <CardTitle className="flex items-center gap-2 text-base font-medium">
        <Icon className={cn("h-4 w-4", iconColor)} />
        {title}
      </CardTitle>
      {description && <p className="text-muted-foreground text-xs">{description}</p>}
    </CardHeader>
  );
}
