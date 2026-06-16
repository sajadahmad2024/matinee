import { EnvConfig } from '@config/env.config';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MediaController } from './media.controller';
import { MediaService } from './media.service';
import { MEDIA_DELIVERY_PROVIDER, STORAGE_PROVIDER, TRANSCODER_PROVIDER } from './constants/media.constant';
import { StorageProvider } from './providers/storage.provider';
import { S3StorageProvider } from './providers/s3-storage.provider';
import { LocalStorageProvider } from './providers/local-storage.provider';
import { MediaDeliveryProvider } from './providers/delivery.provider';
import { CloudFrontDeliveryProvider } from './providers/cloudfront-delivery.provider';
import { LocalDeliveryProvider } from './providers/local-delivery.provider';
import { TranscoderProvider } from './providers/transcoder.provider';
import { MediaConvertTranscoder } from './providers/mediaconvert-transcoder.provider';
import { LocalTranscoder } from './providers/local-transcoder.provider';

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

const transcoderProviderFactory = {
  provide: TRANSCODER_PROVIDER,
  useFactory: (config: ConfigService<EnvConfig>): TranscoderProvider => {
    const driver = config.get<string>('MEDIA_TRANSCODER') ?? 'local';
    logger.log(`Initializing media transcoder: ${driver}`);
    return driver === 'mediaconvert' ? new MediaConvertTranscoder(config) : new LocalTranscoder();
  },
  inject: [ConfigService],
};

/**
 * Independent media module: secure upload (presigned), HLS transcode (MediaConvert),
 * and signed delivery (CloudFront). Other modules associate assets by `id` only.
 * Storage/delivery/transcoder are env-selected (local for dev, AWS in cloud).
 */
@Module({
  imports: [ConfigModule],
  controllers: [MediaController],
  providers: [MediaService, storageProviderFactory, deliveryProviderFactory, transcoderProviderFactory],
  exports: [MediaService, STORAGE_PROVIDER, MEDIA_DELIVERY_PROVIDER, TRANSCODER_PROVIDER],
})
export class MediaModule {}
