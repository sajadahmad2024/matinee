"use client";

import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { cn } from "@/app/_libs/utils/cn";

/** Base modal (shadcn `Dialog`) with title, description, body and an optional footer. */
export interface CustomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** A string, or a node when the title carries an icon. */
  title?: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
  /** Ignore clicks on the backdrop and the Escape key — e.g. while an action is running. */
  preventOutsideClose?: boolean;
  /**
   * `glass` (default) is the app's modal look. `default` keeps the base shadcn dialog surface,
   * title and footer, for screens designed against it.
   */
  appearance?: "glass" | "default";
  className?: string;
  headerClassName?: string;
  titleClassName?: string;
  footerClassName?: string;
}

const sizeClasses = {
  sm: "sm:max-w-md",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
  full: "sm:max-w-[calc(100vw-4rem)] sm:max-h-[calc(100vh-4rem)]",
};

export function CustomModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  showCloseButton = true,
  preventOutsideClose = false,
  appearance = "glass",
  className,
  headerClassName,
  titleClassName,
  footerClassName,
}: CustomModalProps) {
  const isGlass = appearance === "glass";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={showCloseButton}
        onPointerDownOutside={(event) => {
          if (preventOutsideClose) event.preventDefault();
        }}
        onEscapeKeyDown={(event) => {
          if (preventOutsideClose) event.preventDefault();
        }}
        onOpenAutoFocus={(event) => {
          if (isGlass) event.preventDefault();
        }}
        className={cn(
          isGlass &&
            "bg-card text-card-foreground border-border/50 rounded-xl shadow-2xl backdrop-blur-xl",
          sizeClasses[size],
          className,
        )}>
        {(title || description) && (
          <DialogHeader className={cn(isGlass && "text-left", headerClassName)}>
            {title && (
              <DialogTitle
                className={cn(
                  isGlass && "text-foreground font-sans text-xl font-bold tracking-tight",
                  titleClassName,
                )}>
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-muted-foreground text-sm">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        {children && <div>{children}</div>}

        {footer && (
          <DialogFooter
            className={cn(isGlass && "border-border/50 border-t pt-4", footerClassName)}>
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
