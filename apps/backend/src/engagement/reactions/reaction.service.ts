import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ReactionKind, ReactionRepository } from '@db/repositories/engagement/reaction.repository';
import { ContentAccessService } from '../services/content-access.service';
import { ContentReactedPayload, EngagementEvent } from '../events/engagement.events';
import { ReactionStateDto } from './dto/reaction.dto';

@Injectable()
export class ReactionService {
  constructor(
    private readonly reactions: ReactionRepository,
    private readonly access: ContentAccessService,
    private readonly events: EventEmitter2,
  ) {}

  private async state(userId: string, contentId: string): Promise<ReactionStateDto> {
    const [reaction, counts] = await Promise.all([
      this.reactions.getUserReaction(userId, contentId),
      this.access.getCounts(contentId),
    ]);
    return { reaction, likeCount: counts.likeCount, dislikeCount: counts.dislikeCount };
  }

  async set(userId: string, contentId: string, reaction: ReactionKind): Promise<ReactionStateDto> {
    await this.access.assertPublished(contentId);
    await this.reactions.set(userId, contentId, reaction);
    this.events.emit(EngagementEvent.ContentReacted, { userId, contentId, reaction } satisfies ContentReactedPayload);
    return this.state(userId, contentId);
  }

  async remove(userId: string, contentId: string): Promise<ReactionStateDto> {
    await this.access.assertPublished(contentId);
    await this.reactions.remove(userId, contentId);
    this.events.emit(EngagementEvent.ContentReactionRemoved, { userId, contentId });
    return this.state(userId, contentId);
  }

  async get(userId: string, contentId: string): Promise<ReactionStateDto> {
    await this.access.assertPublished(contentId);
    return this.state(userId, contentId);
  }
}
