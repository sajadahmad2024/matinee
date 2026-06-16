import { Injectable } from '@nestjs/common';
import { AppSettingsRepository } from '@db/repositories/platform/app-settings.repository';
import { AppVersionDto, SetFeatureFlagDto } from './dto/settings.dto';

const APP_VERSION_KEYS: Record<keyof AppVersionDto, string> = {
  iosMinVersion: 'app.ios_min_version',
  androidMinVersion: 'app.android_min_version',
  forceUpdate: 'app.force_update',
  criticalMode: 'app.critical_mode',
};

@Injectable()
export class SettingsService {
  constructor(private readonly settings: AppSettingsRepository) {}

  async featureFlags(): Promise<Record<string, unknown>> {
    const rows = await this.settings.listByCategory('feature_flag');
    return Object.fromEntries(rows.map((r) => [r.key, r.value]));
  }

  async setFeatureFlag(dto: SetFeatureFlagDto, adminId: string): Promise<Record<string, unknown>> {
    const key = dto.key.startsWith('feature.') ? dto.key : `feature.${dto.key}`;
    await this.settings.upsert(key, dto.value, 'feature_flag', adminId);
    return this.featureFlags();
  }

  async appVersion(): Promise<Record<string, unknown>> {
    const rows = await this.settings.listByCategory('app_version');
    return Object.fromEntries(rows.map((r) => [r.key.replace('app.', ''), r.value]));
  }

  async setAppVersion(dto: AppVersionDto, adminId: string): Promise<Record<string, unknown>> {
    for (const field of Object.keys(APP_VERSION_KEYS) as (keyof AppVersionDto)[]) {
      if (dto[field] !== undefined) {
        await this.settings.upsert(APP_VERSION_KEYS[field], dto[field], 'app_version', adminId);
      }
    }
    return this.appVersion();
  }
}
