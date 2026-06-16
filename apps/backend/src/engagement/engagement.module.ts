import { Module } from '@nestjs/common';
import { ContentAccessService } from './services/content-access.service';
import { ReactionController } from './reactions/reaction.controller';
import { ReactionService } from './reactions/reaction.service';
import { ShareController } from './shares/share.controller';
import { ShareService } from './shares/share.service';
import { WatchlistController } from './watchlist/watchlist.controller';
import { WatchlistService } from './watchlist/watchlist.service';
import { CommentController } from './comments/comment.controller';
import { CommentThreadController } from './comments/comment-thread.controller';
import { AdminCommentController } from './comments/admin-comment.controller';
import { CommentService } from './comments/comment.service';
import { ViewController } from './views/view.controller';
import { ViewService } from './views/view.service';

/**
 * Engagement module — customer interactions on content. Organized by feature folder
 * (reactions / shares / watchlist / comments / views). Data access via the global
 * DBModule repositories; denormalized counters maintained by DB triggers. Earning/analytics
 * happen off domain events (see events/engagement.events.ts) — owned by Tokenomics/Events.
 */
@Module({
  controllers: [
    ReactionController,
    ShareController,
    WatchlistController,
    CommentController,
    CommentThreadController,
    AdminCommentController,
    ViewController,
  ],
  providers: [ContentAccessService, ReactionService, ShareService, WatchlistService, CommentService, ViewService],
})
export class EngagementModule {}
