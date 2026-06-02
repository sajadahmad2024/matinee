import { DBService } from '@db/db.service';
import { UsersRepository } from '@db/repositories/users/users.repository';
import { RbacRepository, RoleRecord, PermissionRecord } from '@db/repositories/auth/rbac.repository';
import { EnforcementRepository, EnforcementRecord } from '@db/repositories/auth/enforcement.repository';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AdminAuthService } from './admin-auth.service';
import { toUserDto, UserDto } from '../mappers/user.mapper';

const SUPER_ADMIN = 'super_admin';

@Injectable()
export class AdminManagementService {
  constructor(
    private readonly db: DBService,
    private readonly users: UsersRepository,
    private readonly rbac: RbacRepository,
    private readonly enforcement: EnforcementRepository,
    private readonly adminAuth: AdminAuthService,
  ) {}

  // ─── Admins ───────────────────────────────────────────────────────────────

  async listAdmins(page: number, pageSize: number, search?: string, status?: string): Promise<{ data: UserDto[]; total: number }> {
    const result = await this.users.list('admin', {
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(status ? { status: status as never } : {}),
    });
    const data = await Promise.all(
      result.data.map(async (u) => {
        const resolved = await this.rbac.resolveForUser(u.id);
        return toUserDto(u, resolved.roles, resolved.permissions);
      }),
    );
    return { data, total: result.total };
  }

  async getAdmin(id: string): Promise<UserDto> {
    const user = await this.users.findById(id);
    if (!user || user.accountType !== 'admin') {
      throw new NotFoundException('Admin not found');
    }
    const resolved = await this.rbac.resolveForUser(id);
    return toUserDto(user, resolved.roles, resolved.permissions);
  }

  async createAdmin(
    input: { email: string; firstName?: string; lastName?: string; roleIds: string[] },
    actingAdminId: string,
  ): Promise<UserDto> {
    if (await this.users.findByEmail(input.email)) {
      throw new ConflictException('An account with this email already exists');
    }
    if (!(await this.rbac.rolesExist(input.roleIds))) {
      throw new BadRequestException('One or more roles do not exist');
    }
    await this.assertCanGrantRoles(actingAdminId, input.roleIds);

    const admin = await this.db.transaction(async (tx) => {
      const created = await this.users.createAdmin(
        { email: input.email, passwordHash: null, firstName: input.firstName, lastName: input.lastName },
        tx,
      );
      await this.rbac.replaceUserRoles(created.id, input.roleIds, actingAdminId, tx);
      return created;
    });

    // After commit: queue a set-password email (idempotent; safe to re-trigger as a "resend invite").
    await this.adminAuth.forgotPassword(input.email);
    const resolved = await this.rbac.resolveForUser(admin.id);
    return toUserDto(admin, resolved.roles, resolved.permissions);
  }

  async updateAdmin(
    id: string,
    actingAdminId: string,
    input: { firstName?: string; lastName?: string; roleIds?: string[]; status?: string },
  ): Promise<UserDto> {
    const admin = await this.users.findById(id);
    if (!admin || admin.accountType !== 'admin') {
      throw new NotFoundException('Admin not found');
    }
    // You cannot change your OWN roles or status (mirrors the DELETE self-guard).
    if (id === actingAdminId && (input.roleIds !== undefined || input.status !== undefined)) {
      throw new ForbiddenException('You cannot change your own roles or status');
    }
    if (input.roleIds) {
      if (!(await this.rbac.rolesExist(input.roleIds))) {
        throw new BadRequestException('One or more roles do not exist');
      }
      await this.assertCanGrantRoles(actingAdminId, input.roleIds);
      await this.assertNotDemotingLastSuperAdmin(id, input.roleIds);
    }
    if (input.status === 'disabled') {
      await this.assertNotLastSuperAdmin(id);
    }

    await this.db.transaction(async (tx) => {
      if (input.roleIds) {
        await this.rbac.replaceUserRoles(id, input.roleIds, actingAdminId, tx);
      }
      if (input.firstName !== undefined || input.lastName !== undefined) {
        await this.users.updateProfile(
          id,
          {
            ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
            ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
          },
          tx,
        );
      }
      if (input.status === 'disabled' || input.status === 'active') {
        await this.users.setStatus(id, { status: input.status, changedBy: actingAdminId }, tx);
      }
    });
    return this.getAdmin(id);
  }

  async removeAdmin(id: string, actingAdminId: string): Promise<void> {
    if (id === actingAdminId) {
      throw new ForbiddenException('You cannot remove your own account');
    }
    const admin = await this.users.findById(id);
    if (!admin || admin.accountType !== 'admin') {
      throw new NotFoundException('Admin not found');
    }
    await this.assertNotLastSuperAdmin(id);
    await this.db.transaction(async (tx) => {
      await this.users.setStatus(id, { status: 'disabled', changedBy: actingAdminId }, tx);
      await this.enforcement.create({ userId: id, action: 'disable', performedBy: actingAdminId }, tx);
    });
  }

  /** Only a super_admin may assign a system role (super_admin / admin). Custom roles: any admins:write. */
  private async assertCanGrantRoles(actingAdminId: string, roleIds: string[]): Promise<void> {
    const systemRoleIds = await this.rbac.systemRoleIds(roleIds);
    if (systemRoleIds.length === 0) {
      return;
    }
    const actor = await this.rbac.resolveForUser(actingAdminId);
    if (!actor.roles.includes(SUPER_ADMIN)) {
      throw new ForbiddenException('Only a super_admin can assign system roles');
    }
  }

