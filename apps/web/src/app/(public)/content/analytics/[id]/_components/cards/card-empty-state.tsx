import type * as React from "react";

interface CardEmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
}

/** A card's "nothing in this period yet" state: muted icon, a title and a one-line hint. */
export function CardEmptyState({ icon: Icon, title, description }: CardEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
      <div className="bg-muted/40 flex h-10 w-10 items-center justify-center rounded-full">
        <Icon className="text-muted-foreground h-5 w-5" />
      </div>
      <p className="text-foreground text-sm font-medium">{title}</p>
      <p className="text-muted-foreground max-w-[240px] text-xs">{description}</p>
    </div>
  );
}
