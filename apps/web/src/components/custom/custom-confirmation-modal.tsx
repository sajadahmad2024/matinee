"use client";

import * as React from "react";

import { CustomButton } from "@/components/custom/custom-button";
import { CustomModal } from "@/components/custom/custom-modal";

export interface CustomConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  onConfirm: () => void;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "default" | "destructive";
  isConfirming?: boolean;
  className?: string;
}

export function CustomConfirmationModal({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmVariant = "default",
  isConfirming = false,
  className,
}: CustomConfirmationModalProps) {
  const handleOpenChange = (next: boolean) => {
    if (!next && isConfirming) return;
    onOpenChange(next);
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      size="sm"
      showCloseButton={false}
      preventOutsideClose={isConfirming}
      className={className}>
      <div className="flex items-center gap-3 pt-2">
        <CustomButton
          type="button"
          variant="outline"
          onClick={() => {
            onCancel?.();
            onOpenChange(false);
          }}
          disabled={isConfirming}
          className="h-11 flex-1 font-semibold">
          {cancelText}
        </CustomButton>
        <CustomButton
          type="button"
          variant={confirmVariant}
          onClick={onConfirm}
          isLoading={isConfirming}
          className="h-11 flex-1 font-semibold">
          {confirmText}
        </CustomButton>
      </div>
    </CustomModal>
  );
}
