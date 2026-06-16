import { Injectable } from '@nestjs/common';
import { CacheService } from '@cache/cache.service';
import { LevelDef, LevelRepository } from '@db/repositories/progression/level.repository';
import { RewardRuleRepository } from '@db/repositories/tokenomics/reward-rule.repository';
import { LevelingConfigDto, UpdateLevelingDto } from './dto/leveling.dto';

interface LevelingConfig {
  base_xp?: number;
  growth_multiplier?: number;
  max_level_cap?: number;
}

const CURVE_TAG = 'level-curve';
const CURVE_TTL = 600; // changes only on admin reconfigure

@Injectable()
export class LevelingService {
  constructor(
    private readonly levels: LevelRepository,
    private readonly rules: RewardRuleRepository,
    private readonly cache: CacheService,
  ) {}

  /** The XP→level curve (Level Requirements Table) — cached. */
  getCurve(): Promise<LevelDef[]> {
    return this.cache.getOrSetTagged('level-curve:all', [CURVE_TAG], CURVE_TTL, () => this.levels.getCurve());
  }

  /** Admin view: current config + curve. */
  async getConfig(): Promise<LevelingConfigDto> {
    const [rule, curve] = await Promise.all([this.rules.getByKey('leveling'), this.getCurve()]);
    const cfg = (rule?.config ?? {}) as LevelingConfig;
    return {
      baseXp: cfg.base_xp ?? 20,
      growthMultiplier: cfg.growth_multiplier ?? 1.5,
      maxLevelCap: cfg.max_level_cap ?? 100,
      version: rule?.version ?? 1,
      curve,
    };
  }

  /** Admin: update the curve config (versioned) then regenerate level_definitions. */
  async updateConfig(dto: UpdateLevelingDto, adminId: string): Promise<LevelingConfigDto> {
    await this.rules.update(
      'leveling',
      { config: { base_xp: dto.baseXp, growth_multiplier: dto.growthMultiplier, max_level_cap: dto.maxLevelCap } },
      adminId,
    );
    await this.levels.regenerate();
    await this.cache.invalidateTag(CURVE_TAG);
    return this.getConfig();
  }
}
