import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../decorators/account-type.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { CurrentUser } from '../decorators/current-user.decorator';
import { AdminManagementService } from './admin-management.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { UserListResponseDto } from './dto/management-responses.dto';
import { MessageResponseDto, UserResponseDto } from '../dto/auth-responses.dto';

@ApiTags('Admin · Admins')
@ApiBearerAuth()
@ApiCookieAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/admins`, version: '1' })
export class AdminAdminsController {
  constructor(private readonly mgmt: AdminManagementService) {}

  @Get()
  @Permissions('admins:read')
  @ApiOperation({ summary: 'List admins' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'search', required: false })
  @ApiQuery({ name: 'status', required: false })
  @ApiEnvelope(UserListResponseDto)
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.mgmt.listAdmins(page, pageSize, search, status);
  }

  @Get(':id')
  @Permissions('admins:read')
  @ApiOperation({ summary: 'Get an admin' })
  @ApiEnvelope(UserResponseDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.mgmt.getAdmin(id);
  }

  @Post()
  @Permissions('admins:write')
  @ApiOperation({ summary: 'Create an admin (sends a set-password email)' })
  @ApiEnvelope(UserResponseDto, { status: 201 })
  create(@CurrentUser('id') actingAdminId: string, @Body() dto: CreateAdminDto) {
    return this.mgmt.createAdmin(
      {
        email: dto.email,
        ...(dto.firstName ? { firstName: dto.firstName } : {}),
        ...(dto.lastName ? { lastName: dto.lastName } : {}),
        roleIds: dto.roleIds,
      },
      actingAdminId,
    );
  }

  @Patch(':id')
  @Permissions('admins:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update an admin (profile / roles / status)' })
  @ApiEnvelope(UserResponseDto)
  update(@CurrentUser('id') actingAdminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateAdminDto) {
    return this.mgmt.updateAdmin(id, actingAdminId, {
      ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
      ...(dto.roleIds !== undefined ? { roleIds: dto.roleIds } : {}),
      ...(dto.status !== undefined ? { status: dto.status } : {}),
    });
  }

  @Delete(':id')
  @Permissions('admins:delete')
  @ApiOperation({ summary: 'Remove (disable + revoke) an admin' })
  @ApiEnvelope(MessageResponseDto)
  async remove(@CurrentUser('id') actingAdminId: string, @Param('id', ParseUUIDPipe) id: string) {
    await this.mgmt.removeAdmin(id, actingAdminId);
    return { message: 'Admin removed' };
  }
}
