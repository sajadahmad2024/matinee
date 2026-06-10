import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../decorators/account-type.decorator';
import { Permissions } from '../decorators/permissions.decorator';
import { AdminManagementService } from './admin-management.service';
import { PermissionResponseDto } from './dto/management-responses.dto';

@ApiTags('Admin · Permissions')
@ApiBearerAuth()
@ApiCookieAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/permissions`, version: '1' })
export class AdminPermissionsController {
  constructor(private readonly mgmt: AdminManagementService) {}

  @Get()
  @Permissions('permissions:read')
  @ApiOperation({ summary: 'List the permission catalog' })
  @ApiEnvelope(PermissionResponseDto, { isArray: true })
  list() {
    return this.mgmt.listPermissions();
  }
}
