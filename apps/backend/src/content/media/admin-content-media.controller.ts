import { RouteNames } from '@common/route-names';
import { MessageResponseDto } from '@common/dto/message-response.dto';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { ContentMediaService } from './content-media.service';
import { AddContentMediaDto, ContentMediaItemDto, ReorderContentMediaDto } from './dto/content-media.dto';

/** Admin: stills / posters / thumbnails / banners of a content. */
@ApiTags('Admin · Content')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/content`, version: '1' })
export class AdminContentMediaController {
  constructor(private readonly items: ContentMediaService) {}

  @Get(':id/media')
  @Permissions('content:read')
  @ApiOperation({ summary: 'Attached stills / posters / thumbnails / banners (display order)' })
  @ApiEnvelope(ContentMediaItemDto, { isArray: true })
  list(@Param('id', ParseUUIDPipe) id: string) {
    return this.items.list(id);
  }

  @Post(':id/media')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Attach an image media (still / poster / thumbnail / banner)' })
  @ApiEnvelope(ContentMediaItemDto, { status: 201 })
  add(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: AddContentMediaDto) {
    return this.items.add(adminId, id, dto);
  }

  @Put(':id/media/order')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Reorder attachments' })
  @ApiEnvelope(ContentMediaItemDto, { isArray: true })
  reorder(@CurrentUser('id') adminId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ReorderContentMediaDto) {
    return this.items.reorder(adminId, id, dto);
  }

  @Delete(':id/media/:mediaId')
  @Permissions('content:write')
  @ApiOperation({ summary: 'Detach a media (the media row itself is kept)' })
  @ApiEnvelope(MessageResponseDto)
  remove(
    @CurrentUser('id') adminId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('mediaId', ParseUUIDPipe) mediaId: string,
  ) {
    return this.items.remove(adminId, id, mediaId);
  }
}
