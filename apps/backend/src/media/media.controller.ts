import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '@auth/decorators/account-type.decorator';
import { CurrentUser } from '@auth/decorators/current-user.decorator';
import { MediaService } from './media.service';
import { RequestUploadDto } from './dto/request-upload.dto';
import { CompleteUploadDto } from './dto/complete-upload.dto';
import { MediaDto, MediaStatusEventDto, PlaybackDto, UploadTicketDto } from './dto/media-response.dto';
import { MessageResponseDto } from '@common/dto/message-response.dto';

@ApiTags('Media')
@ApiBearerAuth()
@Controller({ path: RouteNames.MEDIA, version: '1' })
export class MediaController {
  constructor(private readonly media: MediaService) {}

  @Post('uploads')
  @AdminOnly()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Request a secure upload — returns a media id + presigned target' })
  @ApiEnvelope(UploadTicketDto, { status: 201 })
  requestUpload(@CurrentUser('id') userId: string, @Body() dto: RequestUploadDto) {
    return this.media.requestUpload(dto, userId);
  }

  @Post(':id/complete')
  @AdminOnly()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Finalize an upload — verifies the object, transcodes video, marks ready' })
  @ApiEnvelope(MediaDto)
  completeUpload(@Param('id') id: string, @Body() dto: CompleteUploadDto) {
    return this.media.completeUpload(id, dto);
  }

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
  @ApiOperation({ summary: 'Get a signed playback descriptor (HLS cookies / signed URL) for a ready asset' })
  @ApiEnvelope(PlaybackDto)
  getPlayback(@Param('id') id: string) {
    return this.media.getPlayback(id);
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
