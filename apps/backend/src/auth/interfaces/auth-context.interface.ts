import { AccountStatus, AccountType, Platform } from './jwt-payload.interface';

export type { AccountStatus };

/**
 * The authenticated principal attached to `request.user`.
 * Built entirely from the access-token claims (no DB read in the guard).
 */
export interface AuthContext {
  id: string;
  accountType: AccountType;
  status: AccountStatus;
  tokenVersion: number;
  roles: string[]; // admins only
  permissions: string[]; // admins only
  platform: Platform;
}

/** Ergonomic alias used by the `@CurrentUser()` decorator. */
export type AuthUser = AuthContext;
