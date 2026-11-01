import { z } from "zod";

import { authEmailSchema } from "./auth-base.schema";

/** Mirrors the backend `AdminLoginDto` (email, password ≥ 8 chars, optional rememberMe). */
export const authLoginSchema = z.object({
  email: authEmailSchema,
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

export type AuthLoginFormValues = z.infer<typeof authLoginSchema>;
