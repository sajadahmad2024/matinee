import { z } from "zod";

import { authNewPasswordSchema } from "./auth-base.schema";

/** Emailed 6-digit code + new password; maps to the backend `ResetPasswordDto` with the email. */
export const authResetPasswordSchema = z
  .object({
    otp: z.string().length(6, "Please enter the complete 6-digit code"),
    newPassword: authNewPasswordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type AuthResetPasswordFormValues = z.infer<typeof authResetPasswordSchema>;
