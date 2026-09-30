import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AccountTypes, AdminOnly } from '@auth/decorators/account-type.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { AuthContext } from '@auth/interfaces/auth-context.interface';
import { AccountType } from '@auth/interfaces/jwt-payload.interface';
import { MediaService } from './media.service';
import { RequestUploadDto } from './dto/request-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { UpdateMediaMetadataDto } from './dto/update-media-metadata.dto';
import { MediaDto, MediaStatusEventDto, PlaybackDto, UploadTicketDto } from './dto/media-response.dto';
import { MessageResponseDto } from '@common/dto/message-response.dto';

@ApiTags('Media')
@ApiBearerAuth()
@Controller({ path: RouteNames.MEDIA, version: '1' })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('uploads')
  @AccountTypes(AccountType.ADMIN, AccountType.CUSTOMER)
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary:
      'Request a secure upload — returns a media id + presigned S3 PUT URL. After PUT, the ' +
      'client can OPTIONALLY call POST /:id/complete for explicit HEAD-check + fast READY ' +
      'flip on non-videos; videos are flipped to READY by the transcoder Lambda when the S3 ' +
      'ObjectCreated event fires (whether or not /complete is called).',
  })
  @ApiEnvelope(UploadTicketDto, { status: 201 })
  requestUpload(@CurrentUser() user: AuthContext, @Body() dto: RequestUploadDto) {
    return this.media.requestUpload(dto, user);
  }

  @Post(':id/complete')
  @AccountTypes(AccountType.ADMIN, AccountType.CUSTOMER)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Confirm the client-side PUT landed. HEAD-checks S3 for the object (400 if missing); ' +
      'for non-video uploads flips status straight to READY. For videos the Lambda-via-S3-' +
      'event owns the final READY transition — this call just captures the client\'s ' +
      'metadata (sizeBytes/checksum + optional probed durationSeconds/width/height, which only ' +
      'fill empty columns) and short-circuits early errors.',
  })
  @ApiEnvelope(MediaDto)
  completeUpload(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: CompleteUploadDto) {
    return this.media.completeUpload(id, dto, user);
  }

  // Reads are intentionally available to ANY authenticated account type (guest/customer/admin) —
  // media is an asset-delivery layer; content-tier gating happens at the content/access layer. The
  // global AuthGuard still requires a valid token (these are not @Public).
  @Get(':id')
  @ApiOperation({ summary: 'Get media metadata (+ direct URL for public, ready assets)' })
  @ApiEnvelope(MediaDto)
  getById(@Param('id') id: string) {
    return this.media.getById(id);
  }

  @Get(':id/events')
  @AdminOnly()
  @ApiOperation({ summary: 'Status-by-status lifecycle history of an asset' })
  @ApiEnvelope(MediaStatusEventDto, { isArray: true })
  getEvents(@Param('id') id: string) {
    return this.media.getEvents(id);
  }

  @Get(':id/playback')
  @ApiOperation({
    summary:
      'Signed playback descriptor (HLS cookies / signed URL) for a ready asset. Non-admins get 403 for ' +
      'content videos — use GET /v1/content/:id/playback (entitlement-checked).',
  })
  @ApiEnvelope(PlaybackDto)
  getPlayback(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.media.getPlaybackFor(id, user);
  }

  @Patch(':id/metadata')
  @AdminOnly()
  @ApiOperation({ summary: 'Override duration / resolution / alt text (null clears)' })
  @ApiEnvelope(MediaDto)
  updateMetadata(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateMediaMetadataDto) {
    return this.media.updateMetadata(id, dto);
  }

  @Delete(':id')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Soft-delete an asset (storage objects cleaned up async)' })
  @ApiEnvelope(MessageResponseDto)
  async remove(@Param('id') id: string) {
    await this.media.remove(id);
    return { message: 'Media deleted' };
  }
}
