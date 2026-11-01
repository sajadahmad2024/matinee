import { z } from "zod";

const nameSchema = (label: string) =>
  z
    .string()
    .trim()
    .min(1, `${label} is required`)
    .max(100, `${label} must be 100 characters or fewer`);

/** Mirrors the backend `UpdateAdminProfileDto` (`PATCH /admin/auth/me`). */
export const adminProfileSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
});

export type AdminProfileFormValues = z.infer<typeof adminProfileSchema>;
