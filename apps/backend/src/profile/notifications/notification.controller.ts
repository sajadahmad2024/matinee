import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { NotificationService } from './notification.service';
import { NotificationsQueryDto } from '../dto/profile-query.dto';
import { MarkAllReadResultDto, NotificationDto, UnreadCountDto } from '../dto/profile-response.dto';

/** Customer in-app notification inbox. */
@ApiTags('Profile · Notifications')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: `${RouteNames.PROFILE}/notifications`, version: '1' })
export class NotificationController {
  constructor(private readonly notifications: NotificationService) {}

  @Get()
  @ApiOperation({ summary: 'Inbox — paginated, filter by category / unread' })
  @ApiPaginatedEnvelope(NotificationDto)
  list(@CurrentUser('id') userId: string, @Query() query: NotificationsQueryDto) {
    return this.notifications.list(userId, query);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Unread badge count' })
  @ApiEnvelope(UnreadCountDto)
  unreadCount(@CurrentUser('id') userId: string) {
    return this.notifications.unreadCount(userId);
  }

  @Post('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications read' })
  @ApiEnvelope(MarkAllReadResultDto)
  markAllRead(@CurrentUser('id') userId: string) {
    return this.notifications.markAllRead(userId);
  }

  @Post(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark one notification read (idempotent)' })
  @ApiEnvelope(MessageResponseDto)
  markRead(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.notifications.markRead(userId, id);
  }
}
