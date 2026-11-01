/*
 * UI demo build only: mock of the generated `AdminAdminsApi` — the admin team, answered in memory.
 * No request is ever sent.
 */
import type {
  AdminAdminsControllerListV1Request,
  AdminUserResponseDto,
  CreateAdminDto,
  UpdateAdminDto,
} from "@/app/_libs/api/generated";

import { conflict, daysFromNow, newId, notFound, ok, paginate } from "./_demo/core";
import { roleNamesFor } from "./admin-roles-api";

const admin = (
  id: string,
  firstName: string,
  lastName: string,
  roles: string[],
  joinedDaysAgo: number,
  extra: Partial<AdminUserResponseDto> = {},
): AdminUserResponseDto => ({
  id,
  accountType: "admin" as AdminUserResponseDto["accountType"],
  email: `${firstName}.${lastName}@maintinee.io`.toLowerCase(),
  phone: null,
  username: null,
  firstName,
  lastName,
  gender: null,
  avatarUrl: null,
  status: "active" as AdminUserResponseDto["status"],
  isPhoneVerified: false,
  isEmailVerified: true,
  countryCode: "IN",
  roles,
  permissions: [],
  createdAt: daysFromNow(-joinedDaysAgo),
  invitePending: false,
  ...extra,
});

const admins: AdminUserResponseDto[] = [
  admin("demo-admin", "John", "Doe", ["super_admin"], 290),
  admin("adm-2", "Priya", "Sharma", ["super_admin"], 210),
  admin("adm-3", "Arjun", "Mehta", ["admin"], 160),
  admin("adm-4", "Sara", "Khan", ["admin"], 95),
  admin("adm-5", "Rahul", "Verma", ["admin"], 4, { invitePending: true, isEmailVerified: false }),
  admin("adm-6", "Neha", "Iyer", ["admin"], 120, { status: "disabled" as AdminUserResponseDto["status"] }),
];

const find = (id: string) => {
  const found = admins.find((a) => a.id === id);
  if (!found) throw notFound("Admin");
  return found;
};

export const adminAdminsApi = {
  async adminAdminsControllerListV1(params: AdminAdminsControllerListV1Request = {}) {
    const q = params?.search?.toLowerCase().trim();
    const rows = admins.filter(
      (a) =>
        (!params?.status || a.status === params.status) &&
        (!q || `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(q)),
    );
    return ok(paginate(rows, params?.page, params?.pageSize));
  },

  async adminAdminsControllerCreateV1({ createAdminDto: dto }: { createAdminDto: CreateAdminDto }) {
    if (admins.some((a) => a.email?.toLowerCase() === dto.email.toLowerCase())) {
      throw conflict("An account with this email already exists");
    }
    const created = admin(newId("adm"), dto.firstName, dto.lastName, roleNamesFor(dto.roleIds), 0, {
      email: dto.email,
      invitePending: true,
      isEmailVerified: false,
    });
    admins.push(created);
    return ok(created);
  },

  async adminAdminsControllerUpdateV1({ id, updateAdminDto: dto }: { id: string; updateAdminDto: UpdateAdminDto }) {
    const a = find(id);
    if (dto.firstName !== undefined) a.firstName = dto.firstName;
    if (dto.lastName !== undefined) a.lastName = dto.lastName;
    if (dto.roleIds !== undefined) a.roles = roleNamesFor(dto.roleIds);
    if (dto.status !== undefined) a.status = dto.status as unknown as AdminUserResponseDto["status"];
    return ok(a);
  },

  async adminAdminsControllerRemoveV1({ id }: { id: string }) {
    find(id).status = "disabled" as AdminUserResponseDto["status"];
    return ok({ message: "Admin access revoked" });
  },

  async adminAdminsControllerResendInviteV1({ id }: { id: string }) {
    find(id);
    return ok({ message: "Invite sent" });
  },
};
