import { Module } from '@nestjs/common';
import { AdminSettingsController } from './admin-settings.controller';
import { SettingsService } from './settings.service';

/**
 * Platform module — admin platform settings (feature flags + app-version gates) over the
 * app_settings key/value store. The mobile app reads version gates on launch; feature flags
 * toggle major capabilities.
 */
@Module({
  controllers: [AdminSettingsController],
  providers: [SettingsService],
})
export class PlatformModule {}
