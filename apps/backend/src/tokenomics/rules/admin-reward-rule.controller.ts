import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, Param, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../../auth/decorators/account-type.decorator';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';
import { RewardRuleService } from './reward-rule.service';
import { RewardRuleDto, RewardRuleVersionDto, UpdateRewardRuleDto } from './dto/reward-rule.dto';

/** Admin tokenomics config — the reward-rule engine (versioned). */
@ApiTags('Admin · Tokenomics')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.REWARDS}/rules`, version: '1' })
export class AdminRewardRuleController {
  constructor(private readonly rules: RewardRuleService) {}

  @Get()
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'List all reward rules' })
  @ApiEnvelope(RewardRuleDto, { isArray: true })
  list() {
    return this.rules.adminList();
  }

  @Get(':ruleKey')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Get a reward rule by key' })
  @ApiEnvelope(RewardRuleDto)
  get(@Param('ruleKey') ruleKey: string) {
    return this.rules.adminGet(ruleKey);
  }

  @Get(':ruleKey/versions')
  @Permissions('rewards:read')
  @ApiOperation({ summary: 'Version history for a reward rule (newest first)' })
  @ApiEnvelope(RewardRuleVersionDto, { isArray: true })
  versions(@Param('ruleKey') ruleKey: string) {
    return this.rules.adminVersions(ruleKey);
  }

  @Patch(':ruleKey')
  @Permissions('rewards:write')
  @ApiOperation({ summary: 'Update a reward rule (bumps version + snapshots config)' })
  @ApiEnvelope(RewardRuleDto)
  update(@CurrentUser('id') adminId: string, @Param('ruleKey') ruleKey: string, @Body() dto: UpdateRewardRuleDto) {
    return this.rules.adminUpdate(ruleKey, dto, adminId);
  }
}
