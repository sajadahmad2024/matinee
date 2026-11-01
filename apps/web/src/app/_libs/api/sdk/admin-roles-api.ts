/*
 * UI demo build only: mock of the generated `AdminRolesApi` — the two system roles.
 * No request is ever sent.
 */
import type { RoleResponseDto } from "@/app/_libs/api/generated";

import { ok } from "./_demo/core";

const roles: RoleResponseDto[] = [
  {
    id: "role-super",
    name: "Super Admin",
    description: "Full access, including managing other admins",
    isSystem: true,
    systemName: "super_admin" as RoleResponseDto["systemName"],
    isActive: true,
    permissions: ["admins:read", "admins:write", "admins:delete"],
  },
  {
    id: "role-admin",
    name: "Admin",
    description: "Day-to-day content, ads and games management",
    isSystem: true,
    systemName: "admin" as RoleResponseDto["systemName"],
    isActive: true,
    permissions: ["admins:read"],
  },
];

/** Role ids → the role names an admin row carries (`super_admin`, `admin`). */
export const roleNamesFor = (roleIds: string[]) =>
  roles.filter((r) => roleIds.includes(r.id)).map((r) => r.systemName ?? r.name);

export const adminRolesApi = {
  async adminRolesControllerListV1() {
    return ok(roles);
  },
};
