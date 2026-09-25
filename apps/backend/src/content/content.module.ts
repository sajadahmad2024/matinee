import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AdminContentInsightsController } from './insights/admin-content-insights.controller';
import { ContentInsightsService } from './insights/content-insights.service';
import { ContentController } from './catalog/content.controller';
import { AdminContentController } from './catalog/admin-content.controller';
import { ContentService } from './catalog/content.service';
import { TaxonomyController } from './taxonomy/taxonomy.controller';
import { AdminTaxonomyController } from './taxonomy/admin-taxonomy.controller';
import { TaxonomyService } from './taxonomy/taxonomy.service';
import { AdminContentExtrasController } from './extras/admin-content-extras.controller';
import { ContentExtrasService } from './extras/content-extras.service';
import { AccessController } from './access/access.controller';
import { AccessService } from './access/access.service';
import { ContentPlaybackController } from './access/content-playback.controller';
import { BoostNotifierService } from './catalog/boost-notifier.service';
import { AdminContentMediaController } from './media/admin-content-media.controller';
import { ContentMediaService } from './media/content-media.service';

/**
 * Content module — catalog + customer feed + admin review/publish workflow + taxonomy +
 * licensing / sponsorship / publish-regions / change-history.
 * Repositories live in the global DBModule; this module owns the HTTP + business layer.
 */
@Module({
  imports: [MediaModule],
  controllers: [
    ContentController,
    // static /admin/content/{stats,licenses} must register before AdminContentController's /:id
    AdminContentInsightsController,
    AdminContentController,
    AdminContentExtrasController,
    AdminContentMediaController,
    TaxonomyController,
    AdminTaxonomyController,
    AccessController,
    ContentPlaybackController,
  ],
  providers: [
    ContentService,
    TaxonomyService,
    ContentExtrasService,
    AccessService,
    ContentInsightsService,
    BoostNotifierService,
    ContentMediaService,
  ],
  exports: [ContentService, TaxonomyService, ContentExtrasService, AccessService, BoostNotifierService],
})
export class ContentModule {}
