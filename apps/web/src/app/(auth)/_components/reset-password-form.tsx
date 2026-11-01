"use client";

import { useEffect, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";

import { ADMIN_ROUTES, AUTH_ROUTES } from "@/app/_libs/constants/routes";
import {
  useAdminForgotPassword,
  useAdminResetPassword,
} from "@/app/_libs/hooks/api/use-admin-auth";
import { type AuthResetPasswordFormValues, authResetPasswordSchema } from "@/app/_libs/schemas";
import { cn } from "@/app/_libs/utils/cn";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomInput } from "@/components/custom/custom-input";
import { CustomOtpInput } from "@/components/custom/custom-otp-input";

const RESEND_COOLDOWN_SECONDS = 45;

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score: 1, label: "Weak", color: "bg-destructive" };
  if (score <= 4) return { score: 2, label: "Medium", color: "bg-warning" };
  return { score: 3, label: "Strong", color: "bg-success" };
}

interface ResetPasswordFormProps {
  isInvite?: boolean;
}

export function ResetPasswordForm({ isInvite = false }: ResetPasswordFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";

  const { adminResetPasswordMutation } = useAdminResetPassword();
  const { adminForgotPasswordMutation } = useAdminForgotPassword();
  const [resendIn, setResendIn] = useState(isInvite ? 0 : RESEND_COOLDOWN_SECONDS);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AuthResetPasswordFormValues>({
    resolver: zodResolver(authResetPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const strength = getPasswordStrength(newPassword || "");

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((seconds) => seconds - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const onSubmit = (values: AuthResetPasswordFormValues) => {
    adminResetPasswordMutation.mutate(
      { email, code: values.otp, newPassword: values.newPassword },
      {
        onSuccess: () => {
          toast.success("Password updated", {
            description: "You're now signed in.",
          });
          router.replace(ADMIN_ROUTES.DASHBOARD);
        },
        onError: (error) => {
          toast.error(error?.message || "Failed to reset password. Please try again.");
        },
      },
    );
  };

  const handleResend = () => {
    adminForgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          setValue("otp", "");
          setResendIn(RESEND_COOLDOWN_SECONDS);
          toast.success("A new code has been sent", { description: email });
        },
        onError: (error) => {
          toast.error(error?.message || "Unable to resend the code. Please try again.");
        },
      },
    );
  };

  if (!email) {
    return (
      <div className="space-y-6 text-center">
        <p className="text-foreground-secondary text-sm">
          This reset link is missing an email address. Request a new code from the sign-in page.
        </p>
        <CustomButton
          type="button"
          onClick={() => router.push(AUTH_ROUTES.LOGIN)}
          className="h-12 w-full px-8 text-base font-semibold">
          Back to Sign In
        </CustomButton>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-foreground-secondary text-sm">
        {isInvite
          ? "Enter the 6-digit code from your invitation email to "
          : "Enter the 6-digit code sent to "}
        <span className="text-primary font-medium">{email}</span>
      </p>

      <div className="space-y-2">
        <Controller
          name="otp"
          control={control}
          render={({ field }) => (
            <CustomOtpInput
              label="Verification Code"
              value={field.value}
              onChange={field.onChange}
              error={errors.otp?.message}
              autoFocus
            />
          )}
        />
        <p className="text-foreground-secondary text-center text-sm">
          Didn&apos;t get a code?{" "}
          {resendIn > 0 ? (
            <span className="text-muted-foreground">Resend in {resendIn}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={adminForgotPasswordMutation.isPending}
              className="text-primary hover:text-primary/80 cursor-pointer font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50">
              {adminForgotPasswordMutation.isPending ? "Sending..." : "Resend code"}
            </button>
          )}
        </p>
      </div>

      <div className="space-y-2">
        <CustomInput
          type="password"
          id="newPassword"
          label="New Password"
          placeholder="Create a strong password"
          error={errors.newPassword?.message}
          {...register("newPassword")}
        />
        {newPassword && (
          <div className="space-y-1">
            <div className="flex gap-1">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={cn(
                    "h-1.5 flex-1 rounded-full transition-colors",
                    level <= strength.score ? strength.color : "bg-muted",
                  )}
                />
              ))}
            </div>
            <p className={cn("text-xs", strength.color.replace("bg-", "text-"))}>
              {strength.label}
            </p>
          </div>
        )}
      </div>

      <CustomInput
        type="password"
        id="confirmPassword"
        label="Confirm Password"
        placeholder="Confirm your password"
        error={errors.confirmPassword?.message}
        {...register("confirmPassword")}
      />

      <CustomButton
        type="submit"
        isLoading={adminResetPasswordMutation.isPending}
        className="h-12 w-full px-8 text-base font-semibold">
        {isInvite ? "Set Password & Sign In" : "Reset & Login"}
      </CustomButton>

      <button
        type="button"
        onClick={() => router.push(AUTH_ROUTES.LOGIN)}
        className="text-foreground-secondary hover:text-primary w-full cursor-pointer text-sm transition-colors">
        Back to Sign In
      </button>
    </form>
  );
}
