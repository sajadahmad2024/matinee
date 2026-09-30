import { DBExecutor } from '@db/db.service';
import { EnforcementRepository } from '@db/repositories/auth/enforcement.repository';
import { NotificationRepository } from '@db/repositories/notifications/notification.repository';
import { UsersRepository } from '@db/repositories/users/users.repository';

export type UserEnforcement = 'warn' | 'suspend' | 'ban';

export const DEFAULT_SUSPEND_DAYS = 7;

export interface UserEnforcementDeps {
  users: UsersRepository;
  enforcement: EnforcementRepository;
  notifications: NotificationRepository;
}

/**
 * Apply a warn / suspend / ban to a user inside the caller's transaction — shared by moderation
 * ticket resolution and comment-level enforcement so both behave identically.
 *  - warn: in-app notification + `warn` enforcement record (status unchanged)
 *  - suspend: status `suspended` until `suspendUntil` (default now + 7 days) + record
 *  - ban: status `banned` + record
 */
export async function applyUserEnforcement(
  deps: UserEnforcementDeps,
  input: { userId: string; action: UserEnforcement; reason?: string | undefined; suspendUntil?: string | undefined; adminId: string },
  tx: DBExecutor,
): Promise<{ action: UserEnforcement; expiresAt: string | null }> {
  const { userId, action, reason, adminId } = input;
  if (action === 'warn') {
    await deps.notifications.create(
      userId,
      { category: 'system', title: 'Warning from moderation', ...(reason ? { body: reason } : {}), sourceType: 'moderation' },
      tx,
    );
    await deps.enforcement.create({ userId, action: 'warn', performedBy: adminId, reason }, tx);
    return { action, expiresAt: null };
  }
  if (action === 'suspend') {
    const until = input.suspendUntil ?? new Date(Date.now() + DEFAULT_SUSPEND_DAYS * 86_400_000).toISOString();
    await deps.enforcement.create({ userId, action: 'suspend', performedBy: adminId, reason, expiresAt: until }, tx);
    await deps.users.setStatus(userId, { status: 'suspended', suspendedUntil: until, reason: reason ?? null, changedBy: adminId }, tx);
    return { action, expiresAt: until };
  }
  await deps.enforcement.create({ userId, action: 'ban', performedBy: adminId, reason }, tx);
  await deps.users.setStatus(userId, { status: 'banned', reason: reason ?? null, changedBy: adminId }, tx);
  return { action, expiresAt: null };
}
