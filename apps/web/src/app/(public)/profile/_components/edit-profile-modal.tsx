"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { type UserResponseDto, useUpdateAdminProfile } from "@/app/_libs/hooks/api/use-admin-auth";
import { type AdminProfileFormValues, adminProfileSchema } from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomModal } from "@/components/custom/custom-modal";

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: UserResponseDto;
}

const toFormValues = (profile: UserResponseDto): AdminProfileFormValues => ({
  firstName: profile?.firstName ?? "",
  lastName: profile?.lastName ?? "",
});

/** Edits the signed-in admin's own first / last name (`PATCH /admin/auth/me`). */
export function EditProfileModal({ open, onOpenChange, profile }: EditProfileModalProps) {
  const { updateAdminProfileMutation } = useUpdateAdminProfile();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<AdminProfileFormValues>({
    resolver: zodResolver(adminProfileSchema),
    defaultValues: toFormValues(profile),
  });

  // Start from the latest saved name every time the modal opens.
  useEffect(() => {
    if (open) reset(toFormValues(profile));
  }, [open, profile, reset]);

  const handleOpenChange = (next: boolean) => {
    if (!next && updateAdminProfileMutation.isPending) return;
    onOpenChange(next);
  };

  const onSubmit = (values: AdminProfileFormValues) => {
    updateAdminProfileMutation.mutate(values, {
      onSuccess: () => {
        toast.success("Profile updated");
        onOpenChange(false);
      },
      onError: (error) => {
        toast.error(error.message || "Unable to update profile. Please try again.");
      },
    });
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit Name"
      description="This is how your name appears across the admin console."
      preventOutsideClose={updateAdminProfileMutation.isPending}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomInput
            label="First Name"
            placeholder="Jane"
            required
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <CustomInput
            label="Last Name"
            placeholder="Doe"
            required
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={updateAdminProfileMutation.isPending}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            isLoading={updateAdminProfileMutation.isPending}
            disabled={!isDirty}
            loadingText="Saving...">
            Save Changes
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
