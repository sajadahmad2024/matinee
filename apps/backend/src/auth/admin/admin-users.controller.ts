import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import {
  Body,
  Controller,
  DefaultValuePipe,
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
import { AdminUpdateUserDto, BanUserDto, ReinstateUserDto, SuspendUserDto } from './dto/customer-management.dto';
import { UserDetailResponseDto, UserListResponseDto } from './dto/management-responses.dto';
import { UserResponseDto } from '../dto/auth-responses.dto';

@ApiTags('Admin · Customers')
@ApiBearerAuth()
@ApiCookieAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/users`, version: '1' })
export class AdminUsersController {
  constructor(private readonly mgmt: AdminManagementService) {}

  @Get()
  @Permissions('users:read')
  @ApiOperation({ summary: 'List customers' })
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
    return this.mgmt.listUsers(page, pageSize, search, status);
  }

  @Get(':id')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Get a customer with enforcement history' })
  @ApiEnvelope(UserDetailResponseDto)
  get(@Param('id', ParseUUIDPipe) id: string) {
    return this.mgmt.getUser(id);
  }

  @Patch(':id')
  @Permissions('users:write')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update a customer profile' })
  @ApiEnvelope(UserResponseDto)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: AdminUpdateUserDto) {
    return this.mgmt.updateUser(id, {
      ...(dto.firstName !== undefined ? { firstName: dto.firstName } : {}),
      ...(dto.lastName !== undefined ? { lastName: dto.lastName } : {}),
    });
  }

  @Post(':id/suspend')
  @Permissions('users:moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Suspend a customer (temporary)' })
  @ApiEnvelope(UserResponseDto)
  suspend(@CurrentUser('id') actingAdminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SuspendUserDto) {
    return this.mgmt.suspend(id, actingAdminId, dto.reason, dto.until);
  }

  @Post(':id/ban')
  @Permissions('users:moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Ban a customer (indefinite)' })
  @ApiEnvelope(UserResponseDto)
  ban(@CurrentUser('id') actingAdminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: BanUserDto) {
    return this.mgmt.ban(id, actingAdminId, dto.reason);
  }

  @Post(':id/reinstate')
  @Permissions('users:moderate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reinstate a suspended/banned customer' })
  @ApiEnvelope(UserResponseDto)
  reinstate(@CurrentUser('id') actingAdminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReinstateUserDto) {
    return this.mgmt.reinstate(id, actingAdminId, dto.reason);
  }
}
