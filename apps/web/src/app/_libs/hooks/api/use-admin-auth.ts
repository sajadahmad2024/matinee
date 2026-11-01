"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import type {
  AdminLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateAdminProfileDto,
} from "@/app/_libs/api/generated";
import { adminAuthApi } from "@/app/_libs/api/sdk/admin-auth-api";
import { ADMIN_ADMINS_QUERY_KEYS, ADMIN_AUTH_QUERY_KEYS } from "@/app/_libs/query/query-keys";

export type {
  AdminLoginDto,
  ChangePasswordDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  UpdateAdminProfileDto,
  UserResponseDto,
} from "@/app/_libs/api/generated";

/**
 * Logs in on the cookie channel. The backend sets `access_token` / `refresh_token`
 * (httpOnly) and `csrf` cookies; the body only carries the user.
 */
export const useAdminLogin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (adminLoginDto: AdminLoginDto) =>
      adminAuthApi.adminAuthControllerLoginV1({ adminLoginDto }),
    onSuccess: () => {
      // A new session may be a different admin — never reuse the previous profile.
      queryClient.removeQueries({ queryKey: ADMIN_AUTH_QUERY_KEYS.all });
    },
  });

  return { adminLoginMutation: mutation };
};

/** Current admin with roles & permissions — drives sidebar identity and permission gating. */
export const useAdminProfile = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: ADMIN_AUTH_QUERY_KEYS.me(),
    queryFn: () => adminAuthApi.adminAuthControllerMeV1(),
    staleTime: Infinity,
    enabled,
  });

  return { adminProfileQuery: query, profile: query.data?.data };
};

/** Edits the signed-in admin's own name; the response replaces the cached profile. */
export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (updateAdminProfileDto: UpdateAdminProfileDto) =>
      adminAuthApi.adminAuthControllerUpdateMeV1({ updateAdminProfileDto }),
    onSuccess: (response) => {
      queryClient.setQueryData(ADMIN_AUTH_QUERY_KEYS.me(), response);
      // The admin team table shows names too.
      queryClient.invalidateQueries({ queryKey: ADMIN_ADMINS_QUERY_KEYS.all });
    },
  });

  return { updateAdminProfileMutation: mutation };
};

/**
 * Changes the signed-in admin's password (`POST /admin/auth/change-password`). The backend signs
 * every other session out and sets fresh auth + CSRF cookies for this one, so the admin stays signed
 * in; the profile is refetched on the new session.
 */
export const useChangeAdminPassword = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (changePasswordDto: ChangePasswordDto) =>
      adminAuthApi.adminAuthControllerChangePasswordV1({ changePasswordDto }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ADMIN_AUTH_QUERY_KEYS.me() }),
  });

  return { changeAdminPasswordMutation: mutation };
};

export const useAdminLogout = () => {
  const mutation = useMutation({
    mutationFn: () => adminAuthApi.adminAuthControllerLogoutV1(),
  });

  return { adminLogoutMutation: mutation };
};

/** Emails a 6-digit reset code. Always succeeds for unknown emails (no account enumeration). */
export const useAdminForgotPassword = () => {
  const mutation = useMutation({
    mutationFn: (forgotPasswordDto: ForgotPasswordDto) =>
      adminAuthApi.adminAuthControllerForgotPasswordV1({ forgotPasswordDto }),
  });

  return { adminForgotPasswordMutation: mutation };
};

/** Resets the password with the emailed code; the backend signs the admin in on success. */
export const useAdminResetPassword = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (resetPasswordDto: ResetPasswordDto) =>
      adminAuthApi.adminAuthControllerResetPasswordV1({ resetPasswordDto }),
    onSuccess: () => {
      queryClient.removeQueries({ queryKey: ADMIN_AUTH_QUERY_KEYS.all });
    },
  });

  return { adminResetPasswordMutation: mutation };
};
