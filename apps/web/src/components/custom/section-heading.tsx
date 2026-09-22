import { cn } from "@/app/_libs/utils/cn";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  action?: React.ReactNode;
  className?: string;
}

export function SectionHeading({ title, subtitle, icon: Icon, action, className }: SectionHeadingProps) {
  return (
    <div className={cn("flex items-end justify-between gap-3", className)}>
      <div className="flex items-center gap-2">
        {Icon && <Icon className="text-muted-foreground h-4 w-4" />}
        <div>
          <h2 className="text-foreground text-sm font-semibold">{title}</h2>
          {subtitle && <p className="text-muted-foreground text-xs">{subtitle}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}
