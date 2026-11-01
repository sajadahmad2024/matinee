import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { LuBan, LuBell, LuEyeOff, LuTrash2, LuTriangleAlert } from "react-icons/lu";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { cn } from "@/app/_libs/utils/cn";

export type ConfirmationAction = "delete" | "ban" | "hide" | "warn" | "custom";

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  action: ConfirmationAction;
  count?: number;
  itemLabel?: string;
  onConfirm: () => void;
  confirmLabel?: string;
  destructive?: boolean;
  preventOutsideClose?: boolean;
  /**
   * Passing this keeps the dialog open after Confirm (spinner, buttons disabled while `true`);
   * the caller closes it on success. Left out, Confirm closes the dialog straight away.
   */
  isLoading?: boolean;
}

const actionIcons = {
  delete: LuTrash2,
  ban: LuBan,
  hide: LuEyeOff,
  warn: LuBell,
  custom: LuTriangleAlert,
};

const actionColors = {
  delete: "text-destructive",
  ban: "text-destructive",
  hide: "text-warning",
  warn: "text-warning",
  custom: "text-primary",
};

export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  action,
  count,
  itemLabel = "item",
  onConfirm,
  confirmLabel,
  destructive = true,
  preventOutsideClose = true,
  isLoading,
}: ConfirmationDialogProps) {
  const Icon = actionIcons[action];
  const iconColor = actionColors[action];

  const getDefaultConfirmLabel = () => {
    switch (action) {
      case "delete":
        return count ? `Delete ${count} ${itemLabel}${count > 1 ? "s" : ""}` : "Delete";
      case "ban":
        return count ? `Ban ${count} ${itemLabel}${count > 1 ? "s" : ""}` : "Ban";
      case "hide":
        return count ? `Hide ${count} ${itemLabel}${count > 1 ? "s" : ""}` : "Hide";
      case "warn":
        return count ? `Warn ${count} ${itemLabel}${count > 1 ? "s" : ""}` : "Warn";
      default:
        return "Confirm";
    }
  };

  const keepOpen = isLoading !== undefined;

  return (
    // no closing (Esc, Cancel) while the confirmed action runs
    <AlertDialog open={open} onOpenChange={(next) => !isLoading && onOpenChange(next)}>
      <AlertDialogContent
        // Radix focuses Cancel on open, which draws its focus ring before anything is pressed
        onOpenAutoFocus={(event) => event.preventDefault()}
        onOverlayClick={preventOutsideClose || isLoading ? undefined : () => onOpenChange(false)}>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                destructive ? "bg-destructive/10" : "bg-primary/10",
              )}>
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer" disabled={isLoading}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={(event) => {
              if (keepOpen) event.preventDefault();
              onConfirm();
            }}
            disabled={isLoading}
            className={cn(
              "cursor-pointer",
              destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}>
            {isLoading && (
              <AiOutlineLoading3Quarters
                className="size-4 shrink-0 animate-spin"
                aria-hidden="true"
              />
            )}
            {confirmLabel || getDefaultConfirmLabel()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
