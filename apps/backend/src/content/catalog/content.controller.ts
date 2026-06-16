import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { ApiPaginatedEnvelope } from '@common/swagger/api-paginated-envelope.decorator';
import { Controller, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../../auth/decorators/public.decorator';
import { ContentService } from './content.service';
import { FeedQueryDto } from './dto/content-query.dto';
import { ContentResponseDto } from './dto/content-response.dto';

/** Customer-facing content: the vertical feed + content detail. */
@ApiTags('Content')
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ContentController {
  constructor(private readonly content: ContentService) {}

  @Get('feed')
  @Public()
  @ApiOperation({ summary: 'Vertical content feed (published, region-available, boosted first)' })
  @ApiPaginatedEnvelope(ContentResponseDto)
  feed(@Query() query: FeedQueryDto) {
    return this.content.feed(query);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Content detail (published only)' })
  @ApiEnvelope(ContentResponseDto)
  detail(@Param('id', ParseUUIDPipe) id: string) {
    return this.content.getPublic(id);
  }
}
