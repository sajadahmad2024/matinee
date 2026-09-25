import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { AdminAdsController } from './admin-ads.controller';
import { AdsController, ContentAdsController } from './ads.controller';
import { AdsService } from './ads.service';
import { AdSalesService } from './ad-sales.service';
import { AdminAdSalesController } from './admin-ad-sales.controller';

/**
 * Ads (TTLE-233): per-content ad serving, ad event tracking and admin performance reporting.
 * Ad configuration itself is the content sponsorship (ContentExtras); feed commercial insertion
 * is in ContentService. Repositories come from the global DBModule.
 */
@Module({
  imports: [MediaModule],
  controllers: [AdsController, ContentAdsController, AdminAdsController, AdminAdSalesController],
  providers: [AdsService, AdSalesService],
  exports: [AdsService, AdSalesService],
})
export class AdsModule {}
