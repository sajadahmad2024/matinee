import { RouteNames } from '@common/route-names';
import { ApiEnvelope } from '@common/swagger/api-envelope.decorator';
import { Body, Controller, Get, Patch, Put } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminOnly } from '../auth/decorators/account-type.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Permissions } from '../auth/decorators/permissions.decorator';
import { SettingsService } from './settings.service';
import { AppVersionDto, AppVersionSettingsDto, FeatureFlagsDto, SetFeatureFlagDto } from './dto/settings.dto';

/** Admin platform settings — feature flags + app-version gates (app_settings). */
@ApiTags('Admin · Settings')
@ApiBearerAuth()
@AdminOnly()
@Controller({ path: `${RouteNames.ADMIN}/${RouteNames.SETTINGS}`, version: '1' })
export class AdminSettingsController {
  constructor(private readonly settings: SettingsService) {}

  @Get('feature-flags')
  @Permissions('compliance:read')
  @ApiOperation({ summary: 'Get feature flags' })
  @ApiEnvelope(FeatureFlagsDto)
  flags() {
    return this.settings.featureFlags();
  }

  @Patch('feature-flags')
  @Permissions('compliance:write')
  @ApiOperation({ summary: 'Set a feature flag' })
  @ApiEnvelope(FeatureFlagsDto)
  setFlag(@CurrentUser('id') adminId: string, @Body() dto: SetFeatureFlagDto) {
    return this.settings.setFeatureFlag(dto, adminId);
  }

  @Get('app-version')
  @Permissions('compliance:read')
  @ApiOperation({ summary: 'Get app-version gates (min versions / force update / critical mode)' })
  @ApiEnvelope(AppVersionSettingsDto)
  appVersion() {
    return this.settings.appVersion();
  }

  @Put('app-version')
  @Permissions('compliance:write')
  @ApiOperation({ summary: 'Update app-version gates' })
  @ApiEnvelope(AppVersionSettingsDto)
  setAppVersion(@CurrentUser('id') adminId: string, @Body() dto: AppVersionDto) {
    return this.settings.setAppVersion(dto, adminId);
  }
}
