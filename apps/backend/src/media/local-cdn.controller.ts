import { EnvConfig } from '@config/env.config';
import { Public } from '@auth/decorators/public.decorator';
import { RouteNames } from '@common/route-names';
import { Controller, Get, Inject, NotFoundException, Param, StreamableFile, VERSION_NEUTRAL } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiExcludeController } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { STORAGE_PROVIDER } from './constants/media.constant';
import { StorageProvider } from './providers/storage.provider';

/**
 * DEV-ONLY stand-in for the CDN: serves the URLs `LocalDeliveryProvider` mints
 * (`/__local-cdn/<key>`) by streaming straight from storage. HLS keys (`…/hls/…`) come from the
 * output bucket, everything else (originals, images) from the source bucket — the same split a
 * CloudFront distribution does with two origins in cloud.
 *
 * Active only when MEDIA_DELIVERY_DRIVER=local and NODE_ENV!=production; 404s otherwise.
 * Public + unthrottled because HLS players fetch playlists/segments without our JWT. The
 * "signed" local cookies are not validated — there is no protection here, by design (dev only).
 */
@ApiExcludeController()
@Public()
@SkipThrottle()
@Controller({ path: RouteNames.LOCAL_CDN, version: VERSION_NEUTRAL })
export class LocalCdnController {
  constructor(
    @Inject(STORAGE_PROVIDER) private readonly storage: StorageProvider,
    private readonly config: ConfigService<EnvConfig>,
  ) {}

  @Get('*path')
  async serve(@Param('path') path: string | string[]): Promise<StreamableFile> {
    if (!this.enabled()) {
      throw new NotFoundException();
    }
    const key = (Array.isArray(path) ? path.join('/') : path).replace(/^\/+/, '');
    if (!key.startsWith('media/') || key.includes('..')) {
      throw new NotFoundException();
    }
    const object = await this.storage.openRead(key, key.includes('/hls/') ? 'output' : 'source');
    if (!object) {
      throw new NotFoundException();
    }
    return new StreamableFile(object.body, {
      ...(object.contentType ? { type: object.contentType } : {}),
      ...(object.contentLength !== undefined ? { length: object.contentLength } : {}),
    });
  }

  private enabled(): boolean {
    return (
      (this.config.get<string>('MEDIA_DELIVERY_DRIVER') ?? 'local') === 'local' &&
      this.config.get<string>('NODE_ENV') !== 'production'
    );
  }
}
