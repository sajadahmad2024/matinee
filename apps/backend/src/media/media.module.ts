import { EnvConfig } from '@config/env.config';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { LocalCdnController } from './local-cdn.controller';
import { MediaService } from './media.service';
import { MEDIA_DELIVERY_PROVIDER, STORAGE_PROVIDER } from './constants/media.constant';
import { StorageProvider } from './providers/storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { MediaDeliveryProvider } from './providers/delivery.provider';
import { CloudFrontDeliveryProvider } from './providers/cloudfront-delivery.provider';
import { LocalDeliveryProvider } from './providers/local-delivery.provider';

const logger = new Logger('MediaModule');

const storageProviderFactory = {
  provide: STORAGE_PROVIDER,
  useFactory: (config: ConfigService<EnvConfig>): StorageProvider => {
    const driver = config.get<string>('MEDIA_STORAGE_DRIVER') ?? 'local';
    logger.log(`Initializing media storage provider: ${driver}`);
    return driver === 's3' ? new S3StorageProvider(config) : new LocalStorageProvider(config);
  },
  inject: [ConfigService],
};

const deliveryProviderFactory = {
  provide: MEDIA_DELIVERY_PROVIDER,
  useFactory: (config: ConfigService<EnvConfig>): MediaDeliveryProvider => {
    const driver = config.get<string>('MEDIA_DELIVERY_DRIVER') ?? 'local';
    logger.log(`Initializing media delivery provider: ${driver}`);
    return driver === 'cloudfront' ? new CloudFrontDeliveryProvider(config) : new LocalDeliveryProvider(config);
  },
  inject: [ConfigService],
};

/**
 * Media module — secure upload (presigned S3 PUT), signed delivery (CloudFront). Transcoding
 * runs OUT OF PROCESS: S3 → SQS → Lambda pipeline (see infra/floci/lambda.tf +
 * docker/dummy-transcoder/). The Lambda writes HLS output to S3 and updates the media_metadata
 * row directly via pg — this NestJS process never sees the transcode work.
 */
@Module({
  imports: [ConfigModule],
  controllers: [MediaController, LocalCdnController],
  providers: [MediaService, storageProviderFactory, deliveryProviderFactory],
  exports: [MediaService, STORAGE_PROVIDER, MEDIA_DELIVERY_PROVIDER],
})
export class MediaModule {}
