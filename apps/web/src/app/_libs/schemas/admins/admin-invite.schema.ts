import { z } from "zod";

import { authEmailSchema } from "../auth/auth-base.schema";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or fewer`);

/** Mirrors the backend `CreateAdminDto`; the role is fixed to `admin` by the invite form. */
export const adminInviteSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: authEmailSchema,
});

export type AdminInviteFormValues = z.infer<typeof adminInviteSchema>;
