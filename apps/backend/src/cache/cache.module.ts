import { EnvConfig } from '@config/env.config';
import { Global, Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Cluster, Redis, RedisOptions } from 'ioredis';
import { CACHE_CLIENT } from './cache.constant';
import { CacheService } from './cache.service';

/**
 * Cache client provider.
 *
 * Same compiled code for local Redis and AWS ElastiCache — only env differs:
 *   local  → REDIS_HOST=127.0.0.1, REDIS_TLS_ENABLED=false, CACHE_CLUSTER_ENABLED=false
 *   prod   → REDIS_HOST=<elasticache-endpoint>, REDIS_TLS_ENABLED=true, CACHE_CLUSTER_ENABLED=true
 */
const cacheClientProvider: Provider = {
  provide: CACHE_CLIENT,
  useFactory: (config: ConfigService<EnvConfig>): Redis | Cluster => {
    const host = config.get<string>('REDIS_HOST') ?? '127.0.0.1';
    const port = config.get<number>('REDIS_PORT') ?? 6379;
    const password = config.get<string>('REDIS_PASSWORD');
    // Coerce robustly: env may resolve as a real boolean or as a raw string.
    const tlsEnabled = String(config.get('REDIS_TLS_ENABLED')) === 'true';
    const clusterEnabled = String(config.get('CACHE_CLUSTER_ENABLED')) === 'true';

    const options: RedisOptions = { host, port, maxRetriesPerRequest: 2 };
    if (password) {
      options.password = password;
    }
    if (tlsEnabled) {
      options.tls = {};
    }

    if (clusterEnabled) {
      return new Cluster([{ host, port }], {
        redisOptions: {
          ...(password ? { password } : {}),
          ...(tlsEnabled ? { tls: {} } : {}),
        },
      });
    }

    return new Redis(options);
  },
  inject: [ConfigService],
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [cacheClientProvider, CacheService],
  exports: [CacheService, CACHE_CLIENT],
})
export class CacheModule {}
