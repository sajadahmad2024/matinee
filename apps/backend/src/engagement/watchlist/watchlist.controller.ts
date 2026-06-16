import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Delete, Get, Param, ParseUUIDPipe, Put, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ContentResponseDto } from '../../content/catalog/dto/content-response.dto';
import { PageQuery } from '../dto/engagement-query.dto';
import { WatchlistResultDto } from './dto/watchlist.dto';
import { WatchlistService } from './watchlist.service';

/** Save-for-later watchlist. */
@ApiTags('Engagement · Watchlist')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.WATCHLIST, version: '1' })
export class WatchlistController {
  constructor(private readonly watchlist: WatchlistService) {}

  @Get()
  @ApiOperation({ summary: 'My saved content (newest first)' })
  @ApiEnvelope(ContentResponseDto, { isArray: true })
  list(@CurrentUser('id') userId: string, @Query() query: PageQuery) {
    return this.watchlist.list(userId, query.page, query.limit);
  }

  @Put(':contentId')
  @ApiOperation({ summary: 'Save a content' })
  @ApiEnvelope(WatchlistResultDto)
  save(@CurrentUser('id') userId: string, @Param('contentId', ParseUUIDPipe) contentId: string) {
    return this.watchlist.add(userId, contentId);
  }

  @Delete(':contentId')
  @ApiOperation({ summary: 'Remove a saved content' })
  @ApiEnvelope(WatchlistResultDto)
  unsave(@CurrentUser('id') userId: string, @Param('contentId', ParseUUIDPipe) contentId: string) {
    return this.watchlist.remove(userId, contentId);
  }
}
