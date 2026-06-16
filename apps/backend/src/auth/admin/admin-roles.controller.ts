import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../decorators/account-type.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { AdminManagementService } from './admin-management.service';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.dto';
import { RoleResponseDto } from './dto/management-responses.dto';
import { MessageResponseDto } from '../dto/auth-responses.dto';

@ApiTags('Admin · Roles')
@ApiBearerAuth()
@ApiCookieAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/roles`, version: '1' })
export class AdminRolesController {
  constructor(private readonly mgmt: AdminManagementService) {}

  @Get()
  @Permissions('roles:read')
  @ApiOperation({ summary: 'List roles with their permissions' })
  @ApiEnvelope(RoleResponseDto, { isArray: true })
  list() {
    return this.mgmt.listRoles();
  }

  @Get(':id')
  @Permissions('roles:read')
  @ApiOperation({ summary: 'Get a role' })
  @ApiEnvelope(RoleResponseDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.mgmt.getRole(id);
  }

  @Post()
  @Permissions('roles:write')
  @ApiOperation({ summary: 'Create a custom role' })
  @ApiEnvelope(RoleResponseDto, { status: 201 })
  create(@Body() dto: CreateRoleDto) {
    return this.mgmt.createRole({
      name: dto.name,
      ...(dto.description ? { description: dto.description } : {}),
      permissionNames: dto.permissionNames,
    });
  }

  @Patch(':id')
  @Permissions('roles:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a custom role (system roles are locked)' })
  @ApiEnvelope(RoleResponseDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.mgmt.updateRole(id, {
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.permissionNames !== undefined ? { permissionNames: dto.permissionNames } : {}),
    });
  }

  @Delete(':id')
  @Permissions('roles:delete')
  @ApiOperation({ summary: 'Delete a custom role (if unassigned; system roles locked)' })
  @ApiEnvelope(MessageResponseDto)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.mgmt.deleteRole(id);
    return { message: 'Role deleted' };
  }
}
