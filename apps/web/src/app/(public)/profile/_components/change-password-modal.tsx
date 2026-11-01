"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";

import { isApiError } from "@/app/_libs/api/api-error";
import { useChangeAdminPassword } from "@/app/_libs/hooks/api/use-admin-auth";
import { type ChangePasswordFormValues, changePasswordSchema } from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomModal } from "@/components/custom/custom-modal";
import { PasswordRequirements } from "@/components/custom/password-requirements";

interface ChangePasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EMPTY_VALUES: ChangePasswordFormValues = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

/**
 * Changes the signed-in admin's password (`POST /admin/auth/change-password`). The admin stays
 * signed in here; every other session is signed out.
 */
export function ChangePasswordModal({ open, onOpenChange }: ChangePasswordModalProps) {
  const { changeAdminPasswordMutation } = useChangeAdminPassword();
  const isSaving = changeAdminPasswordMutation.isPending;

  const {
    control,
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: EMPTY_VALUES,
  });
  const newPassword = useWatch({ control, name: "newPassword" });

  // Never keep passwords around: start empty every time the modal opens.
  useEffect(() => {
    if (open) reset(EMPTY_VALUES);
  }, [open, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next && isSaving) return;
    onOpenChange(next);
  };

  const onSubmit = ({ currentPassword, newPassword: next }: ChangePasswordFormValues) => {
    changeAdminPasswordMutation.mutate(
      { currentPassword, newPassword: next },
      {
        onSuccess: () => {
          toast.success("Password changed. Other devices have been signed out.");
          onOpenChange(false);
        },
        onError: (error) => {
          // 400s name their field: a wrong current password, or a new one equal to it; anything
          // else is a toast (a 401 means the session expired — the client signs out)
          if (isApiError(error) && error.statusCode === 400) {
            const field = /current password/i.test(error.message)
              ? "currentPassword"
              : "newPassword";
            setError(field, { message: error.message }, { shouldFocus: true });
          } else {
            toast.error(error.message || "Unable to change password. Please try again.");
          }
        },
      },
    );
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Change Password"
      description="You'll stay signed in here; your other devices will be signed out."
      preventOutsideClose={isSaving}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <CustomInput
          type="password"
          label="Current Password"
          placeholder="Enter your current password"
          autoComplete="current-password"
          required
          error={errors.currentPassword?.message}
          {...register("currentPassword")}
        />

        <div className="space-y-2">
          <CustomInput
            type="password"
            label="New Password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            required
            error={errors.newPassword?.message}
            {...register("newPassword")}
          />
          <PasswordRequirements password={newPassword ?? ""} />
        </div>

        <CustomInput
          type="password"
          label="Confirm New Password"
          placeholder="Re-enter the new password"
          autoComplete="new-password"
          required
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />

        <div className="flex justify-end gap-2 pt-2">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}>
            Cancel
          </CustomButton>
          <CustomButton type="submit" isLoading={isSaving} loadingText="Changing...">
            Change Password
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
