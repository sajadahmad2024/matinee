import { Injectable, NotFoundException } from '@nestjs/common';
import { ContentRepository } from '@db/repositories/content/content.repository';

export interface ContentCounts {
  viewCount: number;
  likeCount: number;
  dislikeCount: number;
  commentCount: number;
  shareCount: number;
}

/**
 * Shared guard/read used by every engagement feature: a customer may only engage with
 * content that is published & live. Centralized so the rule lives in one place.
 */
@Injectable()
export class ContentAccessService {
  constructor(private readonly content: ContentRepository) {}

  /** Throws 404 unless the content exists, is published and not deleted. */
  async assertPublished(contentId: string): Promise<void> {
    const c = await this.content.findById(contentId);
    if (!c || c.status !== 'published') {
      throw new NotFoundException('Content not found');
    }
  }

  /** Fresh denormalized counters (read after a mutation so the trigger value is authoritative). */
  async getCounts(contentId: string): Promise<ContentCounts> {
    const c = await this.content.findById(contentId);
    if (!c) {
      throw new NotFoundException('Content not found');
    }
    return {
      viewCount: c.viewCount,
      likeCount: c.likeCount,
      dislikeCount: c.dislikeCount,
      commentCount: c.commentCount,
      shareCount: c.shareCount,
    };
  }
}
