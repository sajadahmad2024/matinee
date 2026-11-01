"use client";

import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import type {
  AdminAdminsControllerListV1Request,
  CreateAdminDto,
  UpdateAdminDto,
} from "@/app/_libs/api/generated";
import { adminAdminsApi } from "@/app/_libs/api/sdk/admin-admins-api";
import { adminRolesApi } from "@/app/_libs/api/sdk/admin-roles-api";
import { getNextPageParam } from "@/app/_libs/query/pagination";
import {
  ADMIN_ADMINS_QUERY_KEYS,
  ADMIN_ROLES_QUERY_KEYS,
  MINUTES_15,
} from "@/app/_libs/query/query-keys";

export type {
  AdminUserResponseDto,
  CreateAdminDto,
  RoleResponseDto,
  UpdateAdminDto,
  UserResponseDto,
} from "@/app/_libs/api/generated";
/** Backend enums: built-in roles, an admin's status, and the statuses an update may set. */
export {
  AdminUserResponseDtoStatusEnum as AdminStatusEnum,
  SystemRoleName,
  UpdateAdminDtoStatusEnum,
} from "@/app/_libs/api/generated";

export const useAdminAdminsList = (
  params: Omit<AdminAdminsControllerListV1Request, "page"> = {},
  { enabled = true }: { enabled?: boolean } = {},
) => {
  const query = useInfiniteQuery({
    queryKey: ADMIN_ADMINS_QUERY_KEYS.list(params),
    queryFn: ({ pageParam }) =>
      adminAdminsApi.adminAdminsControllerListV1({ ...params, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam,
    placeholderData: keepPreviousData,
    enabled,
  });

  return {
    adminsListQuery: query,
    admins: query?.data?.pages?.flatMap((page) => page?.data?.items ?? []) ?? [],
    total: query?.data?.pages[0]?.data?.pagination?.totalCount ?? 0,
  };
};

/** Creates an admin (no password yet); the backend emails a 24-hour set-password code. */
export const useCreateAdmin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (createAdminDto: CreateAdminDto) =>
      adminAdminsApi.adminAdminsControllerCreateV1({ createAdminDto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ADMINS_QUERY_KEYS.all });
    },
  });

  return { createAdminMutation: mutation };
};

/** Changes an admin's roles and/or status (`active` | `disabled`). */
export const useUpdateAdmin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: ({ id, updateAdminDto }: { id: string; updateAdminDto: UpdateAdminDto }) =>
      adminAdminsApi.adminAdminsControllerUpdateV1({ id, updateAdminDto }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ADMINS_QUERY_KEYS.all });
    },
  });

  return { updateAdminMutation: mutation };
};

/** Revokes access — a soft delete: the backend sets `status=disabled`. */
export const useRemoveAdmin = () => {
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: (id: string) => adminAdminsApi.adminAdminsControllerRemoveV1({ id }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ADMIN_ADMINS_QUERY_KEYS.all });
    },
  });

  return { removeAdminMutation: mutation };
};

export const useResendAdminInvite = () => {
  const mutation = useMutation({
    mutationFn: (id: string) => adminAdminsApi.adminAdminsControllerResendInviteV1({ id }),
  });

  return { resendAdminInviteMutation: mutation };
};

/** All roles (with permission names) — rarely change, so cached longer. */
export const useAdminRolesList = ({ enabled = true }: { enabled?: boolean } = {}) => {
  const query = useQuery({
    queryKey: ADMIN_ROLES_QUERY_KEYS.list(),
    queryFn: () => adminRolesApi.adminRolesControllerListV1(),
    staleTime: MINUTES_15,
    enabled,
  });

  return { rolesListQuery: query, roles: query.data?.data ?? [] };
};
