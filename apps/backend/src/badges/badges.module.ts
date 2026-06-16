import { Module } from '@nestjs/common';
import { BadgesController } from './badges.controller';
import { AdminBadgesController } from './admin-badges.controller';
import { BadgesService } from './badges.service';

/**
 * Badges module — achievement catalog + admin management. Auto-award happens in the DB
 * (trg_evaluate_badges on user_metrics), so this owns the catalog/admin surface; the
 * metric-tracking that drives awards is an analytics concern (Phase 7).
 */
@Module({
  controllers: [BadgesController, AdminBadgesController],
  providers: [BadgesService],
})
export class BadgesModule {}
