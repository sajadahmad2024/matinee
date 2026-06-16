import { Injectable, NotFoundException } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import {
  RewardRuleRecord,
  RewardRuleRepository,
  RewardRuleVersionRecord,
} from '@db/repositories/tokenomics/reward-rule.repository';
import { EarnRuleDto, UpdateRewardRuleDto } from './dto/reward-rule.dto';

const RULES_TAG = 'reward-rules';
const RULES_TTL = 300; // change rarely; busted on admin edit

@Injectable()
export class RewardRuleService {
  constructor(
    private readonly rules: RewardRuleRepository,
    private readonly cache: CacheService,
  ) {}

  /** Customer "what you can earn" — enabled rules only, cached. */
  listForCustomer(): Promise<EarnRuleDto[]> {
    return this.cache.getOrSetTagged('reward-rules:customer', [RULES_TAG], RULES_TTL, async () => {
      const rules = await this.rules.list({ enabledOnly: true });
      return rules.map((r) => ({ ruleKey: r.ruleKey, name: r.name, description: r.description, config: r.config }));
    });
  }

  // ─── Admin ───────────────────────────────────────────────────────────────────
  adminList(): Promise<RewardRuleRecord[]> {
    return this.rules.list();
  }

  async adminGet(ruleKey: string): Promise<RewardRuleRecord> {
    const rule = await this.rules.getByKey(ruleKey);
    if (!rule) {
      throw new NotFoundException('Reward rule not found');
    }
    return rule;
  }

  async adminUpdate(ruleKey: string, dto: UpdateRewardRuleDto, adminId: string): Promise<RewardRuleRecord> {
    const patch = {
      ...(dto.name !== undefined ? { name: dto.name } : {}),
      ...(dto.description !== undefined ? { description: dto.description } : {}),
      ...(dto.isEnabled !== undefined ? { isEnabled: dto.isEnabled } : {}),
      ...(dto.config !== undefined ? { config: dto.config } : {}),
    };
    const updated = await this.rules.update(ruleKey, patch, adminId);
    if (!updated) {
      throw new NotFoundException('Reward rule not found');
    }
    await this.cache.invalidateTag(RULES_TAG);
    return updated;
  }

  async adminVersions(ruleKey: string): Promise<RewardRuleVersionRecord[]> {
    await this.adminGet(ruleKey); // 404 if the rule doesn't exist
    return this.rules.listVersions(ruleKey);
  }
}
