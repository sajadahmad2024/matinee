import { z } from "zod";

export const authEmailSchema = z
  .string()
  .trim()
  .min(1, "Email is required")
  .email("Please enter a valid email address");

/** The new-password rules (backend `ResetPasswordDto` / `ChangePasswordDto`), for live checklists. */
export const AUTH_PASSWORD_RULES = [
  { label: "8–128 characters", test: (v: string) => v.length >= 8 && v.length <= 128 },
  { label: "An uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "A lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "A number", test: (v: string) => /[0-9]/.test(v) },
  { label: "A special character (@$!%*?&)", test: (v: string) => /[@$!%*?&]/.test(v) },
] as const;

export const authNewPasswordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be 128 characters or fewer")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[@$!%*?&]/, "Password must contain at least one special character (@$!%*?&)");
