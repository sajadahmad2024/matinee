/*
 * UI demo build only: mock of the generated `AdminAuthApi` — a signed-in demo admin; sign-in,
 * reset and password changes always succeed. No request is ever sent.
 */
import type {
  ChangePasswordDto,
  UpdateAdminProfileDto,
  UserResponseDto,
} from "@/app/_libs/api/generated";

import { ok } from "./_demo/core";

const profile: UserResponseDto = {
  id: "demo-admin",
  accountType: "admin" as UserResponseDto["accountType"],
  email: "john.doe@maintinee.io",
  phone: null,
  username: null,
  firstName: "John",
  lastName: "Doe",
  gender: null,
  avatarUrl: null,
  status: "active" as UserResponseDto["status"],
  isPhoneVerified: false,
  isEmailVerified: true,
  countryCode: "IN",
  roles: ["super_admin"],
  permissions: ["admins:read", "admins:write", "admins:delete", "content:publish"],
  createdAt: "2026-01-15T00:00:00.000Z",
};

const session = () => ok({ user: profile, csrfToken: "" });

export const adminAuthApi = {
  async adminAuthControllerMeV1() {
    return ok(profile);
  },
  async adminAuthControllerUpdateMeV1({ updateAdminProfileDto: dto }: { updateAdminProfileDto: UpdateAdminProfileDto }) {
    profile.firstName = dto.firstName;
    profile.lastName = dto.lastName;
    return ok(profile);
  },
  async adminAuthControllerLoginV1(_: { adminLoginDto: unknown }) {
    return session();
  },
  async adminAuthControllerLogoutV1() {
    return ok({ message: "Logged out" });
  },
  async adminAuthControllerForgotPasswordV1(_: { forgotPasswordDto: unknown }) {
    return ok({ message: "If the email exists, a reset code has been sent" });
  },
  async adminAuthControllerResetPasswordV1(_: { resetPasswordDto: unknown }) {
    return session();
  },
  async adminAuthControllerChangePasswordV1(_: { changePasswordDto: ChangePasswordDto }) {
    return session();
  },
};
