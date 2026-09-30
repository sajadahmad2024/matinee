import { Module } from '@nestjs/common';
import { AdminModerationController } from './admin-moderation.controller';
import { ContentReportController, UserReportController } from './customer-report.controller';
import { ModerationService } from './moderation.service';
import { ReportingService } from './reporting.service';

/**
 * Moderation module — the admin ticket queue + resolution + enforcement + bulk actions +
 * notes + audit trail, and customer reporting of videos and users. Tickets are created from
 * user reports (createOrBumpTicket upserts one open ticket per subject); resolving applies the
 * action (remove content via the content/comment repos, or warn/suspend/ban the offender via
 * the users + enforcement repos). All data access through global DBModule repositories.
 */
@Module({
  controllers: [AdminModerationController, ContentReportController, UserReportController],
  providers: [ModerationService, ReportingService],
})
export class ModerationModule {}
