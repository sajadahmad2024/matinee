import { LuBan, LuBell, LuEyeOff, LuTrash2, LuTriangleAlert } from "react-icons/lu";

import { cn } from "@/app/_libs/utils/cn";
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

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                destructive ? "bg-destructive/10" : "bg-primary/10",
              )}
            >
              <Icon className={cn("h-5 w-5", iconColor)} />
            </div>
            <AlertDialogTitle>{title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className={cn(
              destructive && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
            )}
          >
            {confirmLabel || getDefaultConfirmLabel()}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
