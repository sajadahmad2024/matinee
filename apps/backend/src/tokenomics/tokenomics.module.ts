import { Module } from '@nestjs/common';
import { LedgerService } from './ledger/ledger.service';
import { RewardRuleService } from './rules/reward-rule.service';
import { RewardRuleController } from './rules/reward-rule.controller';
import { AdminRewardRuleController } from './rules/admin-reward-rule.controller';
import { AdminLedgerController } from './admin/admin-ledger.controller';
import { EarningService } from './earning/earning.service';
import { EarningController } from './earning/earning.controller';
import { ShareRewardListener } from './earning/share-reward.listener';

/**
 * Tokenomics module — the write side of the points/xp economy. Owns the ledger award/spend
 * engine (idempotent; wallet maintained by DB trigger), the versioned reward-rule config,
 * admin manual adjustments, and the earning flows (daily-login claim + the live engagement
 * share→award consumer). LedgerService + RewardRuleService are exported so games reuse them.
 * Reads (wallet/earns) stay in the profile module against the same repos.
 */
@Module({
  controllers: [RewardRuleController, AdminRewardRuleController, AdminLedgerController, EarningController],
  providers: [LedgerService, RewardRuleService, EarningService, ShareRewardListener],
  exports: [LedgerService, RewardRuleService],
})
export class TokenomicsModule {}