  private async assertNotLastSuperAdmin(id: string): Promise<void> {
    const resolved = await this.rbac.resolveForUser(id);
    if (resolved.roles.includes(SUPER_ADMIN) && (await this.rbac.countActiveAdminsWithRole(SUPER_ADMIN)) <= 1) {
      throw new ForbiddenException('Cannot remove the last active super_admin');
    }
  }

  private async assertNotDemotingLastSuperAdmin(id: string, newRoleIds: string[]): Promise<void> {
    const current = await this.rbac.resolveForUser(id);
    if (!current.roles.includes(SUPER_ADMIN)) {
      return;
    }
    const superRole = await this.rbac.getRoleByName(SUPER_ADMIN);
    const stillSuper = superRole ? newRoleIds.includes(superRole.id) : false;
    if (!stillSuper && (await this.rbac.countActiveAdminsWithRole(SUPER_ADMIN)) <= 1) {
      throw new ForbiddenException('Cannot demote the last active super_admin');
    }
  }

  // ─── Roles & permissions ────────────────────────────────────────────────────

  listRoles(): Promise<RoleRecord[]> {
    return this.rbac.listRoles();
  }

  async getRole(id: string): Promise<RoleRecord> {
    const role = await this.rbac.getRole(id);
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return role;
  }

  listPermissions(): Promise<PermissionRecord[]> {
    return this.rbac.listPermissions();
  }

  async createRole(input: { name: string; description?: string; permissionNames: string[] }): Promise<RoleRecord> {
    if (await this.rbac.getRoleByName(input.name)) {
      throw new ConflictException('A role with this name already exists');
    }
    const permissionIds = await this.rbac.permissionIdsByNames(input.permissionNames);
    if (permissionIds.length !== input.permissionNames.length) {
      throw new BadRequestException('One or more permissions are invalid');
    }
    const id = await this.db.transaction((tx) =>
      this.rbac.createRole({ name: input.name, description: input.description, permissionIds }, tx),
    );
    return this.getRole(id);
  }

  async updateRole(id: string, input: { description?: string; permissionNames?: string[] }): Promise<RoleRecord> {
    const role = await this.getRole(id);
    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be modified');
    }
    let permissionIds: string[] | undefined;
    if (input.permissionNames) {
      permissionIds = await this.rbac.permissionIdsByNames(input.permissionNames);
      if (permissionIds.length !== input.permissionNames.length) {
        throw new BadRequestException('One or more permissions are invalid');
      }
    }
    await this.db.transaction((tx) =>
      this.rbac.updateRole(
        id,
        {
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(permissionIds !== undefined ? { permissionIds } : {}),
        },
        tx,
      ),
    );
    return this.getRole(id);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRole(id);
    if (role.isSystem) {
      throw new ForbiddenException('System roles cannot be deleted');
    }
    if (await this.rbac.isRoleAssigned(id)) {
      throw new ConflictException('Role is assigned to admins; unassign it first');
    }
    await this.rbac.deleteRole(id);
  }

  // ─── Customers (control + moderation) ────────────────────────────────────────

  async listUsers(page: number, pageSize: number, search?: string, status?: string): Promise<{ data: UserDto[]; total: number }> {
    const result = await this.users.list('customer', {
      page,
      pageSize,
      ...(search ? { search } : {}),
      ...(status ? { status: status as never } : {}),
    });
    return { data: result.data.map((u) => toUserDto(u)), total: result.total };
  }

  async getUser(id: string): Promise<{ user: UserDto; enforcementHistory: EnforcementRecord[] }> {
    const user = await this.getCustomer(id);
    const enforcementHistory = await this.enforcement.listForUser(id);
    return { user: toUserDto(user), enforcementHistory };
  }

  async updateUser(id: string, input: { firstName?: string; lastName?: string }): Promise<UserDto> {
    await this.getCustomer(id);
    const updated = await this.users.updateProfile(id, {
      ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
      ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
    });
    return toUserDto(updated!);
  }

  async suspend(id: string, actingAdminId: string, reason: string, until?: string): Promise<UserDto> {
    await this.getCustomer(id);
    const user = await this.db.transaction(async (tx) => {
      await this.enforcement.create(
        { userId: id, action: 'suspend', performedBy: actingAdminId, reason, ...(until ? { expiresAt: until } : {}) },
        tx,
      );
      return this.users.setStatus(id, { status: 'suspended', suspendedUntil: until ?? null, reason, changedBy: actingAdminId }, tx);
    });
    return toUserDto(user!);
  }

  async ban(id: string, actingAdminId: string, reason: string): Promise<UserDto> {
    await this.getCustomer(id);
    const user = await this.db.transaction(async (tx) => {
      await this.enforcement.create({ userId: id, action: 'ban', performedBy: actingAdminId, reason }, tx);
      return this.users.setStatus(id, { status: 'banned', reason, changedBy: actingAdminId }, tx);
    });
    return toUserDto(user!);
  }

  async reinstate(id: string, actingAdminId: string, reason?: string): Promise<UserDto> {
    await this.getCustomer(id);
    const user = await this.db.transaction(async (tx) => {
      await this.enforcement.create({ userId: id, action: 'reinstate', performedBy: actingAdminId, ...(reason ? { reason } : {}) }, tx);
      return this.users.setStatus(id, { status: 'active', reason: reason ?? null, changedBy: actingAdminId }, tx);
    });
    return toUserDto(user!);
  }

  private async getCustomer(id: string): Promise<NonNullable<Awaited<ReturnType<UsersRepository['findById']>>>> {
    const user = await this.users.findById(id);
    if (!user || user.accountType !== 'customer') {
      throw new NotFoundException('Customer not found');
    }
    return user;
  }
}
