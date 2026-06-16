import { Module } from '@nestjs/common';
import { AdminModerationController } from './admin-moderation.controller';
import { ModerationService } from './moderation.service';

/**
 * Moderation module — the admin ticket queue + resolution + enforcement. Tickets are created
 * from user reports (createOrBumpTicket dedups by subject); resolving applies the action
 * (remove content via the content/comment repos, or suspend/ban the offender via the users +
 * enforcement repos). All data access through global DBModule repositories.
 */
@Module({
  controllers: [AdminModerationController],
  providers: [ModerationService],
})
export class ModerationModule {}
