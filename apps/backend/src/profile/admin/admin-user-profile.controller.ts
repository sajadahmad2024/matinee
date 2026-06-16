import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ProfileService } from '../self/profile.service';
import { NotificationService } from '../notifications/notification.service';
import { AdminUser360Service } from './admin-user-360.service';
import { EarnsQueryDto, NotificationsQueryDto } from '../dto/profile-query.dto';
import { LedgerEntryDto, NotificationDto, WalletDto } from '../dto/profile-response.dto';
import { SetUserRolesDto, WarnUserDto } from '../dto/admin-user.dto';
import {
  ReferralsDto,
  UserGamesActivityDto,
  UserReportsActivityDto,
  UserRolesDto,
  UserWarnedDto,
  WatchHistoryDto,
} from '../dto/admin-user-360.dto';

/**
 * Admin read views of a customer's tokenomics + inbox (support / ops).
 * Mounted under /admin/users/:id alongside the admin user-management controller.
 * Point adjustments and notification authoring belong to the Tokenomics / Notifications
 * admin modules, not here.
 */
@ApiTags('Admin · Customer Profile')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.USERS}`, version: '1' })
export class AdminUserProfileController {
  constructor(
    private readonly profile: ProfileService,
    private readonly notifications: NotificationService,
    private readonly user360: AdminUser360Service,
  ) {}

  @Get(':id/wallet')
  @Permissions('users:read')
  @ApiOperation({ summary: "View a customer's wallet + level" })
  @ApiEnvelope(WalletDto)
  wallet(@Param('id', ParseUUIDPipe) id: string) {
    return this.profile.getWallet(id);
  }

  @Get(':id/earns')
  @Permissions('users:read')
  @ApiOperation({ summary: "View a customer's points/xp transaction history" })
  @ApiPaginatedEnvelope(LedgerEntryDto)
  earns(@Param('id', ParseUUIDPipe) id: string, @Query() query: EarnsQueryDto) {
    return this.profile.getEarns(id, query);
  }

  @Get(':id/notifications')
  @Permissions('users:read')
  @ApiOperation({ summary: "View a customer's notification inbox" })
  @ApiPaginatedEnvelope(NotificationDto)
  notificationsList(@Param('id', ParseUUIDPipe) id: string, @Query() query: NotificationsQueryDto) {
    return this.notifications.list(id, query);
  }

  @Get(':id/watch-history')
  @Permissions('users:read')
  @ApiOperation({ summary: "A customer's recent watch history" })
  @ApiEnvelope(WatchHistoryDto)
  watchHistory(@Param('id', ParseUUIDPipe) id: string) {
    return this.user360.watchHistory(id);
  }

  @Get(':id/referrals')
  @Permissions('users:read')
  @ApiOperation({ summary: "A customer's referral code + invited users + counts" })
  @ApiEnvelope(ReferralsDto)
  referrals(@Param('id', ParseUUIDPipe) id: string) {
    return this.user360.referrals(id);
  }

  @Get(':id/games')
  @Permissions('users:read')
  @ApiOperation({ summary: "A customer's game activity (quests / predictions / bids)" })
  @ApiEnvelope(UserGamesActivityDto)
  games(@Param('id', ParseUUIDPipe) id: string) {
    return this.user360.games(id);
  }

  @Get(':id/reports')
  @Permissions('users:read')
  @ApiOperation({ summary: 'Moderation reports against / made by the customer' })
  @ApiEnvelope(UserReportsActivityDto)
  reports(@Param('id', ParseUUIDPipe) id: string) {
    return this.user360.reports(id);
  }

  @Put(':id/roles')
  @Permissions('users:write')
  @ApiOperation({ summary: "Set a user's roles" })
  @ApiEnvelope(UserRolesDto)
  setRoles(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SetUserRolesDto) {
    return this.user360.setRoles(id, dto.roles);
  }

  @Post(':id/warn')
  @HttpCode(HttpStatus.OK)
  @Permissions('users:moderate')
  @ApiOperation({ summary: 'Send a warning notification to the user' })
  @ApiEnvelope(UserWarnedDto)
  warn(@Param('id', ParseUUIDPipe) id: string, @Body() dto: WarnUserDto) {
    return this.user360.warn(id, dto.message);
  }
}
