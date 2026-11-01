import { z } from "zod";

import { authEmailSchema } from "./auth-base.schema";

/** Mirrors the backend `ForgotPasswordDto`. */
export const authForgotPasswordSchema = z.object({
  email: authEmailSchema,
});

export type AuthForgotPasswordFormValues = z.infer<typeof authForgotPasswordSchema>;
