"use client";

import { useEffect } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";

import { type MockAdminProfile, updateMockAdminName } from "@/app/_libs/mock-admin-profile";
import { CustomField } from "@/components/custom/custom-field";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomModal } from "@/components/custom/custom-modal";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or fewer`);

const profileSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: MockAdminProfile;
}

/** Edits the admin's own first / last name (mock — saved in this browser only). */
export function EditProfileModal({ open, onOpenChange, profile }: EditProfileModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: { firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "" },
  });

  // Start from the latest saved name every time the modal opens.
  useEffect(() => {
    if (open) reset({ firstName: profile?.firstName ?? "", lastName: profile?.lastName ?? "" });
  }, [open, profile, reset]);

  const onSubmit = (values: ProfileFormValues) => {
    updateMockAdminName(values);
    toast.success("Profile updated");
    onOpenChange(false);
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={onOpenChange}
      title="Edit Name"
      description="This is how your name appears across the admin console.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <CustomField
            label="First Name"
            htmlFor="profile-first-name"
            error={errors.firstName?.message}>
            <CustomInput
              id="profile-first-name"
              placeholder="Jane"
              error={Boolean(errors.firstName)}
              {...register("firstName")}
            />
          </CustomField>
          <CustomField
            label="Last Name"
            htmlFor="profile-last-name"
            error={errors.lastName?.message}>
            <CustomInput
              id="profile-last-name"
              placeholder="Doe"
              error={Boolean(errors.lastName)}
              {...register("lastName")}
            />
          </CustomField>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            className="cursor-pointer"
            onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" className="cursor-pointer" disabled={!isDirty}>
            Save Changes
          </Button>
        </div>
      </form>
    </CustomModal>
  );
}
