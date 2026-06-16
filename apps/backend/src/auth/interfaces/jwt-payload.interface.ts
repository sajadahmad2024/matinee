export type AccountType = 'guest' | 'customer' | 'admin';
export type Platform = 'web' | 'mobile';
export type TokenType = 'access' | 'refresh';
export type AccountStatus = 'active' | 'suspended' | 'banned' | 'disabled';

/**
 * Self-contained JWT payload.
 *
 * Access tokens carry the FULL authorization context (`st`/`rl`/`pm`) so the
 * guard can authorize with crypto only — no DB, no cache. Refresh tokens carry
 * only identity (`sub`/`act`/`plt`/`tv`); the refresh endpoint re-reads the DB to
 * re-issue an access token with fresh claims and to enforce `token_version`.
 */
export interface JwtPayload {
  sub: string; // user id
  typ: TokenType;
  act: AccountType;
  plt: Platform;
  tv: number; // token_version at mint time (checked at refresh, not per-request)
  st?: AccountStatus; // access only — account status snapshot
  rl?: string[]; // access only — roles (admins)
  pm?: string[]; // access only — permissions (admins)
  iat?: number;
  exp?: number;
  jti?: string;
}
