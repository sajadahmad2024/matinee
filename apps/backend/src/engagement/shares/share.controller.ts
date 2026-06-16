import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, HttpCode, HttpStatus, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CustomerOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { ShareService } from './share.service';
import { ShareContentDto, ShareResultDto } from './dto/share.dto';

/** Share a content to a channel (each share is an event → counter + earning seam). */
@ApiTags('Engagement · Shares')
@ApiBearerAuth()
@CustomerOnly()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ShareController {
  constructor(private readonly shares: ShareService) {}

  @Post(':id/share')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Record a share (optional channel)' })
  @ApiEnvelope(ShareResultDto)
  share(@CurrentUser('id') userId: string, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ShareContentDto) {
    return this.shares.share(userId, id, dto.channel);
  }
}
