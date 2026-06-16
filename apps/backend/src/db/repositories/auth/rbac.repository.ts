import { Injectable } from '@nestjs/common';
import { DBService, DBExecutor } from '@db/db.service';
import { roles, permissions, rolePermissions, userRoles, users } from '@db/drizzle/schema';
import { and, eq, inArray, isNull, sql } from 'drizzle-orm';

export interface RoleRecord {
  id: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  isActive: boolean;
  permissions: string[];
}

export interface PermissionRecord {
  id: string;
  name: string;
  description: string | null;
  resource: string;
  action: string;
}

@Injectable()
export class RbacRepository {
  constructor(private readonly dbService: DBService) {}

  private exec(tx?: DBExecutor) {
    return tx ?? this.dbService.db;
  }

  /** Resolve a user's effective role names + permission names (admins). */
  async resolveForUser(userId: string, tx?: DBExecutor): Promise<{ roles: string[]; permissions: string[] }> {
    const db = this.exec(tx);
    const roleRows = await db
      .select({ name: roles.name })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(and(eq(userRoles.userId, userId), eq(roles.isActive, true)));

    const permRows = await db
      .selectDistinct({ name: permissions.name })
      .from(userRoles)
      .innerJoin(rolePermissions, eq(userRoles.roleId, rolePermissions.roleId))
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id))
      .where(eq(userRoles.userId, userId));

    return { roles: roleRows.map((r) => r.name), permissions: permRows.map((p) => p.name) };
  }

  async listPermissions(): Promise<PermissionRecord[]> {
    return this.dbService.db.select().from(permissions).orderBy(permissions.resource, permissions.action);
  }

  async permissionIdsByNames(names: string[], tx?: DBExecutor): Promise<string[]> {
    if (names.length === 0) {
      return [];
    }
    const rows = await this.exec(tx).select({ id: permissions.id }).from(permissions).where(inArray(permissions.name, names));
    return rows.map((r) => r.id);
  }

  async listRoles(): Promise<RoleRecord[]> {
    const roleRows = await this.dbService.db.select().from(roles).orderBy(roles.name);
    const permRows = await this.dbService.db
      .select({ roleId: rolePermissions.roleId, name: permissions.name })
      .from(rolePermissions)
      .innerJoin(permissions, eq(rolePermissions.permissionId, permissions.id));
    const byRole = new Map<string, string[]>();
    for (const row of permRows) {
      const list = byRole.get(row.roleId) ?? [];
      list.push(row.name);
      byRole.set(row.roleId, list);
    }
    return roleRows.map((r) => ({
      id: r.id,
      name: r.name,
      description: r.description,
      isSystem: r.isSystem,
      isActive: r.isActive,
      permissions: byRole.get(r.id) ?? [],
    }));
  }

  async getRole(id: string): Promise<RoleRecord | null> {
    const all = await this.listRoles();
    return all.find((r) => r.id === id) ?? null;
  }

  async getRoleByName(name: string, tx?: DBExecutor): Promise<{ id: string; isSystem: boolean } | null> {
    const rows = await this.exec(tx).select({ id: roles.id, isSystem: roles.isSystem }).from(roles).where(eq(roles.name, name));
    return rows[0] ?? null;
  }

  /** Are all of the given role ids system roles? Used to gate privileged grants. */
  async systemRoleIds(roleIds: string[], tx?: DBExecutor): Promise<string[]> {
    if (roleIds.length === 0) {
      return [];
    }
    const rows = await this.exec(tx)
      .select({ id: roles.id })
      .from(roles)
      .where(and(inArray(roles.id, roleIds), eq(roles.isSystem, true)));
    return rows.map((r) => r.id);
  }

  async createRole(input: { name: string; description?: string | undefined; permissionIds: string[] }, tx?: DBExecutor): Promise<string> {
    const db = this.exec(tx);
    const rows = await db
      .insert(roles)
      .values({ name: input.name, ...(input.description ? { description: input.description } : {}) })
      .returning({ id: roles.id });
    const roleId = rows[0]!.id;
    await this.setRolePermissions(roleId, input.permissionIds, tx);
    return roleId;
  }

  async updateRole(
    id: string,
    input: { description?: string | undefined; permissionIds?: string[] | undefined },
    tx?: DBExecutor,
  ): Promise<void> {
    const db = this.exec(tx);
    if (input.description !== undefined) {
      await db.update(roles).set({ description: input.description, updatedAt: sql`now()` }).where(eq(roles.id, id));
    }
    if (input.permissionIds !== undefined) {
      await this.setRolePermissions(id, input.permissionIds, tx);
    }
  }

  async deleteRole(id: string): Promise<void> {
    await this.dbService.db.delete(roles).where(eq(roles.id, id));
  }

  async setRolePermissions(roleId: string, permissionIds: string[], tx?: DBExecutor): Promise<void> {
    const db = this.exec(tx);
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
    if (permissionIds.length > 0) {
      await db.insert(rolePermissions).values(permissionIds.map((permissionId) => ({ roleId, permissionId })));
    }
  }

  async isRoleAssigned(roleId: string): Promise<boolean> {
    const rows = await this.dbService.db.select({ userId: userRoles.userId }).from(userRoles).where(eq(userRoles.roleId, roleId)).limit(1);
    return rows.length > 0;
  }

  // ─── user_roles ───────────────────────────────────────────────────────────────

  async replaceUserRoles(userId: string, roleIds: string[], assignedBy: string, tx?: DBExecutor): Promise<void> {
    const db = this.exec(tx);
    await db.delete(userRoles).where(eq(userRoles.userId, userId));
    if (roleIds.length > 0) {
      await db.insert(userRoles).values(roleIds.map((roleId) => ({ userId, roleId, assignedBy })));
    }
  }

  async rolesExist(roleIds: string[], tx?: DBExecutor): Promise<boolean> {
    if (roleIds.length === 0) {
      return true;
    }
    const rows = await this.exec(tx).select({ id: roles.id }).from(roles).where(inArray(roles.id, roleIds));
    return rows.length === roleIds.length;
  }

  /** Count active (non-deleted) admins holding a role — for lockout guards. */
  async countActiveAdminsWithRole(roleName: string, tx?: DBExecutor): Promise<number> {
    const rows = await this.exec(tx)
      .select({ c: sql<number>`count(*)::int` })
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .innerJoin(users, eq(userRoles.userId, users.id))
      .where(and(eq(roles.name, roleName), eq(users.status, 'active'), isNull(users.deletedAt)));
    return rows[0]?.c ?? 0;
  }
}
