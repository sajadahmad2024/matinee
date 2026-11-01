"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ADMIN_ROUTES, AUTH_ROUTES } from "@/app/_libs/constants/routes";
import { useAdminForgotPassword, useAdminLogin } from "@/app/_libs/hooks/api/use-admin-auth";
import {
  type AuthLoginFormValues,
  authForgotPasswordSchema,
  authLoginSchema,
} from "@/app/_libs/schemas";
import { CustomButton } from "@/components/custom/custom-button";
import { CustomInput } from "@/components/custom/custom-input";

export function LoginForm() {
  const router = useRouter();
  const { adminLoginMutation } = useAdminLogin();
  const { adminForgotPasswordMutation } = useAdminForgotPassword();
  const forgotPasswordLoading = adminForgotPasswordMutation.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<AuthLoginFormValues>({
    resolver: zodResolver(authLoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");
  const rememberMeValue = watch("rememberMe");
  const isEmailValid =
    emailValue &&
    !errors.email &&
    authForgotPasswordSchema.safeParse({ email: emailValue }).success;

  const onSubmit = (values: AuthLoginFormValues) => {
    adminLoginMutation.mutate(values, {
      onSuccess: () => {
        router.replace(ADMIN_ROUTES.DASHBOARD);
      },
      onError: (error) => {
        toast.error(error?.message || "Unable to sign in. Please try again.");
      },
    });
  };

  const handleForgotPassword = () => {
    if (!isEmailValid) return;
    const email = emailValue.trim();

    adminForgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: () => {
          // The backend answers the same for unknown emails (no account enumeration).
          toast.success("Check your email", {
            description: `If ${email} belongs to an admin account, a 6-digit code has been sent.`,
          });
          router.push(`${AUTH_ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(email)}`);
        },
        onError: (error) => {
          toast.error(error.message || "Unable to send the reset code. Please try again.");
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
      <CustomInput
        id="email"
        type="email"
        label="Email Address"
        placeholder="admin@asiaplex.io"
        error={errors.email?.message}
        {...register("email")}
      />

      <CustomInput
        id="password"
        type="password"
        label="Password"
        placeholder="Enter your password"
        error={errors.password?.message}
        labelAction={
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={!isEmailValid || forgotPasswordLoading}
                className={`inline-flex items-center gap-2 text-sm transition-colors ${
                  isEmailValid
                    ? "text-primary hover:text-primary/80 cursor-pointer"
                    : "text-muted-foreground cursor-not-allowed"
                }`}>
                {forgotPasswordLoading && (
                  <AiOutlineLoading3Quarters className="size-4 shrink-0 animate-spin" />
                )}
                {forgotPasswordLoading ? "Sending..." : "Forgot Password?"}
              </button>
            </TooltipTrigger>
            {!isEmailValid && (
              <TooltipContent
                side="top"
                showArrow={false}
                className="border-border/60 bg-popover text-popover-foreground border shadow-lg">
                Please enter your registered email address first to reset password.
              </TooltipContent>
            )}
          </Tooltip>
        }
        {...register("password")}
      />

      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          checked={rememberMeValue}
          onCheckedChange={(checked) => {
            setValue("rememberMe", checked === true);
          }}
          className="border-primary rounded-full"
        />
        <Label htmlFor="rememberMe" className="text-foreground-secondary cursor-pointer text-sm">
          Keep me signed in
        </Label>
      </div>

      <CustomButton
        type="submit"
        isLoading={adminLoginMutation.isPending}
        className="h-12 w-full px-8 text-base font-semibold">
        Sign In
      </CustomButton>
    </form>
  );
}
