"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
  SystemRoleName,
  useAdminRolesList,
  useCreateAdmin,
} from "@/app/_libs/hooks/api/use-admin-admins";
import { type AdminInviteFormValues, adminInviteSchema } from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomModal } from "@/components/custom/custom-modal";

interface InviteAdminModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const defaultValues: AdminInviteFormValues = { firstName: "", lastName: "", email: "" };

/**
 * Creates the admin — always with the built-in `admin` role (no role picker); the backend emails
 * them a 24-hour code to set their password.
 */
export function InviteAdminModal({ open, onOpenChange }: InviteAdminModalProps) {
  const { createAdminMutation } = useCreateAdmin();
  const { rolesListQuery, roles } = useAdminRolesList({ enabled: open });
  const inviteRole = roles.find((role) => role.systemName === SystemRoleName.Admin);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdminInviteFormValues>({ resolver: zodResolver(adminInviteSchema), defaultValues });

  const handleOpenChange = (next: boolean) => {
    if (!next && createAdminMutation.isPending) return;
    if (!next) reset(defaultValues);
    onOpenChange(next);
  };

  const onSubmit = (values: AdminInviteFormValues) => {
    if (!inviteRole) return;
    createAdminMutation.mutate(
      { ...values, roleIds: [inviteRole.id] },
      {
        onSuccess: () => {
          toast.success(`Invitation sent to ${values.email}`, {
            description: "They'll receive a 6-digit code (valid 24 hours) to set their password.",
          });
          reset(defaultValues);
          onOpenChange(false);
        },
        onError: (error) => {
          toast.error(error.message || "Unable to invite admin. Please try again.");
        },
      },
    );
  };

  return (
    <CustomModal
      open={open}
      onOpenChange={handleOpenChange}
      title="Invite New Admin"
      description="They'll get an email with a code to set their password."
      preventOutsideClose={createAdminMutation.isPending}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <CustomInput
            label="First Name"
            placeholder="Jane"
            error={errors.firstName?.message}
            {...register("firstName")}
          />
          <CustomInput
            label="Last Name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register("lastName")}
          />
        </div>
        <CustomInput
          type="email"
          label="Email Address"
          placeholder="admin@company.com"
          error={errors.email?.message}
          {...register("email")}
        />
        {rolesListQuery.isSuccess && !inviteRole && (
          <p className="text-destructive text-sm">
            The Admin role was not found — invites are unavailable.
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <CustomButton
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={createAdminMutation.isPending}>
            Cancel
          </CustomButton>
          <CustomButton
            type="submit"
            isLoading={createAdminMutation.isPending}
            disabled={!inviteRole}
            loadingText="Sending..."
            leftIcon={<Mail className="h-4 w-4" />}>
            Send Invitation
          </CustomButton>
        </div>
      </form>
    </CustomModal>
  );
}
