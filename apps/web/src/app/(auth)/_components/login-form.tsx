"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

import { ROUTES } from "@/app/_libs/constants/routes";
import { CustomInput } from "@/components/custom/custom-input";

const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const emailValue = watch("email");
  const rememberMeValue = watch("rememberMe");
  const isEmailValid =
    emailValue && !errors.email && z.string().email().safeParse(emailValue).success;

  const onSubmit = async (_data: LoginFormData) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      router.push(ROUTES.APP.DASHBOARD);
    } catch {
      toast.error("Invalid credentials. Please try again.");
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!isEmailValid) return;

    setForgotPasswordLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("OTP Sent", {
        description: `A verification code has been sent to ${emailValue}`,
      });
      router.push(`${ROUTES.AUTH.RESET_PASSWORD}?email=${encodeURIComponent(emailValue)}`);
    } catch {
      toast.error("Access Denied", {
        description: "Email not associated with an admin account.",
      });
      setForgotPasswordLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} method="POST" className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground-secondary">
          Email Address
        </Label>
        <CustomInput
          id="email"
          type="email"
          placeholder="admin@asiaplex.io"
          error={!!errors.email}
          {...register("email")}
        />
        {errors.email && <p className="text-destructive text-sm">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password" className="text-foreground-secondary">
            Password
          </Label>
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
        </div>
        <CustomInput
          id="password"
          type="password"
          placeholder="Enter your password"
          error={!!errors.password}
          {...register("password")}
          className="border-border"
        />
        {errors.password && <p className="text-destructive text-sm">{errors.password.message}</p>}
      </div>

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

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full px-8 text-base font-semibold">
        {isLoading ? (
          <AiOutlineLoading3Quarters className="size-4 shrink-0 animate-spin" />
        ) : (
          "Sign In"
        )}
      </Button>
    </form>
  );
}
