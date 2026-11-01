import type { ReactNode } from "react";

import { cn } from "@/app/_libs/utils/cn";

/** Glass card that frames every auth page (login, reset password, …). */
export function AuthCard({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "animate-fade-in glass-card relative w-full max-w-md rounded-2xl p-8",
        className,
      )}>
      {children}
    </div>
  );
}

export function AuthCardHeader({ children }: { children: ReactNode }) {
  return <div className="mb-8 text-center">{children}</div>;
}

const iconSizes = {
  md: "h-12 w-12 rounded-xl",
  lg: "mx-auto mb-4 h-16 w-16 rounded-2xl",
} as const;

/** Gradient tile holding the brand mark or a page icon. */
export function AuthCardIcon({
  children,
  size = "lg",
}: {
  children: ReactNode;
  size?: keyof typeof iconSizes;
}) {
  return (
    <div
      className={cn(
        "from-primary to-accent shadow-glow flex items-center justify-center bg-linear-to-br",
        iconSizes[size],
      )}>
      {children}
    </div>
  );
}

export function AuthCardTitle({ children }: { children: ReactNode }) {
  return <h1 className="text-foreground font-sans text-2xl font-bold">{children}</h1>;
}

export function AuthCardDescription({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <p className={cn("text-foreground-secondary mt-2 text-sm", className)}>{children}</p>;
}

export function AuthCardFooter({ children }: { children: ReactNode }) {
  return <p className="text-foreground-muted mt-8 text-center text-xs">{children}</p>;
}
