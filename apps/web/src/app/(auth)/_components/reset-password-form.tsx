"use client";

import { useEffect, useRef, useState } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { ROUTES } from "@/app/_libs/constants/routes";
import { cn } from "@/app/_libs/utils/cn";
import { CustomInput } from "@/components/custom/custom-input";

const resetSchema = z
  .object({
    otp: z.string().length(6, "Please enter the complete 6-digit code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetFormData = z.infer<typeof resetSchema>;

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

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "user@example.com";
  const [isLoading, setIsLoading] = useState(false);
  const [otpValues, setOtpValues] = useState<string[]>(Array(6).fill(""));
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword");
  const strength = getPasswordStrength(newPassword || "");

  useEffect(() => {
    setValue("otp", otpValues.join(""));
  }, [otpValues, setValue]);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.slice(-1);
    }
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otpValues];
    pastedData.split("").forEach((char, i) => {
      if (i < 6) newOtp[i] = char;
    });
    setOtpValues(newOtp);
    otpRefs.current[Math.min(pastedData.length, 5)]?.focus();
  };

  const onSubmit = async (_data: ResetFormData) => {
    setIsLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push(ROUTES.AUTH.LOGIN);
    } catch {
      toast.error("Error", {
        description: "Failed to reset password. Please try again.",
      });
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <p className="text-foreground-secondary text-sm">
        Enter the 6-digit code sent to <span className="text-primary font-medium">{email}</span>
      </p>

      <div className="space-y-2">
        <Label className="text-foreground-secondary">Verification Code</Label>
        <div className="flex justify-center gap-3" onPaste={handleOtpPaste}>
          {Array(6)
            .fill(null)
            .map((_, index) => (
              <input
                key={index}
                ref={(el) => {
                  otpRefs.current[index] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otpValues[index]}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                className={cn(
                  "bg-input/50 text-foreground h-14 w-12 rounded-lg border text-center text-xl font-semibold backdrop-blur-sm transition-all duration-200",
                  "focus:border-primary focus:ring-primary/50 focus:ring-2 focus:outline-none",
                  errors.otp ? "border-destructive" : "border-border",
                )}
              />
            ))}
        </div>
        {errors.otp && <p className="text-destructive text-center text-sm">{errors.otp.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword" className="text-foreground-secondary">
          New Password
        </Label>
        <CustomInput
          type="password"
          id="newPassword"
          placeholder="Create a strong password"
          error={!!errors.newPassword}
          {...register("newPassword")}
          className="border-border"
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
        {errors.newPassword && (
          <p className="text-destructive text-sm">{errors.newPassword.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword" className="text-foreground-secondary">
          Confirm Password
        </Label>
        <CustomInput
          type="password"
          id="confirmPassword"
          placeholder="Confirm your password"
          error={!!errors.confirmPassword}
          {...register("confirmPassword")}
          className="border-border"
        />
        {errors.confirmPassword && (
          <p className="text-destructive text-sm">{errors.confirmPassword.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="h-12 w-full cursor-pointer px-8 text-base font-semibold">
        {isLoading ? (
          <AiOutlineLoading3Quarters className="size-4 shrink-0 animate-spin" />
        ) : (
          "Reset & Login"
        )}
      </Button>

      <button
        type="button"
        onClick={() => router.push(ROUTES.AUTH.LOGIN)}
        className="text-foreground-secondary hover:text-primary w-full cursor-pointer text-sm transition-colors">
        Back to Sign In
      </button>
    </form>
  );
}
