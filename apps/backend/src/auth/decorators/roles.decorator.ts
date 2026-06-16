import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Requires ANY of the listed roles (OR logic). Admin RBAC. */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
