import { Module } from '@nestjs/common';
import { CatalogController } from './catalog/catalog.controller';
import { AdminCatalogController } from './catalog/admin-catalog.controller';
import { CatalogService } from './catalog/catalog.service';
import { RedemptionController } from './redemptions/redemption.controller';
import { AdminRedemptionController } from './redemptions/admin-redemption.controller';
import { RedemptionService } from './redemptions/redemption.service';

/**
 * Redemption store (Premium Experiences) — spend points on a curated catalog.
 * catalog/ (browse + admin CRUD) and redemptions/ (atomic redeem: stock claim + ledger spend +
 * redemption record; admin fulfill + cancel-with-refund). Spends via the shared LedgerRepository;
 * subscription/region/stock gates enforced before any debit. Feature-foldered per auth.
 */
@Module({
  controllers: [CatalogController, AdminCatalogController, RedemptionController, AdminRedemptionController],
  providers: [CatalogService, RedemptionService],
})
export class RedemptionModule {}
