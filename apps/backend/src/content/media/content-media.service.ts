import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { ContentExtrasRepository } from '@db/repositories/content/content-extras.repository';
import { ContentRepository } from '@db/repositories/content/content.repository';
import { MediaType } from '@media/constants/media.constant';
import { MediaService } from '@media/media.service';
import { AddContentMediaDto, ContentMediaItemDto, ReorderContentMediaDto } from './dto/content-media.dto';

/** Stills / posters / alt thumbnails / banners attached to a content (`content_media`). */
@Injectable()
export class ContentMediaService {
  constructor(
    private readonly extras: ContentExtrasRepository,
    private readonly content: ContentRepository,
    private readonly media: MediaService,
    private readonly cache: CacheService,
  ) {}

  private async assertContent(contentId: string): Promise<void> {
    if (!(await this.content.findById(contentId))) throw new NotFoundException('Content not found');
  }

  async list(contentId: string): Promise<ContentMediaItemDto[]> {
    await this.assertContent(contentId);
    const items = await this.extras.listContentMediaItems(contentId);
    const records = await this.media.findRecords(items.map((i) => i.mediaId));
    return items.map((i) => {
      const record = records.get(i.mediaId);
      return {
        id: i.id,
        mediaId: i.mediaId,
        kind: i.kind,
        sortOrder: i.sortOrder,
        timecodeSeconds: i.timecodeSeconds,
        url: record ? this.media.urlOf(record) : null,
        status: i.mediaStatus,
        width: i.width,
        height: i.height,
        createdAt: i.createdAt,
      };
    });
  }

  async add(adminId: string, contentId: string, dto: AddContentMediaDto): Promise<ContentMediaItemDto> {
    await this.assertContent(contentId);
    const record = (await this.media.findRecords([dto.mediaId])).get(dto.mediaId);
    if (!record) throw new BadRequestException('mediaId not found');
    if (record.mediaType !== MediaType.IMAGE) throw new BadRequestException('Only image media can be attached as a still/poster');
    const kind = dto.kind ?? 'still';
    const id = await this.extras.addContentMedia(contentId, {
      mediaId: dto.mediaId,
      kind,
      sortOrder: dto.sortOrder,
      timecodeSeconds: dto.timecodeSeconds,
    });
    if (!id) throw new ConflictException('This media is already attached to the content');
    await this.extras.recordChange(contentId, 'updated', adminId, `Media attached (${kind})`, { mediaId: dto.mediaId, kind });
    await this.cache.invalidateTag('content');
    const item = (await this.list(contentId)).find((i) => i.id === id);
    return item!;
  }

  async reorder(adminId: string, contentId: string, dto: ReorderContentMediaDto): Promise<ContentMediaItemDto[]> {
    await this.assertContent(contentId);
    const current = new Set((await this.extras.listContentMediaItems(contentId)).map((i) => i.mediaId));
    const unknown = dto.mediaIds.filter((m) => !current.has(m));
    if (unknown.length > 0) throw new BadRequestException(`Not attached to this content: ${unknown.join(', ')}`);
    await this.extras.reorderContentMedia(contentId, dto.mediaIds);
    await this.extras.recordChange(contentId, 'updated', adminId, 'Media reordered');
    await this.cache.invalidateTag('content');
    return this.list(contentId);
  }

  async remove(adminId: string, contentId: string, mediaId: string): Promise<{ message: string }> {
    await this.assertContent(contentId);
    if (!(await this.extras.removeContentMedia(contentId, mediaId))) {
      throw new NotFoundException('Media is not attached to this content');
    }
    await this.extras.recordChange(contentId, 'updated', adminId, 'Media detached', { mediaId });
    await this.cache.invalidateTag('content');
    return { message: 'Media detached' };
  }
}
