import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Controller, Get, Param, ParseUUIDPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AuthContext } from '../../auth/interfaces/auth-context.interface';
import { AccessService } from './access.service';
import { ContentPlaybackDto } from './dto/access.dto';

/** Playback for content videos — the only customer path to a signed content stream. */
@ApiTags('Content · Access')
@ApiBearerAuth()
@Controller({ path: RouteNames.CONTENT, version: '1' })
export class ContentPlaybackController {
  constructor(private readonly access: AccessService) {}

  @Get(':id/playback')
  @ApiOperation({
    summary:
      'Signed playback for a content video (published + available + region + exclusive unlock checked; admins may preview anything)',
  })
  @ApiEnvelope(ContentPlaybackDto)
  playback(@CurrentUser() user: AuthContext, @Param('id', ParseUUIDPipe) id: string) {
    return this.access.playback(user, id);
  }
}
