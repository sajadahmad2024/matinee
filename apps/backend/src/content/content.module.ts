import { Module } from '@nestjs/common';
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

/**
 * Content module — catalog + customer feed + admin review/publish workflow + taxonomy +
 * licensing / sponsorship / publish-regions / change-history.
 * Repositories live in the global DBModule; this module owns the HTTP + business layer.
 */
@Module({
  controllers: [
    ContentController,
    AdminContentController,
    AdminContentExtrasController,
    TaxonomyController,
    AdminTaxonomyController,
    AccessController,
  ],
  providers: [ContentService, TaxonomyService, ContentExtrasService, AccessService],
  exports: [ContentService, TaxonomyService, ContentExtrasService, AccessService],
})
export class ContentModule {}
