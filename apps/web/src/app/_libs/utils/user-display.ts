import type { UserResponseDto } from "@/app/_libs/api/generated";

/** "First Last", or "Admin" when the user has no name. */
export const getUserDisplayName = (user: UserResponseDto): string =>
  [user?.firstName?.trim(), user?.lastName?.trim()].filter(Boolean).join(" ") || "Admin";

/** "FL" from the name, else the first letter of the display name. */
export const getUserInitials = (user: UserResponseDto): string => {
  const first = user?.firstName?.trim() ?? "";
  const last = user?.lastName?.trim() ?? "";
  if (first || last) return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return getUserDisplayName(user).charAt(0).toUpperCase();
};

export const getUserEmail = (user: UserResponseDto): string => user.email ?? "";

/** Role name → label: `super_admin` → `Super Admin`. */
export const formatRoleName = (role: string): string =>
  role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
